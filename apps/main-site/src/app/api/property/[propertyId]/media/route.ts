import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requirePropertyAccess } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export async function GET(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    // 1. STRICT TENANT ISOLATION CHECK against PostgreSQL junction table
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    // 2. Fetch associated catalog list items ordered by recency
    const assets = await prisma.mediaAsset.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch (error) {
    console.error("GET Media Assets Error:", error);
    return NextResponse.json({ error: "Failed to extract dynamic media registry library mapping feeds." }, { status: 500 });
  }
}
