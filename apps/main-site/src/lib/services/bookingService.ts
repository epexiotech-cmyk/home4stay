import { AppError } from "@/lib/errors/handler";
import { bookingRepository } from "../repositories/bookingRepository";
import { guestRepository } from "../repositories/guestRepository";
import { propertyPaymentConfigService } from "./propertyPaymentConfigService";
import { propertyInventoryService } from "./propertyInventoryService";
import { prisma } from "../database/prisma";
import { propertyOfferRepository } from "../repositories/propertyOfferRepository";
import { propertyPricingRepository } from "../repositories/propertyPricingRepository";
import { Prisma } from "@prisma/client";
import { 
  CreateBookingDto, 
  BookingSearchDto,
  BookingCancellationDto
} from "../types/booking.dto";

export class BookingService {
  /**
   * Orchestrates the creation of a booking, guest upsert, and concierge services.
   */
  async createBooking(data: CreateBookingDto, userId: string) {
    const { 
      propertyId, 
      roomId, 
      startDate, 
      endDate, 
      mealPlanId, 
      guestData,
      conciergeServices,
      paymentMode,
      couponCode
    } = data;

    const initialStatus = paymentMode === "SMART_UPI" ? "pending" : "confirmed";
    const initialPaymentStatus = paymentMode === "SMART_UPI" ? "PENDING_PAYMENT" : "PENDING";

    // Enforce ISO dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (start >= end) {
      throw new AppError("Check-out date must be after check-in date.", 400, "BAD_REQUEST");
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let transactionResult: any = null;
    let retries = 0;
    const MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        // Execute safely inside a transaction to prevent TOCTOU race conditions
        transactionResult = await prisma.$transaction(async (tx) => {
          // 1. Fetch Authoritative Pricing & Validate Property/Room Match
          const room = await tx.room.findUnique({
            where: { id: roomId }
          });
          if (!room || room.propertyId !== propertyId) {
            throw new AppError("Invalid room or property mismatch.", 400, "BAD_REQUEST");
          }
          
          const property = await tx.property.findUnique({
            where: { id: propertyId }
          });
          if (!property) {
            throw new AppError("Property not found.", 404, "NOT_FOUND");
          }

          // Compute authoritative amount
          let authoritativeAmount = room.price * numberOfNights;
          
          // Calculate concierge services cost authoritatively from the catalog
          if (conciergeServices && conciergeServices.length > 0) {
            for (const svc of conciergeServices) {
              const catalogService = await tx.conciergeServiceCatalog.findUnique({
                where: { id: svc.serviceType }
              });

              if (!catalogService) {
                throw new AppError(`Concierge service ${svc.serviceType} not found in catalog.`, 400, "BAD_REQUEST");
              }

              if (catalogService.propertyId !== propertyId) {
                throw new AppError(`Concierge service ${svc.serviceType} does not belong to this property.`, 400, "BAD_REQUEST");
              }

              if (!catalogService.isActive) {
                throw new AppError(`Concierge service ${catalogService.title} is not currently active.`, 400, "BAD_REQUEST");
              }

              // Assume quantity is 1 if not provided/supported. (Schema doesn't currently define quantity for booking concierge).
              authoritativeAmount += catalogService.price; 
            }
          }

          // Apply Offer if couponCode is provided
          let discount = 0;
          if (couponCode) {
            const offer = await propertyOfferRepository.findActiveByCouponCode(couponCode, propertyId);
            if (offer) {
              const now = new Date();
              if (now >= offer.startDate && now <= offer.endDate) {
                if (authoritativeAmount >= offer.minimumBookingAmount) {
                  // Validate room applicability if specified
                  const applicableRooms = Array.isArray(offer.applicableRooms) ? offer.applicableRooms : [];
                  if (applicableRooms.length === 0 || applicableRooms.includes(roomId)) {
                    const dt = String(offer.discountType).toUpperCase();
                    if (dt === 'PERCENTAGE') {
                      discount = authoritativeAmount * (offer.discountValue / 100);
                    } else if (dt === 'FLAT') {
                      discount = offer.discountValue;
                    }
                  }
                }
              }
            }
          }
          
          authoritativeAmount = Math.max(0, authoritativeAmount - discount);

          // Fetch property pricing for tax rate
          const pricing = await propertyPricingRepository.findByPropertyId(propertyId);
          const taxRate = pricing ? pricing.taxRate : 0.12;
          const gst = authoritativeAmount * taxRate;
          const totalAmount = authoritativeAmount + gst;

          // 2. Validate Availability (Inside transaction)
          // This calculates Room.roomCount - overlappingBookingsCount
          await propertyInventoryService.validateRoomAvailability(roomId, start, end, 1, tx);

          // 3. Upsert Guest Profile
          const guest = await tx.guest.upsert({
            where: { mobile: guestData.mobile },
            update: {
              fullName: guestData.fullName,
              email: guestData.email,
            },
            create: {
              fullName: guestData.fullName,
              mobile: guestData.mobile,
              email: guestData.email,
            }
          });

          // 4. Create Main Booking Record
          const booking = await bookingRepository.create({
            propertyId,
            roomId,
            startDate: start,
            endDate: end,
            mealPlan: mealPlanId,
            amount: totalAmount, // Trust backend calculation, ignore frontend
            status: initialStatus,
            paymentStatus: initialPaymentStatus,
            paymentMode: paymentMode || null,
            source: 'Home4Stay'
          }, tx);

          // 5. Link Primary Guest to Booking
          await bookingRepository.createBookingGuest(booking.id, guest.id, true, tx);

          // 6. Process Concierge Services
          if (conciergeServices && conciergeServices.length > 0) {
            for (const svc of conciergeServices) {
              const catalogService = await tx.conciergeServiceCatalog.findUnique({
                where: { id: svc.serviceType }
              });
              
              await bookingRepository.createConciergeService({
                bookingId: booking.id,
                serviceType: svc.serviceType,
                amount: catalogService!.price, // Ignore frontend amount
                configData: svc.configData || {},
                status: 'REQUESTED'
              }, tx);
            }
          }

          return { booking, guest, totalAmount };
        }, { 
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable 
        });

        // Break loop on success
        break;

      } catch (error: any) {
        if (error.code === 'P2034') {
          // Serialization failure (deadlock or concurrent write)
          retries++;
          if (retries >= MAX_RETRIES) {
            throw new AppError("Booking unavailable due to concurrent reservation. Please try again.", 409, "CONFLICT");
          }
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 100 * retries));
        } else {
          // Re-throw non-serialization errors
          throw error;
        }
      }
    }

    const { booking, guest, totalAmount } = transactionResult;

    // Initialize Smart UPI Payment Intent (if requested)
    let paymentIntent = null;
    if (paymentMode === "SMART_UPI") {
      const { SmartUpiProvider } = await import("@/modules/payments/providers/smartUpi");
      const configList = await propertyPaymentConfigService.getPaymentConfigs(propertyId);
      const activeConfig = configList.find(c => c.isActive);
      
      const provider = new SmartUpiProvider();
      const intent = await provider.createPaymentIntent(booking.id, totalAmount, {
        upiId: activeConfig?.upiId,
        merchantName: activeConfig?.merchantName
      });

      if (intent.success) {
        paymentIntent = {
          amount: intent.reconciliationAmount,
          paymentReference: intent.paymentReference,
          paymentExpiresAt: intent.expiresAt,
          qrPayload: intent.qrPayload,
          deepLink: intent.deepLink
        };
      }
    }

    return {
      ...booking,
      guest,
      ...paymentIntent // Merge payment intent fields directly for backward compatibility with the API response
    };
  }

  async getBookings(options: { 
    searchParams: BookingSearchDto; 
    userId: string; 
    role: string; 
    allowedPropertyIds?: string[] 
  }) {
    const { searchParams, allowedPropertyIds, role } = options;
    
    let resolvedAllowedPropertyIds = allowedPropertyIds;
    if (role !== 'admin' && role !== 'super_admin') {
      if (!resolvedAllowedPropertyIds || resolvedAllowedPropertyIds.length === 0) {
        resolvedAllowedPropertyIds = await bookingRepository.findAllowedPropertyIds(options.userId);
      }
      if (resolvedAllowedPropertyIds.length === 0) {
        return { data: [], total: 0 }; 
      }
    }

    return await bookingRepository.findManyWithPagination({
      propertyId: searchParams.propertyId,
      allowedPropertyIds: role === 'admin' || role === 'super_admin' ? undefined : resolvedAllowedPropertyIds,
      limit: searchParams.limit,
      offset: searchParams.offset
    });
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findByIdWithRelations(id);
    if (!booking) {
      throw new AppError("Booking not found", 404, "NOT_FOUND");
    }
    return booking;
  }

  async cancelBooking(id: string, authParams: { userId?: string; role?: string; isGuestSignatureVerified?: boolean }) {
    const booking = await bookingRepository.findByIdWithRelations(id);
    if (!booking) {
      throw new AppError("Booking not found.", 404, "NOT_FOUND");
    }

    let isAuthorized = false;
    if (authParams.isGuestSignatureVerified) {
      isAuthorized = true;
    } else if (authParams.userId && authParams.role) {
      const { kycService } = await import("@/lib/services/kycService");
      const partnerAccess = await kycService.verifyPartnerAccess(authParams.userId, authParams.role, booking.propertyId);
      if (partnerAccess) {
        isAuthorized = true;
      } else {
        const hasGuestAccess = await bookingRepository.checkGuestAccess(id, authParams.userId);
        if (hasGuestAccess) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new AppError("Access Denied: You do not have permission to cancel this booking.", 403, "FORBIDDEN");
    }

    const nonCancellableStates = ['CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'];
    if (nonCancellableStates.includes(booking.status.toUpperCase())) {
      throw new AppError(`Cannot cancel booking from status: ${booking.status}.`, 400, "INVALID_STATE");
    }

    try {
      const updatedBooking = await prisma.booking.update({
        where: { 
          id: id, 
          status: booking.status
        },
        data: {
          status: "CANCELLED"
        }
      });
      return { bookingId: updatedBooking.id, status: updatedBooking.status };
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new AppError("Booking state changed concurrently.", 409, "CONFLICT");
      }
      throw e;
    }
  }

  async submitPayment(bookingId: string, utrNumber?: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404, "NOT_FOUND");
    }

    if (booking.paymentStatus !== "PENDING_PAYMENT") {
      throw new AppError(`Cannot submit payment. Current status is ${booking.paymentStatus}`, 400, "INVALID_STATE");
    }

    if (utrNumber) {
      const duplicate = await bookingRepository.checkDuplicateUtr(utrNumber, bookingId);
      if (duplicate) {
        throw new AppError("This Transaction UTR has already been submitted for another reservation.", 409, "CONFLICT");
      }
    }

    const targetStatus = utrNumber ? "UNDER_OWNER_VERIFICATION" : "PAYMENT_SUBMITTED";
    return await bookingRepository.updatePaymentStatusAndUtr(bookingId, targetStatus, utrNumber || null);
  }

  async getPaymentStatus(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404, "NOT_FOUND");
    }

    const configList = await propertyPaymentConfigService.getPaymentConfigs(booking.propertyId);
    const activeConfig = configList.find(c => c.isActive);

    let qrPayload: string | undefined;
    let deepLink: string | undefined;

    if (booking.paymentMode === "SMART_UPI" && activeConfig?.upiId) {
      const upiId = activeConfig.upiId;
      const merchantName = activeConfig.merchantName || "Home4Stay Merchant";
      const referenceNote = booking.paymentReference || `H4S${booking.id.substring(0, 8).toUpperCase()}`;
      const amountStr = booking.amount.toFixed(2);
      
      const { generateQrDataUri } = await import("@/modules/payments/utils/qr");
      deepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(referenceNote)}`;
      qrPayload = generateQrDataUri(deepLink, 280);
    }

    return {
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      paymentMode: booking.paymentMode,
      amount: booking.amount,
      paymentReference: booking.paymentReference,
      paymentExpiresAt: booking.paymentExpiresAt,
      temporaryInventoryLockedUntil: booking.temporaryInventoryLockedUntil,
      qrPayload,
      deepLink
    };
  }

  async checkInBooking(bookingId: string, authParams: { userId: string; role: string }) {
    const booking = await bookingRepository.findByIdWithRelations(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", 404, "NOT_FOUND");
    }

    const { kycService } = await import("@/lib/services/kycService");
    const isAuthorized = await kycService.verifyPartnerAccess(authParams.userId, authParams.role, booking.propertyId);
    if (!isAuthorized) {
      throw new AppError("Access Denied: You do not have permission for this property.", 403, "FORBIDDEN");
    }

    if (booking.status !== "CONFIRMED") {
      throw new AppError(`Cannot check in booking from status: ${booking.status}. Must be CONFIRMED.`, 400, "INVALID_STATE");
    }

    // Payment Rule: Enforce successful payment before check-in.
    const allowedPaymentStatuses = ["PAID"];
    if (!allowedPaymentStatuses.includes((booking.paymentStatus || "").toUpperCase())) {
      throw new AppError("Booking payment is not confirmed as PAID.", 400, "PAYMENT_NOT_PAID");
    }

    if (!booking.guests || booking.guests.length === 0) {
      throw new AppError("No primary guest found for this booking.", 400, "BAD_REQUEST");
    }
    const primaryGuestId = booking.guests.find(g => g.isPrimaryGuest)?.guestId || booking.guests[0].guestId;
    
    const { kycRepository } = await import("@/lib/repositories/kycRepository");
    const kyc = await kycRepository.getGuestKyc(primaryGuestId);
    if (!kyc || kyc.verificationStatus !== "VERIFIED") {
      throw new AppError("Check-in denied: Guest KYC must be VERIFIED.", 400, "INVALID_STATE");
    }

    try {
      // Atomic conditional update for concurrency safety
      const updatedBooking = await prisma.booking.update({
        where: { 
          id: bookingId,
          status: "CONFIRMED"
        },
        data: {
          status: "CHECKED_IN"
        }
      });
      return { bookingId: updatedBooking.id, status: updatedBooking.status };
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new AppError("Booking state changed concurrently or is no longer CONFIRMED.", 409, "CONFLICT");
      }
      throw e;
    }
  }

  async checkOutBooking(bookingId: string, authParams: { userId: string; role: string }) {
    const booking = await bookingRepository.findByIdWithRelations(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", 404, "NOT_FOUND");
    }

    const { kycService } = await import("@/lib/services/kycService");
    const isAuthorized = await kycService.verifyPartnerAccess(authParams.userId, authParams.role, booking.propertyId);
    if (!isAuthorized) {
      throw new AppError("Access Denied: You do not have permission for this property.", 403, "FORBIDDEN");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new AppError(`Cannot check out booking from status: ${booking.status}. Must be CHECKED_IN.`, 400, "INVALID_STATE");
    }

    try {
      // Atomic conditional update for concurrency safetyty
      const updatedBooking = await prisma.booking.update({
        where: { 
          id: bookingId,
          status: "CHECKED_IN"
        },
        data: {
          status: "COMPLETED"
          // No RoomInventory mutation here since inventory is already reserved at booking time and bounded by endDate.
        }
      });
      return { bookingId: updatedBooking.id, status: updatedBooking.status };
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new AppError("Booking state changed concurrently or is no longer CHECKED_IN.", 409, "CONFLICT");
      }
      throw e;
    }
  }

  async downloadInvoice(bookingId: string, authParams: { userId?: string, role?: string }, queryParams: { signature?: string, expires?: string }) {
    let isAuthorized = false;

    if (queryParams.signature && queryParams.expires) {
      const crypto = await import("crypto");
      try {
        const expireTime = parseInt(queryParams.expires, 10);
        if (!isNaN(expireTime) && expireTime >= Date.now()) {
          const secret = process.env.JWT_SECRET || "super-secret-fallback-key-32-chars-at-least";
          const expected = crypto.createHmac("sha256", secret)
                                 .update(`${bookingId}:${queryParams.expires}`)
                                 .digest("hex");
          if (crypto.timingSafeEqual(Buffer.from(queryParams.signature), Buffer.from(expected))) {
            isAuthorized = true;
          }
        }
      } catch {
        // Ignore crypto errors
      }
    }

    if (!isAuthorized && authParams.userId) {
      const booking = await bookingRepository.findByIdWithRelations(bookingId);
      if (booking) {
        if (["admin", "super_admin"].includes(authParams.role || "")) {
          isAuthorized = true;
        } else if (["owner", "partner", "manager"].includes(authParams.role || "")) {
          const accesses = await bookingRepository.findAllowedPropertyIds(authParams.userId);
          if (accesses.includes(booking.propertyId)) {
            isAuthorized = true;
          }
        } else {
          const hasGuestAccess = await bookingRepository.checkGuestAccess(bookingId, authParams.userId);
          if (hasGuestAccess) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      throw new AppError("Access Denied: Invalid signature or unauthorized stay identity", 403, "FORBIDDEN");
    }

    const invoice = await bookingRepository.findInvoiceByBookingId(bookingId);
    if (!invoice) {
      throw new AppError("Invoice not generated: Keep waiting for confirmation sequence.", 404, "NOT_FOUND");
    }

    const { InvoiceStorageService } = await import("@/modules/payments/services/invoiceStorageService");
    const exists = InvoiceStorageService.exists(bookingId);
    if (!exists) {
      throw new AppError("Invoice PDF has not been generated locally yet.", 404, "NOT_FOUND");
    }

    const pdfBuffer = await InvoiceStorageService.getInvoicePdf(bookingId);
    return {
      filename: `${invoice.invoiceNumber}.pdf`,
      buffer: pdfBuffer
    };
  }
}

export const bookingService = new BookingService();
