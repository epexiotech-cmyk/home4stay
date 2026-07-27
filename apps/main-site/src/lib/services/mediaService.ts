import { MediaRepository } from "@/lib/repositories/mediaRepository";
import { AppError } from "@/lib/errors/handler";

export class MediaService {
  static async uploadMedia(payload: {
    propertyId: string;
    fileBase64?: string;
    fileName?: string;
    tags?: string;
    activeUserId: string;
  }) {
    if (!payload.propertyId) {
      throw new AppError("Missing required property linkage key.", 400, "BAD_REQUEST");
    }

    const finalAssetUrl = payload.fileBase64?.startsWith("data:") 
      ? payload.fileBase64 
      : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";

    const newMedia = await MediaRepository.createMediaAsset({
      propertyId: payload.propertyId,
      url: finalAssetUrl,
      type: payload.fileName?.endsWith(".mp4") ? "video" : "image",
      tags: payload.tags || "Custom Asset, Uploaded",
      uploadedBy: payload.activeUserId,
      width: 1200,
      height: 800,
      blurData: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
    });

    return newMedia;
  }

  static async deleteMedia(mediaId: string) {
    const asset = await MediaRepository.findById(mediaId);

    if (!asset) {
      throw new AppError("Media asset not found", 404, "NOT_FOUND");
    }

    await MediaRepository.deleteById(mediaId);
    return { success: true, deletedId: mediaId, propertyId: asset.propertyId };
  }
  
  static async findById(mediaId: string) {
    return MediaRepository.findById(mediaId);
  }
}
