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

    // 3. Process Cancellation Transactionally
    await prisma.$transaction(async (tx) => {
      // 1. Update subscription status
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.INACTIVE
        }
      });

      // 2. Terminate property listing visibility to SUSPENDED
      await tx.property.update({
        where: { id: subscription.propertyId },
        data: {
          status: "SUSPENDED"
        }
      });

      // 3. Create Audit trace logs
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "MANUAL_SUBSCRIPTION_CANCELLED",
            oldStatus: subscription.status,
            newStatus: SubscriptionStatus.INACTIVE,
            performedBy: auth.userId,
            metadata: {
              cancelledAt: new Date()
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription successfully cancelled and property listing suspended"
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_CANCEL] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
