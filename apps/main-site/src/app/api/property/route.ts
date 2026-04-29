import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PropertyMap } from "@home4stay/data";

const filePath = path.join(process.cwd(), "../../packages/data/property.json");

// Helper to standardize display text with ultimate precision
const smallWords = ["and", "or", "of", "in", "at", "to", "for", "the", "a", "an"];
const acronyms = ["HP", "UK", "USA", "UAE"];

function toSmartTitleCase(str: string) {
  // Split by whitespace but keep the spaces in the array to preserve exact spacing/punctuation context
  return str
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, i) => {
      // 0. If it's just whitespace, return as is
      if (/^\s+$/.test(word)) return word;
      if (!word) return word;

      // 1. Handle Numbers + Units (e.g., "3bhk" -> "3BHK")
      if (/^\d+[a-z]+$/i.test(word)) return word.toUpperCase();

      // 2. Check for Acronyms
      const upperWord = word.toUpperCase();
      if (acronyms.includes(upperWord)) return upperWord;

      // 3. Skip Small Words (unless it's the first word of the string)
      // i === 0 is the first element (which could be the first word)
      if (i !== 0 && smallWords.includes(word)) return word;

      // 4. Handle Hyphenated Words (e.g., "eco-friendly")
      return word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
    })
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, price } = body;

    // 1. BASIC VALIDATION
    if (!name || !location || !price || name.trim().length < 3) {
      return NextResponse.json(
        { message: "Invalid data. Name must be at least 3 characters." },
        { status: 400 }
      );
    }

    // 2. INPUT NORMALIZATION & SMART TITLE CASING
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedLocation = location.trim().replace(/\s+/g, " ");
    
    const cleanName = toSmartTitleCase(normalizedName);
    const cleanLocation = toSmartTitleCase(normalizedLocation);

    // 3. PRICE VALIDATION
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { message: "Invalid price. Must be a positive number." },
        { status: 400 }
      );
    }

    // 4. SLUG HARDENING (Based on normalized name)
    const baseSlug = normalizedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Replace multiple hyphens with single one

    // 5. SAFE READ
    let data: PropertyMap = {};
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("Error reading properties file:", err);
      data = {};
    }

    // 6. SLUG COLLISION HANDLING (Auto-increment)
    let finalSlug = baseSlug;
    let counter = 1;
    while (data[finalSlug]) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 7. ADD NEW PROPERTY
    data[finalSlug] = {
      name: cleanName,
      location: cleanLocation,
      price: Number(price),
      rating: 4.5,
      guests: "0+",
      description: `Luxury stay at ${cleanName}`,
      createdAt: new Date().toISOString(),
      rooms: [
        {
          name: "Standard Room",
          price: Number(price),
          capacity: "2 Guests",
          view: "City View"
        }
      ]
    };

    // 8. ATOMIC SECURE WRITE
    const tempPath = filePath + ".tmp";
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error("Critical Error saving property atomically:", err);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return NextResponse.json(
        { message: "Server error while saving property.", success: false },
        { status: 500 }
      );
    }

    console.log("🚀 NEW PROPERTY CREATED:", { slug: finalSlug, name: cleanName, time: data[finalSlug].createdAt });

    return NextResponse.json({ message: "Success", success: true, slug: finalSlug }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
