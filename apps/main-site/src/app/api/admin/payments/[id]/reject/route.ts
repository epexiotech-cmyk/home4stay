import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PaymentService } from "@/modules/payments/services/index";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";
import { reviewPaymentSchema } from "@/modules/payments/validators/payment.validators";

async function handleRejectPayment(
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

  // 2. Parse rejection reason using centralized DTO validator
  let reason = "Manual UPI UTR verification failed.";
  try {
    const rawBody = await request.json();
    const dto = reviewPaymentSchema.parse(rawBody);
    if (dto.reviewNote && dto.reviewNote.trim()) {
      reason = dto.reviewNote.trim();
    }
  } catch {
    // Body might be empty, use default reason
  }

  // 4. Process transaction rejection
  const rejectedTx = await PaymentService.rejectManualUpiPayment(
    transactionId,
    auth.userId,
    reason
  );

  return successResponse({
    success: true,
    message: "UPI transaction rejected successfully",
    status: rejectedTx.paymentStatus
  });
}

export const POST = withErrorHandler(handleRejectPayment);
