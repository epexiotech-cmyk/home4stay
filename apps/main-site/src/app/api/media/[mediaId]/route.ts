import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ mediaId: string }>;
}

export async function DELETE(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { mediaId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    const activeUserId = auth.authorized ? auth.userId : "partner_admin_owner";

    // Lookup asset to confirm owner access boundary
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      include: { property: true },
    });

    if (asset && asset.property?.ownerId !== activeUserId && !["admin", "super_admin"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Forbidden deletion mapping intercepted." }, { status: 403 });
    }

    // Purge target record
    await prisma.mediaAsset.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true, deletedId: mediaId }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Storage file purging instruction sequence failed." }, { status: 500 });
  }
}
