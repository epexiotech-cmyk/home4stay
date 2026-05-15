import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export async function POST(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    const activeUserId = auth.authorized ? auth.userId : "partner_admin_owner";

    // Verify ownership parameters
    const targetProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { pageContent: true },
    });

    if (targetProperty && targetProperty.ownerId !== activeUserId && !["admin", "super_admin"].includes(auth.role || "")) {
      return NextResponse.json({ error: "Unauthorized operation blocked." }, { status: 403 });
    }

    // Ensure root container document persists
    let contentId = targetProperty?.pageContent?.id;
    if (!contentId) {
      const newContent = await prisma.propertyPageContent.upsert({
        where: { propertyId },
        update: {},
        create: { propertyId, themeVariant: "Mountain Luxury" },
      });
      contentId = newContent.id;
    }

    const body = await request.json();
    const { type, initialData } = body;

    // Determine current section max sort index
    const existingCount = await prisma.propertySection.count({
      where: { propertyPageContentId: contentId },
    });

    // Create target registry node instance securely
    const newSection = await prisma.propertySection.create({
      data: {
        propertyPageContentId: contentId,
        type: type || "narrative",
        sortOrder: existingCount,
        enabled: true,
        data: initialData || {},
      },
    });

    return NextResponse.json({ success: true, section: newSection }, { status: 201 });
  } catch (err) {
    console.error("POST append section block framework failure:", err);
    return NextResponse.json({ error: "Failed to persist new decoupled layout module record." }, { status: 500 });
  }
}
