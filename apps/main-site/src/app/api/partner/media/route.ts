import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

// Configure Cloudinary SDK from active environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * GET /api/partner/media
 * Retrieves all media assets registered to this property sorted by sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId || !auth.propertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await prisma.mediaAsset.findMany({
      where: { propertyId: auth.propertyId },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("[PARTNER_MEDIA_GET] Error fetching CDN assets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/partner/media
 * Uploads visual assets directly to property-isolated folders on Cloudinary and persists metadata in database
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId || !auth.propertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assetType = (formData.get("assetType") as string) || "GALLERY";

    if (!file) {
      return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
    }

    // 1. Enforce size bounds
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds standard 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // 2. Enforce Whitelisted MIME Formats
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format: ${file.type}. Please upload JPEG, PNG, WebP, or GIF` },
        { status: 400 }
      );
    }

    // 3. Convert ArrayBuffer file to secure base64 string
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${fileBuffer.toString("base64")}`;

    // 4. Resolve isolated tenant folder slug in Cloudinary
    const propertySlug = auth.propertySlug || auth.propertyId;
    const folderPath = `home4stay/properties/${propertySlug}`;

    // 5. Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      folder: folderPath,
      resource_type: "image",
      overwrite: true,
      invalidate: true
    });

    if (!result || !result.secure_url) {
      throw new Error("Failed to retrieve upload metadata from Cloudinary");
    }

    // 6. Calculate next sort index
    const count = await prisma.mediaAsset.count({
      where: { propertyId: auth.propertyId }
    });

    // 7. Write record into MediaAsset model
    const asset = await prisma.mediaAsset.create({
      data: {
        propertyId: auth.propertyId,
        type: "image",
        url: result.secure_url, // Store Cloudinary Secure CDN URL
        assetType: assetType.toUpperCase(),
        fileName: file.name,
        storageKey: result.public_id, // Store Cloudinary Public ID to allow future purges
        mimeType: result.format || file.type,
        fileSize: result.bytes || file.size,
        width: result.width || 800,
        height: result.height || 600,
        sortOrder: count + 1
      }
    });

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error("[PARTNER_MEDIA_POST] Cloudinary Upload Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to upload asset to Cloudinary";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/**
 * PUT /api/partner/media
 * Reorders property-isolated media assets inside PostgreSQL
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId || !auth.propertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid array payload" }, { status: 400 });
    }

    // Tenant Isolation Check: Verify that all requested asset IDs belong strictly to this property
    const assets = await prisma.mediaAsset.findMany({
      where: {
        id: { in: ids },
        propertyId: auth.propertyId
      },
      select: { id: true }
    });

    if (assets.length !== ids.length) {
      return NextResponse.json({ error: "Access denied: Cross-property mutation detected" }, { status: 403 });
    }

    // Sequence updates
    await Promise.all(
      ids.map((id, index) =>
        prisma.mediaAsset.update({
          where: { id },
          data: { sortOrder: index }
        })
      )
    );

    return NextResponse.json({ success: true, message: "Asset ordering saved successfully" });
  } catch (error) {
    console.error("[PARTNER_MEDIA_PUT] Error saving reordered media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/partner/media
 * Safely removes db record and unlinks asset from Cloudinary CDN servers
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId || !auth.propertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing asset identification parameter" }, { status: 400 });
    }

    // Verify ownership and fetch key details
    const asset = await prisma.mediaAsset.findFirst({
      where: { id, propertyId: auth.propertyId }
    });

    if (!asset) {
      return NextResponse.json({ error: "Forbidden: Media asset not found" }, { status: 404 });
    }

    // 1. Purge asset from Cloudinary servers instantly using stored public_id
    if (asset.storageKey) {
      try {
        const destroyResult = await cloudinary.uploader.destroy(asset.storageKey, {
          invalidate: true
        });
        if (destroyResult.result !== "ok" && destroyResult.result !== "not found") {
          console.warn(`[PARTNER_MEDIA_DELETE] Cloudinary did not return positive destroy status:`, destroyResult);
        }
      } catch (cloudinaryError) {
        const errMsg = cloudinaryError instanceof Error ? cloudinaryError.message : "unknown error";
        console.error(`[PARTNER_MEDIA_DELETE] Failed to delete image from Cloudinary: ${asset.storageKey}`, errMsg);
      }
    }

    // 2. Remove database record
    await prisma.mediaAsset.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Asset removed successfully from Cloudinary and database" });
  } catch (error) {
    console.error("[PARTNER_MEDIA_DELETE] Error purging asset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
