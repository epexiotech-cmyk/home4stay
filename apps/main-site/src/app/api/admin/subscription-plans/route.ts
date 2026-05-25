import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { sendNewPlanAlertEmail } from "@/lib/server/email";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/subscription-plans
 * Returns all active and inactive non-deleted plans.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, plans });

  } catch (error) {
    console.error("[ADMIN_PLANS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/subscription-plans
 * Creates a new subscription plan configuration.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      isActive,
      isFeatured,
      displayOrder,
      monthlyPrice,
      quarterlyPrice,
      yearlyPrice,
      lifetimePrice,
      maxProperties,
      maxImagesPerProperty,
      maxVideosPerProperty,
      maxRoomListings,
      maxBookingsPerMonth,
      featureFlags,
      customBadge,
      supportPriority
    } = body;

    // 1. Structural Validations
    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Missing required fields: name, slug, description" }, { status: 400 });
    }

    const parsedMonthly = parseFloat(monthlyPrice || "0");
    const parsedQuarterly = parseFloat(quarterlyPrice || "0");
    const parsedYearly = parseFloat(yearlyPrice || "0");
    const parsedLifetime = parseFloat(lifetimePrice || "0");

    if (parsedMonthly < 0 || parsedQuarterly < 0 || parsedYearly < 0 || parsedLifetime < 0) {
      return NextResponse.json({ error: "Subscription plan pricing parameters cannot be negative values" }, { status: 400 });
    }

    const parsedMaxProperties = parseInt(maxProperties || "1", 10);
    const parsedMaxImages = parseInt(maxImagesPerProperty || "10", 10);
    const parsedMaxVideos = parseInt(maxVideosPerProperty || "1", 10);
    const parsedMaxRooms = parseInt(maxRoomListings || "5", 10);
    const parsedMaxBookings = parseInt(maxBookingsPerMonth || "100", 10);

    if (
      parsedMaxProperties < 0 ||
      parsedMaxImages < 0 ||
      parsedMaxVideos < 0 ||
      parsedMaxRooms < 0 ||
      parsedMaxBookings < 0
    ) {
      return NextResponse.json({ error: "Limits parameters cannot be negative values" }, { status: 400 });
    }

    // Check slug duplicates
    const duplicate = await prisma.subscriptionPlan.findFirst({
      where: { slug, deletedAt: null }
    });

    if (duplicate) {
      return NextResponse.json({ error: `A subscription plan with slug '${slug}' already exists` }, { status: 400 });
    }

    // 2. Persist transactionally
    const plan = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.subscriptionPlan.create({
        data: {
          name,
          slug,
          description,
          shortDescription: shortDescription || null,
          isActive: isActive !== false,
          isFeatured: !!isFeatured,
          displayOrder: parseInt(displayOrder || "0", 10),
          monthlyPrice: parsedMonthly,
          quarterlyPrice: parsedQuarterly,
          yearlyPrice: parsedYearly,
          lifetimePrice: parsedLifetime,
          maxProperties: parsedMaxProperties,
          maxImagesPerProperty: parsedMaxImages,
          maxVideosPerProperty: parsedMaxVideos,
          maxRoomListings: parsedMaxRooms,
          maxBookingsPerMonth: parsedMaxBookings,
          featureFlags: featureFlags || {},
          customBadge: customBadge || null,
          supportPriority: supportPriority || "NORMAL"
        }
      });

      // Log system audit log
      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000",
          action: "PLAN_CREATED",
          performedBy: auth.userId,
          metadata: {
            planId: record.id,
            name: record.name,
            slug: record.slug
          }
        }
      });

      return record;
    });

    // 3. Dispatch background new plan promotions asynchronously
    if (plan.isActive) {
      prisma.user.findMany({
        where: { role: "partner" }
      }).then(async (partners) => {
        await Promise.allSettled(
          partners.map(p => 
            sendNewPlanAlertEmail(p.email, p.name || "Partner Owner", plan.name, plan.description)
          )
        );
      }).catch(err => {
        console.error("[ADMIN_PLANS_POST] Background campaign dispatch error:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plan created successfully",
      planId: plan.id
    });

  } catch (error) {
    console.error("[ADMIN_PLANS_POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
