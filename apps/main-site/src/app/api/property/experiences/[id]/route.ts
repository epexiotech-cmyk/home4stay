import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { z } from "zod";

const UpdateExperienceSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().nonnegative().optional(),
  isComplimentary: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  duration: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  requiresScheduling: z.boolean().optional(),
  availabilityType: z.string().optional(),
  customAvailability: z.any().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch existing experience to check properties mapping
    const existing = await prisma.propertyExperience.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    // 2. STRICT TENANT ISOLATION CHECK
    const auth = await requirePropertyAccess(request, existing.propertyId);
    if (!auth.authorized) return auth.response!;

    // 3. Role check: Only partners/owners, managers, or admins can update experiences
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const body = await request.json();
    const validation = UpdateExperienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const updated = await prisma.propertyExperience.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Experience Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch existing experience
    const existing = await prisma.propertyExperience.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    // 2. STRICT TENANT ISOLATION CHECK
    const auth = await requirePropertyAccess(request, existing.propertyId);
    if (!auth.authorized) return auth.response!;

    // 3. Role check: Only partners/owners, managers, or admins can delete experiences
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    await prisma.propertyExperience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Experience Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
