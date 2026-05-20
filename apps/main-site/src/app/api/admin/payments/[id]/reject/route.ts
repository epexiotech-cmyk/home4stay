import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth/rbac";
import { prisma } from "../../../../../../lib/database/prisma";
import { PaymentService } from "../../../../../../modules/payments/services/index";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params;

    // 1. Authenticate caller (Must be platform Admin or Super Admin)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    // 2. Parse rejection reason
    let reason = "Manual UPI UTR verification failed.";
    try {
      const body = await request.json();
      if (body.reason && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch (err) {
      // Body might be empty, use default reason
    }

    // 3. Locate Transaction record
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Payment transaction not found" }, { status: 404 });
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      return NextResponse.json({ error: `Cannot reject transaction. Current status is ${transaction.paymentStatus}` }, { status: 400 });
    }

    // 4. Process transaction rejection
    const rejectedTx = await PaymentService.rejectManualUpiPayment(
      transactionId,
      auth.userId,
      reason
    );

    // 5. Update subscription to INACTIVE
    if (rejectedTx.subscriptionId) {
      await prisma.propertySubscription.update({
        where: { id: rejectedTx.subscriptionId },
        data: { status: SubscriptionStatus.INACTIVE }
      });
    }

    return NextResponse.json({
      success: true,
      message: "UPI transaction rejected successfully",
      status: rejectedTx.paymentStatus
    });

  } catch (error: any) {
    console.error("[ADMIN_PAYMENT_REJECT] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
