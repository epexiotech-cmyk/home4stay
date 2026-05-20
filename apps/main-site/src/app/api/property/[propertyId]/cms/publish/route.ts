import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export async function POST(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    if (!auth.authorized) return auth.response;

    const activeUserId = auth.userId;
    if (!activeUserId) return NextResponse.json({ error: "Missing user context." }, { status: 401 });

    // Verify authorized multi-tenant property access credentials
    const targetProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        pageContent: {
          include: { sections: true },
        },
      },
    });

    const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized release creation attempted." }, { status: 403 });
    }

    const body = await request.json();
    const { versionName, snapshotPayload } = body;

    // Snapshot master runtime JSON configuration layout tree state
    const payloadArchive = snapshotPayload || targetProperty?.pageContent || { status: "fallback_snapshot" };

    // Persist new static version node record
    const targetRelease = await prisma.cmsVersion.create({
      data: {
        propertyId,
        versionName: versionName || `Release Build — ${new Date().toLocaleDateString()}`,
        snapshot: payloadArchive,
        published: true,
        createdBy: auth.authorized ? `User #${activeUserId}` : "concierge_curator_v2",
      },
    });

    // Update active primary pointer reference ID
    if (targetProperty?.pageContent?.id) {
      await prisma.propertyPageContent.update({
        where: { id: targetProperty.pageContent.id },
        data: { publishedVersionId: targetRelease.id },
      });
    }

    return NextResponse.json({
      success: true,
      versionId: targetRelease.id,
      publishedAt: targetRelease.createdAt,
    }, { status: 200 });
  } catch (err) {
    console.error("POST release publication build compilation exception:", err);
    return NextResponse.json({ error: "Failed to compile persistent published site snapshot." }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    if (!auth.authorized) return auth.response;

    // Retrieve full version timeline history
    const history = await prisma.cmsVersion.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, versions: history }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Timeline index lookup failure." }, { status: 500 });
  }
}
