import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PaymentSubmitSchema } from "@/modules/payments/validators";
import { bookingService } from "@/lib/services/bookingService";
import { requireRole } from "@/lib/auth/rbac";
import { bookingRepository } from "@/lib/repositories/bookingRepository";

export const POST = withErrorHandler(async (
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) => {
  const { bookingId } = await props.params;

  // 1. Authenticate and Authorize
  const { authorized, userId, role, response } = await requireRole(request, [
    "user", "customer", "admin", "super_admin", "owner", "partner", "manager", "receptionist", "billing"
  ]);
  
  if (!authorized || !userId) {
    return response as NextResponse;
  }

  // 2. Fetch Booking to determine Property Ownership or Guest Ownership
  const booking = await bookingRepository.findByIdWithRelations(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404, "NOT_FOUND");
  }

  // 3. Apply Tenant/Guest Isolation checks
  let isAuthorized = false;

  if (["admin", "super_admin"].includes(role || "")) {
    isAuthorized = true;
  } else if (["owner", "partner", "manager", "receptionist", "billing"].includes(role || "")) {
    const accesses = await bookingRepository.findAllowedPropertyIds(userId);
    if (accesses.includes(booking.propertyId)) {
      isAuthorized = true;
    }
  } else {
    // Check if the guest owns this booking
    const hasGuestAccess = await bookingRepository.checkGuestAccess(bookingId, userId);
    if (hasGuestAccess) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new AppError("Access Denied: You do not have permission to submit payment for this booking.", 403, "FORBIDDEN");
  }

  // 4. Validate and Process
  const body = await request.json();
  const { utrNumber } = body;

  let validatedUtr: string | undefined;

  if (utrNumber && utrNumber.trim() !== "") {
    const validation = PaymentSubmitSchema.safeParse({ utrNumber });
    if (!validation.success) {
      throw new AppError(validation.error.issues[0].message, 400, "VALIDATION_ERROR");
    }
    validatedUtr = validation.data.utrNumber;
  }

  const updatedBooking = await bookingService.submitPayment(bookingId, validatedUtr);

  return successResponse({
    success: true,
    bookingId: updatedBooking.id,
    paymentStatus: updatedBooking.paymentStatus,
    status: updatedBooking.status
  });
});
