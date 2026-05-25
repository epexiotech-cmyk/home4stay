import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { sendPlanChangeAlertEmail } from "@/lib/server/email";
import { Prisma } from "@prisma/client";

/**
 * PUT /api/admin/subscription-plans/:id
 * Updates subscription plan details.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const currentPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!currentPlan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 });
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

    const updateData: Prisma.SubscriptionPlanUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription || null;
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;
    if (customBadge !== undefined) updateData.customBadge = customBadge || null;
    if (supportPriority !== undefined) updateData.supportPriority = supportPriority || "NORMAL";

    if (displayOrder !== undefined) {
      updateData.displayOrder = parseInt(displayOrder || "0", 10);
    }

    if (monthlyPrice !== undefined) {
      const p = parseFloat(monthlyPrice || "0");
      if (p < 0) return NextResponse.json({ error: "Pricing parameters cannot be negative" }, { status: 400 });
      updateData.monthlyPrice = p;
    }
    if (quarterlyPrice !== undefined) {
      const p = parseFloat(quarterlyPrice || "0");
      if (p < 0) return NextResponse.json({ error: "Pricing parameters cannot be negative" }, { status: 400 });
      updateData.quarterlyPrice = p;
    }
    if (yearlyPrice !== undefined) {
      const p = parseFloat(yearlyPrice || "0");
      if (p < 0) return NextResponse.json({ error: "Pricing parameters cannot be negative" }, { status: 400 });
      updateData.yearlyPrice = p;
    }
    if (lifetimePrice !== undefined) {
      const p = parseFloat(lifetimePrice || "0");
      if (p < 0) return NextResponse.json({ error: "Pricing parameters cannot be negative" }, { status: 400 });
      updateData.lifetimePrice = p;
    }

    if (maxProperties !== undefined) {
      const l = parseInt(maxProperties || "1", 10);
      if (l < 0) return NextResponse.json({ error: "Limits cannot be negative" }, { status: 400 });
      updateData.maxProperties = l;
    }
    if (maxImagesPerProperty !== undefined) {
      const l = parseInt(maxImagesPerProperty || "10", 10);
      if (l < 0) return NextResponse.json({ error: "Limits cannot be negative" }, { status: 400 });
      updateData.maxImagesPerProperty = l;
    }
    if (maxVideosPerProperty !== undefined) {
      const l = parseInt(maxVideosPerProperty || "1", 10);
      if (l < 0) return NextResponse.json({ error: "Limits cannot be negative" }, { status: 400 });
      updateData.maxVideosPerProperty = l;
    }
    if (maxRoomListings !== undefined) {
      const l = parseInt(maxRoomListings || "5", 10);
      if (l < 0) return NextResponse.json({ error: "Limits cannot be negative" }, { status: 400 });
      updateData.maxRoomListings = l;
    }
    if (maxBookingsPerMonth !== undefined) {
      const l = parseInt(maxBookingsPerMonth || "100", 10);
      if (l < 0) return NextResponse.json({ error: "Limits cannot be negative" }, { status: 400 });
      updateData.maxBookingsPerMonth = l;
    }

    if (featureFlags !== undefined) {
      updateData.featureFlags = featureFlags || {};
    }

    // Check slug duplicates if rotating slugs
    if (slug && slug !== currentPlan.slug) {
      const duplicate = await prisma.subscriptionPlan.findFirst({
        where: { slug, id: { not: planId }, deletedAt: null }
      });
      if (duplicate) {
        return NextResponse.json({ error: `A plan with slug '${slug}' already exists` }, { status: 400 });
      }
      updateData.slug = slug;
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.subscriptionPlan.update({
        where: { id: planId },
        data: updateData
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000",
          action: "PLAN_EDITED",
          performedBy: auth.userId,
          metadata: {
            planId,
            changes: Object.keys(updateData)
          }
        }
      });

      return record;
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan updated successfully",
      planId: updated.id
    });

  } catch (error) {
    console.error("[ADMIN_PLAN_PUT] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/subscription-plans/:id
 * Soft deletes plan and alerts subscribers.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 });
    }

    // Soft delete the plan
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.subscriptionPlan.update({
        where: { id: planId },
        data: { deletedAt: new Date() }
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000",
          action: "PLAN_SOFT_DELETED",
          performedBy: auth.userId,
          metadata: {
            planId,
            name: plan.name,
            slug: plan.slug
          }
        }
      });
    });

    // Fetch active property subscriptions on this plan to trigger discontinued alerts
    const activeSubscribers = await prisma.propertySubscription.findMany({
      where: {
        selectedPlanId: planId,
        status: "ACTIVE"
      },
      include: {
        property: {
          include: {
            owner: true
          }
        }
      }
    });

    // Alert owners asynchronously
    Promise.allSettled(
      activeSubscribers.map(sub => {
        const owner = sub.property.owner;
        const renewalDate = sub.expiresAt || new Date();
        return sendPlanChangeAlertEmail(owner.email, owner.name || "Partner Owner", plan.name, renewalDate);
      })
    ).catch(err => {
      console.error("[ADMIN_PLAN_DELETE] Alert campaign dispatch error:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan soft-deleted and affected subscribers alerted successfully"
    });

  } catch (error) {
    console.error("[ADMIN_PLAN_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
