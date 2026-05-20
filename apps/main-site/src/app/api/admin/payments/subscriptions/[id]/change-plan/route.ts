import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { BillingCycle } from "@prisma/client";

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

    const { selectedPlanId, billingCycle, amount, reason } = await request.json();

    if (!selectedPlanId || !billingCycle || amount === undefined) {
      return NextResponse.json({ error: "Missing required modification fields" }, { status: 400 });
    }

    // 2. Fetch subscription details
    const subscription = await prisma.propertySubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });
    }

    // 3. Process Tier Change Transactionally
    await prisma.$transaction(async (tx) => {
      // 1. Update subscription plan particulars
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          selectedPlanId,
          billingCycle: billingCycle as BillingCycle,
          amount: Number(amount)
        }
      });

      // 2. Append Audit trace record
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "MANUAL_SUBSCRIPTION_PLAN_CHANGED",
            oldStatus: subscription.status,
            newStatus: subscription.status,
            performedBy: auth.userId,
            metadata: {
              reason,
              oldPlanId: subscription.selectedPlanId,
              newPlanId: selectedPlanId,
              oldBillingCycle: subscription.billingCycle,
              newBillingCycle: billingCycle,
              oldAmount: subscription.amount,
              newAmount: amount
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan tier changed successfully"
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_CHANGE_PLAN] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
