import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

interface Lead {
  name: string;
  phone: string;
  property: string;
  location: string;
  time: string;
}

const filePath = path.join(process.cwd(), "src/data/leads.json");

// Ensure data directory exists
const dirPath = path.dirname(filePath);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, property, location } = body;

    // 1. BASIC RATE LIMIT / VALIDATION
    if (!name || !phone || name.trim().length < 2 || phone.trim().length < 10) {
      return NextResponse.json(
        { message: "Invalid data. Please check all fields." },
        { status: 400 }
      );
    }

    // 2. SAFE READ (Handle empty/corrupted file)
    let existingLeads: Lead[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      existingLeads = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Error reading leads file, starting fresh:", err);
      existingLeads = [];
    }

    // 3. DUPLICATE LEAD PREVENTION
    const isDuplicate = existingLeads.some(
      (lead: Lead) => lead.phone === phone && lead.property === property
    );

    if (isDuplicate) {
      return NextResponse.json(
        { message: "Request already submitted for this property.", success: true },
        { status: 200 }
      );
    }

    // 4. PREPARE LEAD
    const newLead = {
      name: name.trim(),
      phone: phone.trim(),
      property: property.trim(),
      location: location.trim(),
      time: new Date().toISOString(),
    };

    existingLeads.push(newLead);

    // 5. SORT LEADS (Newest on top)
    existingLeads.sort(
      (a: Lead, b: Lead) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    // 6. ATOMIC SECURE WRITE (Write to temp then rename)
    const tempPath = filePath + ".tmp";
    try {
      fs.writeFileSync(tempPath, JSON.stringify(existingLeads, null, 2));
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error("Critical Error saving lead atomically:", err);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); // Clean up temp file
      return NextResponse.json(
        { message: "Server error while saving lead.", success: false },
        { status: 500 }
      );
    }

    // LOG DATA CLEARLY
    console.log("🔥 NEW LEAD SAVED:", newLead);

    return NextResponse.json({ message: "Success", success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
