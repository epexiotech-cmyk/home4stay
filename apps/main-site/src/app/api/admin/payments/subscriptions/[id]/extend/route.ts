import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params;

    // 1. Authenticate caller (Admin/Super Admin only)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { daysToExtend, reason } = await request.json();

    if (!daysToExtend || daysToExtend <= 0) {
      return NextResponse.json({ error: "Invalid extend days count" }, { status: 400 });
    }

    // 2. Fetch target subscription
    const subscription = await prisma.propertySubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });
    }

    const baseDate = subscription.expiresAt && subscription.expiresAt > new Date()
      ? new Date(subscription.expiresAt)
      : new Date();

    const newExpiresAt = new Date(baseDate);
    newExpiresAt.setDate(newExpiresAt.getDate() + Number(daysToExtend));

    // 3. Execute update transactional safe operations
    await prisma.$transaction(async (tx) => {
      // Update subscription parameters
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          expiresAt: newExpiresAt,
          status: SubscriptionStatus.ACTIVE
        }
      });

      // Update associated property status to LIVE
      await tx.property.update({
        where: { id: subscription.propertyId },
        data: { status: "LIVE" }
      });

      // Append Audit trace logs
      // Try to find the latest transaction to anchor logs
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "MANUAL_SUBSCRIPTION_EXTENDED",
            oldStatus: subscription.status,
            newStatus: SubscriptionStatus.ACTIVE,
            performedBy: auth.userId,
            metadata: {
              daysAdded: daysToExtend,
              reason,
              oldExpiresAt: subscription.expiresAt,
              newExpiresAt
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Subscription extended by ${daysToExtend} days successfully`,
      newExpiresAt
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_EXTEND] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
