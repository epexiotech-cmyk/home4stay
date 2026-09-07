import { NextRequest, NextResponse } from "next/server";
import { kycService } from "@/lib/services/kycService";
import { kycRepository } from "@/lib/repositories/kycRepository";
import { KycStorageService } from "@/lib/services/kycStorageService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;
  const searchParams = request.nextUrl.searchParams;
  const expires = searchParams.get("expires") || "";
  const signature = searchParams.get("signature") || "";

  if (!kycService.verifyGuestSignature(bookingId, expires, signature)) {
    throw new AppError("Access Denied: Invalid or expired secure link.", 403, "FORBIDDEN");
  }

  const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
  if (!booking || booking.guests.length === 0) {
    throw new AppError("Booking or guest not found.", 404, "NOT_FOUND");
  }

  const primaryGuestId = booking.guests[0].guestId;
  const existingKyc = await kycRepository.getGuestKyc(primaryGuestId);

  return successResponse({
    verificationStatus: existingKyc?.verificationStatus || "PENDING",
    documentType: existingKyc?.documentType || null,
    hasFront: !!existingKyc?.documentFront,
    hasBack: !!existingKyc?.documentBack,
    hasSelfie: !!existingKyc?.selfieImage,
    updatedAt: existingKyc?.updatedAt || null,
  });
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;
  const searchParams = request.nextUrl.searchParams;
  const expires = searchParams.get("expires") || "";
  const signature = searchParams.get("signature") || "";

  if (!kycService.verifyGuestSignature(bookingId, expires, signature)) {
    throw new AppError("Access Denied: Invalid or expired secure link.", 403, "FORBIDDEN");
  }

  const formData = await request.formData();
  const documentType = formData.get("documentType") as string;
  const documentFrontFile = formData.get("documentFront") as File | null;
  const documentBackFile = formData.get("documentBack") as File | null;
  const selfieFile = formData.get("selfieImage") as File | null;

  if (!documentType || !documentFrontFile) {
    throw new AppError("Validation Error: documentType and documentFront are required.", 400, "BAD_REQUEST");
  }

  const allowedTypes = ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "VOTER_ID"];
  if (!allowedTypes.includes(documentType)) {
    throw new AppError("Validation Error: Invalid documentType.", 400, "BAD_REQUEST");
  }

  const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
  if (!booking || booking.guests.length === 0) {
    throw new AppError("Booking or guest not found.", 404, "NOT_FOUND");
  }
  const primaryGuestId = booking.guests[0].guestId;
  const existingKyc = await kycRepository.getGuestKyc(primaryGuestId);

  const writtenKeys: string[] = [];
  try {
    const frontBuffer = Buffer.from(await documentFrontFile.arrayBuffer());
    const frontKey = await KycStorageService.saveDocument(frontBuffer);
    writtenKeys.push(frontKey);

    let backKey = existingKyc?.documentBack || undefined;
    if (documentBackFile) {
      const backBuffer = Buffer.from(await documentBackFile.arrayBuffer());
      const newBackKey = await KycStorageService.saveDocument(backBuffer);
      writtenKeys.push(newBackKey);
      backKey = newBackKey;
    }

    let selfieKey = existingKyc?.selfieImage || undefined;
    if (selfieFile) {
      const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
      const newSelfieKey = await KycStorageService.saveDocument(selfieBuffer);
      writtenKeys.push(newSelfieKey);
      selfieKey = newSelfieKey;
    }

    await kycService.submitKyc(
      bookingId,
      {
        documentType,
        documentFront: frontKey,
        documentBack: backKey,
        selfieImage: selfieKey
      },
      { expires, signature }
    );

    if (existingKyc?.documentFront && existingKyc.documentFront !== frontKey) {
      await KycStorageService.deleteDocument(existingKyc.documentFront).catch(() => {});
    }
    if (documentBackFile && existingKyc?.documentBack && existingKyc.documentBack !== backKey) {
      await KycStorageService.deleteDocument(existingKyc.documentBack).catch(() => {});
    }
    if (selfieFile && existingKyc?.selfieImage && existingKyc.selfieImage !== selfieKey) {
      await KycStorageService.deleteDocument(existingKyc.selfieImage).catch(() => {});
    }

    return successResponse({ success: true, message: "KYC documents submitted successfully." }, { status: 201 });
  } catch (error) {
    for (const key of writtenKeys) {
      await KycStorageService.deleteDocument(key).catch(() => {});
    }
    throw error;
  }
});
