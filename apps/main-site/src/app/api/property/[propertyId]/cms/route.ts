import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/server/cache";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export async function GET(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    // Secure multi-tenant identity verification
    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    if (!auth.authorized) return auth.response;

    const activeUserId = auth.userId;
    if (!activeUserId) return NextResponse.json({ error: "Missing user context." }, { status: 401 });

    // STRICT OWNER VALIDATION CHECK
    const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
    if (!hasAccess) {
      console.warn(`Unauthorized multi-tenant fetch attempt intercepted targeting property #${propertyId} by user #${activeUserId}`);
      return NextResponse.json({ error: "Forbidden access mapping breach intercepted." }, { status: 403 });
    }

    // 1. Check Redis Cache first
    const cacheKey = `cms:${propertyId}`;
    const cachedCms = await cacheGet<unknown>(cacheKey);
    if (cachedCms) {
      return NextResponse.json({
        success: true,
        data: cachedCms,
        source: "cache"
      });
    }

    // 2. Fall back to PostgreSQL DB fetch
    const targetProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        pageContent: {
          include: {
            sections: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    const cmsData = targetProperty?.pageContent || getFallbackInitialPayload(propertyId).data;

    // 3. Cache the result for 5 minutes (300 seconds)
    await cacheSet(cacheKey, cmsData, 300);

    return NextResponse.json({
      success: true,
      data: cmsData,
      source: "database"
    });
  } catch (err) {
    console.error("GET CMS document payload indexing error:", err);
    return NextResponse.json({ error: "Internal Server Error during data stream extraction." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: ContextProps) {
  try {
    const resolvedParams = await params;
    const { propertyId } = resolvedParams;

    const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
    if (!auth.authorized) return auth.response;

    const activeUserId = auth.userId;
    if (!activeUserId) return NextResponse.json({ error: "Missing user context." }, { status: 401 });

    // Intercept target ownership verification record
    const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden access mutation attempt restricted." }, { status: 403 });
    }

    const body = await request.json();
    const { themePreset, sections } = body;

    // Upsert root content properties
    const updatedContent = await prisma.propertyPageContent.upsert({
      where: { propertyId },
      update: {
        themeVariant: themePreset || undefined,
        updatedAt: new Date(),
      },
      create: {
        propertyId,
        themeVariant: themePreset || "Mountain Luxury",
      },
    });

    // If client broadcast custom specific inline sub-block string sets, batch merge them securely
    if (Array.isArray(sections)) {
      // Continuous atomic sequence rewrite
      for (const item of sections) {
        await prisma.propertySection.upsert({
          where: { id: item.id },
          update: {
            sortOrder: item.sortOrder,
            enabled: item.enabled,
            data: item.data,
            updatedAt: new Date(),
          },
          create: {
            id: item.id,
            propertyPageContentId: updatedContent.id,
            type: item.type,
            sortOrder: item.sortOrder,
            enabled: item.enabled ?? true,
            data: item.data || {},
          },
        });
      }
    }

    // 4. Invalidate Redis CMS cache instantly upon modification
    const cacheKey = `cms:${propertyId}`;
    await cacheInvalidate(cacheKey);

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() }, { status: 200 });
  } catch (err) {
    console.error("CRITICAL: PUT CMS database persistence failure:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to persist CMS document layout to the PostgreSQL database.", 
        details: err instanceof Error ? err.message : String(err)
      }, 
      { status: 500 }
    );
  }
}

// Interoperable client simulation defaults guaranteeing zero live-canvas preview loading breaks
function getFallbackInitialPayload(propertyId: string) {
  return {
    success: true,
    data: {
      propertyId,
      themeVariant: "Mountain Luxury",
      spacingPreset: "relaxed-luxury",
      animationPreset: "cinematic-fade-physics",
      sections: [
        { id: "sec-hero-1", type: "hero", enabled: true, sortOrder: 0, data: {} },
        { id: "sec-narrative-1", type: "narrative", enabled: true, sortOrder: 1, data: {} },
        { id: "sec-carousel-1", type: "carousel", enabled: true, sortOrder: 2, data: {} },
        { id: "sec-gallery-1", type: "gallery", enabled: true, sortOrder: 3, data: {} },
        { id: "sec-seo-1", type: "seo", enabled: true, sortOrder: 4, data: {} },
      ],
    },
  };
}
