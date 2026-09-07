import { kycRepository } from "../repositories/kycRepository";
import { bookingRepository } from "../repositories/bookingRepository";
import { AppError } from "../errors/handler";
import * as crypto from "crypto";

export class KycService {
  /**
   * Verifies the HMAC signature for guest access to the KYC portal
   */
  public verifyGuestSignature(bookingId: string, expires: string, signature: string): boolean {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("Server configuration error: Signing secret is missing.", 500, "INTERNAL_SERVER_ERROR");
    }

    try {
      const expireTime = parseInt(expires, 10);
      if (isNaN(expireTime) || expireTime < Date.now()) {
        return false;
      }
      
      const expected = crypto.createHmac("sha256", secret)
                             .update(bookingId + ":" + expires)
                             .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Securely verify partner access to a property
   */
  public async verifyPartnerAccess(userId: string, role: string, propertyId: string): Promise<boolean> {
    if (["admin", "super_admin"].includes(role)) {
      return true;
    }
    if (["owner", "partner", "manager", "receptionist"].includes(role)) {
      const accesses = await bookingRepository.findAllowedPropertyIds(userId);
      return accesses.includes(propertyId);
    }
    return false;
  }

  /**
   * Guest submits their KYC documents publicly
   */
  async submitKyc(
    bookingId: string,
    data: {
      documentType: string;
      documentFront: string;
      documentBack?: string;
      selfieImage?: string;
    },
    authParams: { expires: string; signature: string }
  ) {
    if (!this.verifyGuestSignature(bookingId, authParams.expires, authParams.signature)) {
      throw new AppError("Access Denied: Invalid or expired secure link.", 403, "FORBIDDEN");
    }

    const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", 404, "NOT_FOUND");
    }

    if (booking.guests.length === 0) {
      throw new AppError("No primary guest found for this booking.", 400, "BAD_REQUEST");
    }

    const primaryGuestId = booking.guests[0].guestId;
    const existingKyc = await kycRepository.getGuestKyc(primaryGuestId);

    if (existingKyc) {
      const status = existingKyc.verificationStatus;
      if (status === "VERIFIED") {
        throw new AppError("KYC is already verified. No further submission allowed.", 400, "INVALID_STATE");
      }
      if (status === "UNDER_REVIEW") {
        throw new AppError("KYC is currently under review. Please wait.", 400, "INVALID_STATE");
      }
      // Allowed states for submission: PENDING, REJECTED
      if (status !== "PENDING" && status !== "REJECTED") {
        throw new AppError(`Cannot submit KYC from state: ${status}`, 400, "INVALID_STATE");
      }
    }

    let nextBookingStatus = booking.status;
    if (booking.status === "CONFIRMED" || booking.status === "PENDING_KYC") {
      nextBookingStatus = "PENDING_KYC";
    }

    await kycRepository.submitKyc(
      bookingId,
      primaryGuestId,
      {
        documentType: data.documentType,
        documentFront: data.documentFront,
        documentBack: data.documentBack,
        selfieImage: data.selfieImage
      },
      nextBookingStatus
    );

    return { success: true, message: "KYC documents submitted successfully." };
  }

  /**
   * Partner approves the guest KYC
   */
  async approveKyc(
    bookingId: string,
    authParams: { userId: string; role: string }
  ) {
    const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
    if (!booking) throw new AppError("Booking not found.", 404, "NOT_FOUND");

    const isAuthorized = await this.verifyPartnerAccess(authParams.userId, authParams.role, booking.propertyId);
    if (!isAuthorized) {
      throw new AppError("Access Denied: You do not have permission for this property.", 403, "FORBIDDEN");
    }

    if (booking.guests.length === 0) {
      throw new AppError("No primary guest found for this booking.", 400, "BAD_REQUEST");
    }
    const primaryGuestId = booking.guests[0].guestId;

    const existingKyc = await kycRepository.getGuestKyc(primaryGuestId);
    if (!existingKyc) {
      throw new AppError("No KYC records found to approve.", 404, "NOT_FOUND");
    }

    if (existingKyc.verificationStatus !== "UNDER_REVIEW") {
      throw new AppError(`Cannot approve KYC from state: ${existingKyc.verificationStatus}. Must be UNDER_REVIEW.`, 400, "INVALID_STATE");
    }

    let nextBookingStatus = booking.status;
    if (booking.status === "PENDING_KYC") {
      nextBookingStatus = "CONFIRMED"; 
    }

    await kycRepository.approveKyc(bookingId, primaryGuestId, nextBookingStatus);

    return { success: true, message: "KYC approved successfully." };
  }

  /**
   * Partner rejects the guest KYC
   */
  async rejectKyc(
    bookingId: string,
    reason: string,
    authParams: { userId: string; role: string }
  ) {
    const booking = await kycRepository.getBookingAndPrimaryGuest(bookingId);
    if (!booking) throw new AppError("Booking not found.", 404, "NOT_FOUND");

    const isAuthorized = await this.verifyPartnerAccess(authParams.userId, authParams.role, booking.propertyId);
    if (!isAuthorized) {
      throw new AppError("Access Denied: You do not have permission for this property.", 403, "FORBIDDEN");
    }

    if (booking.guests.length === 0) {
      throw new AppError("No primary guest found for this booking.", 400, "BAD_REQUEST");
    }
    const primaryGuestId = booking.guests[0].guestId;

    const existingKyc = await kycRepository.getGuestKyc(primaryGuestId);
    if (!existingKyc) {
      throw new AppError("No KYC records found to reject.", 404, "NOT_FOUND");
    }

    if (existingKyc.verificationStatus !== "UNDER_REVIEW") {
      throw new AppError(`Cannot reject KYC from state: ${existingKyc.verificationStatus}. Must be UNDER_REVIEW.`, 400, "INVALID_STATE");
    }
    
    // Sanitize reason string if provided to prevent malicious injection, but do not persist as schema lacks field.
    const sanitizedReason = typeof reason === 'string' ? reason.replace(/[<>]/g, '').trim() : '';
    if (sanitizedReason && sanitizedReason.length > 500) {
      throw new AppError("Rejection reason too long.", 400, "BAD_REQUEST");
    }

    let nextBookingStatus = booking.status;
    if (booking.status === "CONFIRMED" || booking.status === "PENDING_KYC") {
      nextBookingStatus = "PENDING_KYC";
    }

    await kycRepository.rejectKyc(bookingId, primaryGuestId, nextBookingStatus);

    return { success: true, message: "KYC rejected successfully." };
  }
}

export const kycService = new KycService();
