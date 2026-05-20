import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requirePropertyAccess } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ mediaId: string }>;
}

export async function DELETE(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { mediaId } = resolvedParams;

    // 1. Fetch asset first to resolve property context
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId }
    });

    if (!asset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    // 2. STRICT TENANT ISOLATION CHECK against PostgreSQL junction table
    const auth = await requirePropertyAccess(request, asset.propertyId);
    if (!auth.authorized) return auth.response!;

    // 3. Role check: Only partners/owners, managers, or admins can delete media assets
    if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    // Purge target record
    await prisma.mediaAsset.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true, deletedId: mediaId }, { status: 200 });
  } catch (error) {
    console.error("Purging media asset failed:", error);
    return NextResponse.json({ error: "Storage file purging instruction sequence failed." }, { status: 500 });
  }
}
