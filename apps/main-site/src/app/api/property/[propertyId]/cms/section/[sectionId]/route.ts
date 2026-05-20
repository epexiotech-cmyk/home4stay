import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requirePropertyAccess } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ propertyId: string; sectionId: string }>;
}

export async function DELETE(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId, sectionId } = resolvedParams;

    // 1. STRICT AUTH & TENANT ISOLATION CHECK against PostgreSQL junction table
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    // 2. Role permission check (Only partners/owners, managers, or admins can delete CMS sections)
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    // 3. Eliminate target block array entry
    await prisma.propertySection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({ success: true, deletedId: sectionId }, { status: 200 });
  } catch (err) {
    console.error("DELETE section instance exception:", err);
    return NextResponse.json({ error: "Failed to purge section document node entry." }, { status: 500 });
  }
}
