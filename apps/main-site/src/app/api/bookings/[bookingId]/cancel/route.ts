import { NextRequest } from "next/server";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { requireRole } from "@/lib/auth/rbac";
import { bookingService } from "@/lib/services/bookingService";

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;
  if (!bookingId) {
    throw new AppError("Booking ID is required", 400, "BAD_REQUEST");
  }

  // Determine user identity/role
  const { authorized, userId, role, response } = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner", "user", "customer"]);
  if (!authorized || !userId || !role) {
    // If not a standard user/partner, we check for guest link auth signature
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get("signature");
    const expires = searchParams.get("expires");
    if (signature && expires) {
      const { kycService } = await import("@/lib/services/kycService");
      const isValidLink = kycService.verifyGuestSignature(bookingId, expires, signature);
      if (!isValidLink) {
        throw new AppError("Invalid or expired secure link", 403, "FORBIDDEN");
      }
      // Guest authorized via secure link
      const result = await bookingService.cancelBooking(bookingId, { isGuestSignatureVerified: true });
      return successResponse(result);
    }
    if (response) return response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  // The actual tenant check is inside bookingService.cancelBooking
  const result = await bookingService.cancelBooking(bookingId, { userId, role });
  return successResponse(result);
});
