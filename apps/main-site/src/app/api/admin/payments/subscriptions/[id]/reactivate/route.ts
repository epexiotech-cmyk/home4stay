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

    // 2. Fetch subscription details
    const subscription = await prisma.propertySubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });
    }

    // 3. Process Reactivation Transactionally
    await prisma.$transaction(async (tx) => {
      // 1. Update subscription status
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          suspendedAt: null
        }
      });

      // 2. Set property visibility status to LIVE
      await tx.property.update({
        where: { id: subscription.propertyId },
        data: {
          status: "LIVE"
        }
      });

      // 3. Log Audit Trace details
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "MANUAL_SUBSCRIPTION_REACTIVATED",
            oldStatus: subscription.status,
            newStatus: SubscriptionStatus.ACTIVE,
            performedBy: auth.userId,
            metadata: {
              reactivatedAt: new Date()
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription reactivated and property set LIVE successfully"
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_REACTIVATE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
