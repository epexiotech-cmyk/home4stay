import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth/rbac";
import { prisma } from "../../../../../../lib/database/prisma";
import { PaymentService } from "../../../../../../modules/payments/services/index";
import { SubscriptionLifecycleService } from "../../../../../../modules/payments/services/subscriptionLifecycle";
import { InvoiceService } from "../../../../../../lib/financial/invoiceService";
import { PaymentStatus } from "@prisma/client";

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

    // 2. Locate Transaction record
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Payment transaction not found" }, { status: 404 });
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      return NextResponse.json({ error: `Cannot approve transaction. Current status is ${transaction.paymentStatus}` }, { status: 400 });
    }

    // 3. Process Transaction confirmation and Subscription Activation
    const approvedTx = await PaymentService.approveManualUpiPayment(
      transactionId,
      auth.userId,
      "Manual UTR verification confirmed by admin."
    );

    if (approvedTx.subscriptionId) {
      await SubscriptionLifecycleService.activateSubscription(approvedTx.subscriptionId, auth.userId);
      
      // Auto-issue GST Tax Invoice atomically on approval
      try {
        await InvoiceService.generateInvoiceForTransaction(transactionId);
      } catch (invoiceErr) {
        console.error("[INVOICE_GENERATION_HOOK_ERROR] Failed to auto-issue invoice:", invoiceErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "UPI transaction approved and property subscription activated successfully",
      status: approvedTx.paymentStatus
    });

  } catch (error) {
    console.error("[ADMIN_PAYMENT_APPROVE] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

