import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/database/prisma";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { z } from "zod";

const ExperienceSchema = z.object({
  propertyId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  isComplimentary: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  duration: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  requiresScheduling: z.boolean().default(false),
  availabilityType: z.string().default("always"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    // STRICT MULTI-TENANT ISOLATION CHECK
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    const experiences = await db.propertyExperience.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("GET Experiences Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ExperienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // STRICT MULTI-TENANT ISOLATION CHECK on the requested propertyId
    const auth = await requirePropertyAccess(request, data.propertyId);
    if (!auth.authorized) return auth.response!;

    // Role check: Only partners/owners or managers or admins can modify experiences
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const experience = await db.propertyExperience.create({
      data: {
        ...data,
      }
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("Create Experience Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const exp = await db.propertyExperience.findUnique({ where: { id } });
    if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // STRICT MULTI-TENANT ISOLATION CHECK based on active experience propertyId
    const auth = await requirePropertyAccess(request, exp.propertyId);
    if (!auth.authorized) return auth.response!;

    // Role check
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const updated = await db.propertyExperience.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH Experience Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const exp = await db.propertyExperience.findUnique({ where: { id } });
    if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // STRICT MULTI-TENANT ISOLATION CHECK based on active experience propertyId
    const auth = await requirePropertyAccess(request, exp.propertyId);
    if (!auth.authorized) return auth.response!;

    // Role check
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    await db.propertyExperience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Experience Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
