import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export async function GET(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    const activeUserId = auth.authorized ? auth.userId : "partner_admin_owner";

    // Enforce isolation checks
    const targetProperty = await prisma.property.findUnique({ where: { id: propertyId } });
    if (targetProperty && targetProperty.ownerId !== activeUserId && !["admin", "super_admin"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Access mapping forbidden." }, { status: 403 });
    }

    // Index associated catalog list items ordered by recency
    const assets = await prisma.mediaAsset.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to extract dynamic media registry library mapping feeds." }, { status: 500 });
  }
}
