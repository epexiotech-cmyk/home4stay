import { NextRequest, NextResponse } from "next/server";
import { kycService } from "@/lib/services/kycService";
import { kycRepository } from "@/lib/repositories/kycRepository";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { requireAuth } from "@/lib/auth/rbac";

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;
  
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return auth.response!;
  }

  const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
  if (!booking) {
    throw new AppError("Booking not found.", 404, "NOT_FOUND");
  }

  const isAuthorized = await kycService.verifyPartnerAccess(auth.userId!, auth.role!, booking.propertyId);
  if (!isAuthorized) {
    throw new AppError("Access Denied: You do not have permission for this property.", 403, "FORBIDDEN");
  }

  if (booking.guests.length === 0) {
    throw new AppError("No primary guest found.", 404, "NOT_FOUND");
  }

  const primaryGuestId = booking.guests[0].guestId;
  const kyc = await kycRepository.getGuestKyc(primaryGuestId);
  if (!kyc) {
    throw new AppError("KYC record not found.", 404, "NOT_FOUND");
  }

  const baseUrl = `/api/bookings/${bookingId}/kyc/documents`;

  return successResponse({
    verificationStatus: kyc.verificationStatus,
    documentType: kyc.documentType,
    updatedAt: kyc.updatedAt,
    documentFrontUrl: kyc.documentFront ? `${baseUrl}/front` : null,
    documentBackUrl: kyc.documentBack ? `${baseUrl}/back` : null,
    selfieImageUrl: kyc.selfieImage ? `${baseUrl}/selfie` : null,
  });
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;
  
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return auth.response!;
  }

  const body = await request.json();
  const { action, reason } = body;

  if (action === "APPROVE") {
    const result = await kycService.approveKyc(bookingId, { userId: auth.userId!, role: auth.role! });
    return successResponse(result);
  } else if (action === "REJECT") {
    if (reason && reason.length > 500) {
      throw new AppError("Rejection reason must be 500 characters or fewer.", 400, "BAD_REQUEST");
    }
    const result = await kycService.rejectKyc(bookingId, reason || "", { userId: auth.userId!, role: auth.role! });
    return successResponse(result);
  } else {
    throw new AppError("Invalid action. Must be APPROVE or REJECT.", 400, "BAD_REQUEST");
  }
});

export const PATCH = POST;
