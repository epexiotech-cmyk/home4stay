import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { bookingEngine } from "@/modules/payments/services/bookingEngine";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const POST = withErrorHandler(async (
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) => {
  const { bookingId } = await props.params;

  // 1. Authenticate and authorize the user
  const { authorized, userId, response } = await requireRole(request, [
    "admin", "super_admin", "owner", "partner", "manager", "receptionist", "billing"
  ]);
  
  if (!authorized || !userId) {
    return response as NonNullable<typeof response>;
  }

  // 2. Delegate state transition and ledger recording to central booking engine
  const result = await bookingEngine.confirmBooking(bookingId, userId);

  if (!result.success) {
    throw new AppError(result.message, 400, "CONFIRMATION_FAILED");
  }

  const { successResponse: apiSuccessResponse } = await import("@/lib/utils/apiResponse");

  return apiSuccessResponse({
    success: true,
    bookingId,
    invoiceNumber: result.invoiceNumber
  });
});
