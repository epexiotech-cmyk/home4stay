import fs from "fs";
import path from "path";
import { PropertyMap } from "@home4stay/data";
import sharp from "sharp";
import { AppError } from "@/lib/errors/handler";
import { propertyRepository } from '../repositories/propertyRepository';

const dataFilePath = path.join(process.cwd(), "../../packages/data/property.json");

export class PropertyMediaService {
  async getMediaAssets(propertyId: string) {
    return await propertyRepository.findMediaByPropertyId(propertyId);
  }

  async uploadAndOptimizeImage(slug: string, imageUrl: string) {
    // 1. READ DATA
    let data: PropertyMap = {};
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    data = JSON.parse(raw);

    // 2. FIND PROPERTY
    if (!data[slug]) {
      throw new AppError("Property not found", 404, "NOT_FOUND");
    }

    // 3. IMAGE COUNT LIMIT
    if (data[slug].images && data[slug].images.length >= 10) {
      throw new AppError("Maximum 10 images allowed per property", 400, "BAD_REQUEST");
    }

    // 4. FETCH IMAGE WITH SAFETY
    let buffer: Buffer;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      // 5. MIME TYPE VALIDATION
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new AppError("Invalid file type. Only images are allowed.", 400, "BAD_REQUEST");
      }

      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      // 6. FILE SIZE LIMIT (5MB)
      if (buffer.byteLength > 5 * 1024 * 1024) {
        throw new AppError("Image too large. Max size 5MB allowed.", 400, "BAD_REQUEST");
      }

    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.error("Fetch/Safety Error:", err);
      throw new AppError("Invalid image URL or the server is unreachable.", 400, "BAD_REQUEST");
    }

    // 7. PROCESS AND SAVE
    try {
      // Setup directories
      const uploadDir = path.join(process.cwd(), "public/uploads", slug);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate filename
      const imageNumber = (data[slug].images?.length || 0) + 1;
      const fileName = `image-${imageNumber}.webp`;
      const fullPath = path.join(uploadDir, fileName);
      const publicPath = `/uploads/${slug}/${fileName}`;

      // OPTIMIZATION PIPELINE
      await sharp(buffer)
        .resize(1920, 1080, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(fullPath);

      // 8. PUSH LOCAL PATH TO JSON
      if (!data[slug].images) data[slug].images = [];
      data[slug].images.push(publicPath);

      // 9. ATOMIC SECURE WRITE
      const tempPath = dataFilePath + ".tmp";
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, dataFilePath);

      return { message: "Image optimized and added successfully", path: publicPath };
    } catch (err: any) {
      console.error("Sharp Processing Error:", err);
      throw new AppError("Could not process image. Please try a different link.", 500, "INTERNAL_SERVER_ERROR");
    }
  }
}

export const propertyMediaService = new PropertyMediaService();
