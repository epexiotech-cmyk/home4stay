import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { MediaRepository } from "@/lib/repositories/mediaRepository";
import { PropertyRepository } from "@/lib/repositories/propertyRepository";
import { AppError } from "@/lib/errors/handler";
import { prisma } from "@/lib/database/prisma"; // Keeping prisma for count and findMany directly, or move to MediaRepository

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class PartnerMediaService {
  static async getMedia(propertyId: string) {
    if (!propertyId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    return prisma.mediaAsset.findMany({
      where: { propertyId },
      orderBy: { sortOrder: "asc" }
    });
  }

  static async uploadMedia(payload: {
    propertyId: string;
    propertySlug?: string;
    userId: string;
    file: File | null;
    assetType: string;
  }) {
    const { propertyId, propertySlug, userId, file, assetType } = payload;

    if (!file) {
      throw new AppError("Missing file payload", 400, "BAD_REQUEST");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(`File size exceeds standard 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 400, "BAD_REQUEST");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new AppError(`Unsupported image format: ${file.type}. Please upload JPEG, PNG, WebP, or GIF`, 400, "BAD_REQUEST");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let finalBuffer: Buffer | null = null;
    const finalMimeType = "image/webp";

    try {
      // --- Image Processing via sharp ---
      const isHero = assetType === "HERO";
      const targetWidth = isHero ? 1920 : 1080;
      const targetHeight = isHero ? 1080 : 720;
      
      const TARGET_SIZE_BYTES = 50 * 1024; // 50 KB
      const qualitySteps = [75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];
      const QUALITY_FLOOR = 20;

      // Base resize instance
      const sharpInstance = sharp(fileBuffer).resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true
      });

      console.log(`[PARTNER_MEDIA_SERVICE] Uploading ${file.name}. Original size: ${(fileBuffer.length / 1024).toFixed(2)} KB. Target: ${targetWidth}x${targetHeight}`);

      let selectedQuality = qualitySteps[0];
      for (const quality of qualitySteps) {
        selectedQuality = quality;
        const testBuffer = await sharpInstance
          .clone()
          .webp({ quality, effort: 4 })
          .toBuffer();

        finalBuffer = testBuffer;

        if (testBuffer.length <= TARGET_SIZE_BYTES) {
          break; // Found optimal compression
        }
      }

      const achievedTarget = finalBuffer!.length <= TARGET_SIZE_BYTES;
      console.log(`[PARTNER_MEDIA_SERVICE] ${file.name} compressed. Quality used: ${selectedQuality}. Final size: ${(finalBuffer!.length / 1024).toFixed(2)} KB. Achieved 50KB target: ${achievedTarget}`);

      if (!achievedTarget) {
        throw new AppError(`The image could not be optimized to the 50 KB target without degrading visual quality below the acceptable floor. Final size was ${(finalBuffer!.length / 1024).toFixed(2)} KB.`, 400, "BAD_REQUEST");
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn("[PARTNER_MEDIA_SERVICE] Sharp processing failed:", err);
      throw new AppError("Failed to process image. Ensure the image is valid and not corrupted.", 400, "BAD_REQUEST");
    }

    if (!finalBuffer) {
      throw new AppError("Image processing failed completely", 500, "INTERNAL_SERVER_ERROR");
    }

    const resolvedSlug = propertySlug || propertyId;
    const folderPath = `home4stay/properties/${resolvedSlug}`;

    // Cloudinary Stream Upload
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: "image",
          overwrite: true,
          invalidate: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(finalBuffer);
    });

    if (!result || !result.secure_url) {
      throw new AppError("Failed to retrieve upload metadata from Cloudinary", 500, "INTERNAL_SERVER_ERROR");
    }

    const count = await prisma.mediaAsset.count({
      where: { propertyId }
    });

    const asset = await MediaRepository.createMediaAsset({
      propertyId,
      url: result.secure_url,
      type: "image",
      assetType: assetType || "GALLERY",
      fileName: file.name,
      mimeType: finalMimeType,
      fileSize: finalBuffer.length,
      storageKey: result.public_id,
      tags: `Partner Upload, ${assetType}`,
      uploadedBy: userId,
      width: result.width,
      height: result.height,
      sortOrder: count,
      blurData: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" 
    });

    return asset;
  }


  static async uploadRawDocument(payload: {
    propertyId: string;
    propertySlug?: string;
    userId: string;
    file: File | null;
    assetType: string;
  }) {
    const { propertyId, propertySlug, userId, file, assetType } = payload;

    if (!file) {
      throw new AppError("Missing file payload", 400, "BAD_REQUEST");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(`File size exceeds 5MB limit`, 400, "BAD_REQUEST");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const resolvedSlug = propertySlug || propertyId;
    const folderPath = `home4stay/agreements/${resolvedSlug}`;

    // Cloudinary Stream Upload
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: "auto", // supports pdf, image, etc.
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(fileBuffer);
    });

    if (!result || !result.secure_url) {
      throw new AppError("Failed to retrieve upload metadata from Cloudinary", 500, "INTERNAL_SERVER_ERROR");
    }

    // For agreements we do not necessarily need to create a MediaAsset record
    // We just return the secure_url so the Agreement service can store it
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format
    };
  }

  static async reorderMedia(propertyId: string, ids: string[]) {
    if (!Array.isArray(ids)) {
      throw new AppError("Invalid array payload", 400, "BAD_REQUEST");
    }

    const assets = await prisma.mediaAsset.findMany({
      where: {
        id: { in: ids },
        propertyId
      },
      select: { id: true }
    });

    if (assets.length !== ids.length) {
      throw new AppError("Access denied: Cross-property mutation detected", 403, "FORBIDDEN");
    }

    await Promise.all(
      ids.map((id, index) =>
        prisma.mediaAsset.update({
          where: { id },
          data: { sortOrder: index }
        })
      )
    );

    return { success: true, message: "Asset ordering saved successfully" };
  }

  static async deletePartnerMedia(propertyId: string, mediaId: string) {
    if (!mediaId) {
      throw new AppError("Missing asset identification parameter", 400, "BAD_REQUEST");
    }

    const asset = await prisma.mediaAsset.findFirst({
      where: { id: mediaId, propertyId }
    });

    if (!asset) {
      throw new AppError("Forbidden: Media asset not found", 404, "NOT_FOUND");
    }

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

    await prisma.mediaAsset.delete({
      where: { id: mediaId }
    });

    return { success: true, message: "Asset removed successfully from Cloudinary and database" };
  }
}
