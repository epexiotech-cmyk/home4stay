import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PaymentService } from "@/modules/payments/services/index";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";

async function handleApprovePayment(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: transactionId } = await params;

  // 1. Authenticate caller (Must be platform Admin or Super Admin)
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    throw new Error("Unauthorized: Missing active session");
  }

  if (auth.role !== "admin" && auth.role !== "super_admin") {
    throw new Error("Forbidden: Administrative access required");
  }

  // 3. Process Transaction confirmation and Subscription Activation
  const approvedTx = await PaymentService.approveManualUpiPayment(
    transactionId,
    auth.userId,
    "Manual UTR verification confirmed by admin."
  );

  return successResponse({
    success: true,
    message: "UPI transaction approved and property subscription activated successfully",
    status: approvedTx.paymentStatus
  });
}

export const POST = withErrorHandler(handleApprovePayment);
