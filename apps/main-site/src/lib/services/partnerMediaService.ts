import { v2 as cloudinary } from "cloudinary";
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
    const base64File = `data:${file.type};base64,${fileBuffer.toString("base64")}`;

    const resolvedSlug = propertySlug || propertyId;
    const folderPath = `home4stay/properties/${resolvedSlug}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: folderPath,
      resource_type: "image",
      overwrite: true,
      invalidate: true
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
      tags: `Partner Upload, ${assetType}`,
      uploadedBy: userId,
      width: result.width,
      height: result.height,
      sortOrder: count,
      blurData: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" 
    });

    return asset;
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
