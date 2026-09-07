import { NextRequest, NextResponse } from "next/server";
import { kycService } from "@/lib/services/kycService";
import { kycRepository } from "@/lib/repositories/kycRepository";
import { KycStorageService } from "@/lib/services/kycStorageService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { requireAuth } from "@/lib/auth/rbac";

export const GET = withErrorHandler(async (
  request: NextRequest, 
  { params }: { params: { bookingId: string, document: string } }
) => {
  const { bookingId, document } = params;
  const searchParams = request.nextUrl.searchParams;
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  let isAuthorized = false;

  const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
  if (!booking) {
    throw new AppError("Booking not found.", 404, "NOT_FOUND");
  }

  // 1. Check Guest Authorization
  if (expires && signature) {
    if (kycService.verifyGuestSignature(bookingId, expires, signature)) {
      isAuthorized = true;
    }
  }

  // 2. Check Partner Authorization
  if (!isAuthorized) {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      throw new AppError("Access Denied.", 401, "UNAUTHORIZED");
    }
    const hasPartnerAccess = await kycService.verifyPartnerAccess(
      auth.userId!, 
      auth.role!, 
      booking.propertyId
    );
    if (hasPartnerAccess) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new AppError("Access Denied: You do not have permission to view these documents.", 403, "FORBIDDEN");
  }

  if (booking.guests.length === 0) {
    throw new AppError("No primary guest found.", 404, "NOT_FOUND");
  }

  const primaryGuestId = booking.guests[0].guestId;
  const kyc = await kycRepository.getGuestKyc(primaryGuestId);
  if (!kyc) {
    throw new AppError("KYC record not found.", 404, "NOT_FOUND");
  }

  let storageKey: string | null = null;
  if (document === "front") storageKey = kyc.documentFront;
  else if (document === "back") storageKey = kyc.documentBack;
  else if (document === "selfie") storageKey = kyc.selfieImage;
  else {
    throw new AppError("Invalid document type requested.", 400, "BAD_REQUEST");
  }

  if (!storageKey) {
    throw new AppError("Document not found.", 404, "NOT_FOUND");
  }

  const { buffer, mimeType } = await KycStorageService.getDocument(storageKey);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "Content-Disposition": "inline"
    }
  });
});
