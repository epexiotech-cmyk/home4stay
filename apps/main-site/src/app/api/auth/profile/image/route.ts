import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { requireRole } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const { authorized, userId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
    
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // 4. Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Setup directory
    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 6. Generate secure filename
    const fileName = `avatar-${userId}-${Date.now()}.webp`;
    const fullPath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/avatars/${fileName}`;

    // 7. Process image with Sharp
    await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(fullPath);

    return NextResponse.json({ 
      message: "Image uploaded successfully", 
      url: publicPath 
    });

  } catch (error) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
