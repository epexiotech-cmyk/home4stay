import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { bookingService } from "@/lib/services/bookingService";
import { requireRole } from "@/lib/auth/rbac";
import { bookingRepository } from "@/lib/repositories/bookingRepository";

export const GET = withErrorHandler(async (
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
    throw new AppError("Access Denied: You do not have permission to view this booking.", 403, "FORBIDDEN");
  }

  // 4. Return Data
  const result = await bookingService.getPaymentStatus(bookingId);

  return successResponse({
    success: true,
    ...result
  });
});
