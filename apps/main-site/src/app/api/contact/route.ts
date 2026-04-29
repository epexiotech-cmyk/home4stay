import fs from "fs";
import { NextResponse, NextRequest } from "next/server";
import path from "path";
import { z } from "zod";
import { rateLimit, auditLog } from "@/lib/security";

const isDev = process.env.NODE_ENV !== "production";

const ContactSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  property: z.string(),
  location: z.string(),
});

const filePath = path.join(process.cwd(), "src/data/leads.json");

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate Limiting
  if (!rateLimit(ip, 3)) {
    return NextResponse.json({ message: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const body = await request.json();

    // 2. Input Validation
    const validation = ContactSchema.safeParse(body);
    if (!validation.success) {
      if (isDev) console.log("❌ Validation Error:", validation.error.format());
      return NextResponse.json({ 
        message: "Invalid form data", 
        error: isDev ? validation.error.format() : undefined 
      }, { status: 400 });
    }

    const { name, phone, property, location } = validation.data;

    // 3. READ DATA (Safe JSON Parsing)
    let existingLeads = [];
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        existingLeads = raw ? JSON.parse(raw) : [];
      }
    } catch {
      existingLeads = [];
    }

    // 4. ARRAY SAFETY
    if (!Array.isArray(existingLeads)) existingLeads = [];

    // 5. DUPLICATE CHECK
    const isDuplicate = existingLeads.some((l: { phone: string; property: string }) => l.phone === phone && l.property === property);
    if (isDuplicate) {
      return NextResponse.json({ message: "Request already submitted", success: true }, { status: 200 });
    }

    // 6. SAVE
    const newLead = { name, phone, property, location, time: new Date().toISOString() };
    existingLeads.unshift(newLead);

    const tempPath = filePath + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(existingLeads, null, 2));
    fs.renameSync(tempPath, filePath);

    auditLog('public', 'guest', 'CONTACT_FORM_SUBMITTED', { property, ip });

    return NextResponse.json({ message: "Success", success: true }, { status: 200 });
  } catch (err) {
    if (isDev) console.warn("Contact API Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
