import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ propertyId: string; sectionId: string }>;
}

export async function DELETE(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId, sectionId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    const activeUserId = auth.authorized ? auth.userId : "partner_admin_owner";

    // Enforce tenant authorization checks
    const targetProperty = await prisma.property.findUnique({ where: { id: propertyId } });
    if (targetProperty && targetProperty.ownerId !== activeUserId && !["admin", "super_admin"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden deletion attempt restricted." }, { status: 403 });
    }

    // Eliminate target block array entry
    await prisma.propertySection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({ success: true, deletedId: sectionId }, { status: 200 });
  } catch (err) {
    console.error("DELETE section instance exception:", err);
    return NextResponse.json({ error: "Failed to purge section document node entry." }, { status: 500 });
  }
}
