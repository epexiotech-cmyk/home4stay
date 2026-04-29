import fs from "fs";
import { NextResponse, NextRequest } from "next/server";
import path from "path";
import { PropertyMap } from "@home4stay/data";
import { jwtVerify } from "jose";
import { z } from "zod";
import { validateCsrf, auditLog } from "@/lib/security";

const isDev = process.env.NODE_ENV !== "production";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

const PropertySchema = z.object({
  name: z.string().min(3).max(100),
  location: z.string().min(3),
  price: z.number().positive(),
});

const filePath = path.join(process.cwd(), "../../packages/data/property.json");

export async function POST(request: NextRequest) {
  try {
    // 1. CSRF VALIDATION
    if (!validateCsrf(request)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    // 2. AUTHENTICATION (Hard Gate)
    const token = request.cookies.get('access-token')?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let user: { username: string; role: string } | null = null;
    try {
      const { payload } = await jwtVerify(token, encodedSecret, { issuer: "home4stay", audience: "web" }) as { payload: { username: string; role: string } };
      user = payload;
      if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // 3. INPUT VALIDATION
    const body = await request.json();
    const validation = PropertySchema.safeParse(body);
    if (!validation.success) {
      if (isDev) console.log("❌ Property Validation Failed:", validation.error.format());
      return NextResponse.json({ 
        message: "Invalid input data", 
        error: isDev ? validation.error.format() : undefined 
      }, { status: 400 });
    }

    const { name, location, price } = validation.data;

    // 4. DATA PROCESSING
    let data: PropertyMap = {};
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        data = raw ? JSON.parse(raw) : {};
      }
    } catch {
      data = {};
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    let finalSlug = slug;
    let counter = 1;
    while (data[finalSlug]) {
      finalSlug = `${slug}-${counter++}`;
    }

    data[finalSlug] = {
      name,
      location,
      price,
      rating: 4.5,
      guests: "0+",
      description: `New property: ${name}`,
      createdAt: new Date().toISOString(),
      images: [],
      rooms: []
    };

    const tempPath = filePath + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, filePath);

    auditLog(user.username, user.role, 'CREATE_PROPERTY', { slug: finalSlug });

    return NextResponse.json({ success: true, slug: finalSlug }, { status: 201 });
  } catch (err) {
    if (isDev) console.warn("Property API Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
