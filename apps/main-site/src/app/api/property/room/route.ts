import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PropertyMap } from "@home4stay/data";

const filePath = path.join(process.cwd(), "../../packages/data/property.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, price, capacity, view } = body;

    // 1. BASIC VALIDATION
    if (!slug || !name || !price) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // 2. NAME NORMALIZATION
    const cleanName = name.trim().replace(/\s+/g, " ");

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ message: "Invalid price. Must be positive." }, { status: 400 });
    }

    // 3. READ DATA
    let data: PropertyMap = {};
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw);

    // 4. FIND PROPERTY
    if (!data[slug]) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    // 5. DUPLICATE ROOM CHECK (With normalized name)
    const exists = data[slug].rooms.some(r => r.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return NextResponse.json({ message: "A room with this name already exists in this property" }, { status: 409 });
    }

    // 6. PUSH ROOM
    data[slug].rooms.push({
      name: cleanName,
      price: Number(price),
      capacity,
      view: view.trim(),
    });

    // 7. ATOMIC SECURE WRITE
    const tempPath = filePath + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, filePath);

    return NextResponse.json({ message: "Room added successfully" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
