# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/lib/services/partnerMediaService.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update uploadRoomImage to handle DB failure cleanup and improve compression loop
old_compression = """      const targetWidth = 1080;
      const targetHeight = 720;
      const TARGET_SIZE_BYTES = 50 * 1024; // 50 KB
      const qualitySteps = [75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];

      const sharpInstance = sharp(fileBuffer).resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true
      });

      for (const quality of qualitySteps) {
        const testBuffer = await sharpInstance.clone().webp({ quality, effort: 4 }).toBuffer();
        finalBuffer = testBuffer;
        if (testBuffer.length <= TARGET_SIZE_BYTES) break;
      }

      if (!finalBuffer || finalBuffer.length > TARGET_SIZE_BYTES) {
        throw new AppError("The image could not be optimized to 50 KB.", 400, "BAD_REQUEST");
      }"""

new_compression = """      let targetWidth = 1080;
      let targetHeight = 720;
      const TARGET_SIZE_BYTES = 50 * 1024; // 50 KB
      const qualitySteps = [75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];
      
      let achieved = false;
      
      // Try 1080p, 800p, 600p
      const dimensions = [
        { w: 1080, h: 720 },
        { w: 800, h: 533 },
        { w: 600, h: 400 }
      ];

      for (const dim of dimensions) {
        const sharpInstance = sharp(fileBuffer).resize(dim.w, dim.h, {
          fit: "inside",
          withoutEnlargement: true
        });

        for (const quality of qualitySteps) {
          const testBuffer = await sharpInstance.clone().webp({ quality, effort: 4 }).toBuffer();
          finalBuffer = testBuffer;
          if (testBuffer.length <= TARGET_SIZE_BYTES) {
            achieved = true;
            break;
          }
        }
        if (achieved) break;
      }

      if (!finalBuffer || finalBuffer.length > TARGET_SIZE_BYTES) {
        throw new AppError("The image could not be optimized to 50 KB even after scaling down.", 400, "BAD_REQUEST");
      }"""

content = content.replace(old_compression, new_compression)

# Update uploadRoomImage DB save to handle Cloudinary cleanup on fail
old_db_save = """    const asset = await MediaRepository.createMediaAsset({
      propertyId,
      url: result.secure_url,
      type: "image",
      assetType: "ROOM_IMAGE",
      fileName: file.name,
      mimeType: finalMimeType,
      fileSize: finalBuffer.length,
      storageKey: result.public_id,
      tags: `Partner Upload, ROOM_IMAGE, room_id:${roomId}`,
      uploadedBy: userId,
      width: result.width,
      height: result.height,
      sortOrder: existingImages.length,
      blurData: "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
    });

    await prisma.room.update({
      where: { id: roomId },
      data: {
        images: [...existingImages, result.secure_url]
      }
    });

    return asset;"""

new_db_save = """    try {
      const asset = await MediaRepository.createMediaAsset({
        propertyId,
        url: result.secure_url,
        type: "image",
        assetType: "ROOM_IMAGE",
        fileName: file.name,
        mimeType: finalMimeType,
        fileSize: finalBuffer.length,
        storageKey: result.public_id,
        tags: `Partner Upload, ROOM_IMAGE, room_id:${roomId}`,
        uploadedBy: userId,
        width: result.width,
        height: result.height,
        sortOrder: existingImages.length,
        blurData: "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
      });

      await prisma.room.update({
        where: { id: roomId },
        data: {
          images: [...existingImages, result.secure_url]
        }
      });

      return asset;
    } catch (dbErr) {
      // Cleanup Cloudinary on DB fail
      try {
        await cloudinary.uploader.destroy(result.public_id, { invalidate: true });
      } catch (e) {
        console.error("[PARTNER_MEDIA_SERVICE] Failed to cleanup Cloudinary asset after DB error", e);
      }
      throw new AppError("Failed to save image metadata to database", 500, "INTERNAL_SERVER_ERROR");
    }"""

content = content.replace(old_db_save, new_db_save)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched PartnerMediaService")
