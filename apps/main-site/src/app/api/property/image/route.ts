import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PropertyMap } from "@home4stay/data";
import sharp from "sharp";

const dataFilePath = path.join(process.cwd(), "../../packages/data/property.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, imageUrl } = body;

    if (!slug || !imageUrl) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // 1. READ DATA
    let data: PropertyMap = {};
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    data = JSON.parse(raw);

    // 2. FIND PROPERTY
    if (!data[slug]) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    // 3. IMAGE COUNT LIMIT
    if (data[slug].images && data[slug].images.length >= 10) {
      return NextResponse.json({ message: "Maximum 10 images allowed per property" }, { status: 400 });
    }

    // 4. FETCH IMAGE WITH SAFETY
    let buffer: Buffer;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      // 5. MIME TYPE VALIDATION
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        return NextResponse.json({ message: "Invalid file type. Only images are allowed." }, { status: 400 });
      }

      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      // 6. FILE SIZE LIMIT (5MB)
      if (buffer.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Image too large. Max size 5MB allowed." }, { status: 400 });
      }

    } catch (err) {
      console.error("Fetch/Safety Error:", err);
      return NextResponse.json({ message: "Invalid image URL or the server is unreachable." }, { status: 400 });
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

      return NextResponse.json({ 
        message: "Image optimized and added successfully", 
        path: publicPath 
      }, { status: 201 });

    } catch (err) {
      console.error("Sharp Processing Error:", err);
      return NextResponse.json({ message: "Could not process image. Please try a different link." }, { status: 500 });
    }

  } catch (err) {
    console.error("Global Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
