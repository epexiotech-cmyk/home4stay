import { AppError } from "@/lib/errors/handler";
import { bookingRepository } from "../repositories/bookingRepository";
import { guestRepository } from "../repositories/guestRepository";
import { propertyPaymentConfigService } from "./propertyPaymentConfigService";
import { propertyInventoryService } from "./propertyInventoryService";
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
      amount,
      guestData,
      conciergeServices,
      paymentMode 
    } = data;

    const initialStatus = paymentMode === "SMART_UPI" ? "pending" : "confirmed";
    const initialPaymentStatus = paymentMode === "SMART_UPI" ? "PENDING_PAYMENT" : "PENDING";

    // --- ROOM MODULE INTEGRATION ---
    // 1. Validate Availability (Prevents overbooking)
    await propertyInventoryService.validateRoomAvailability(roomId, new Date(startDate), new Date(endDate), 1);

    // 2. Reserve Inventory (Lock capacity)
    await propertyInventoryService.reserveRoomInventory(roomId, 1);

    // Upsert Guest Profile
    const guest = await guestRepository.upsertGuest(guestData.mobile, guestData);

    // Create Main Booking Record
    const booking = await bookingRepository.create({
      propertyId,
      roomId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mealPlan: mealPlanId,
      amount,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      paymentMode: paymentMode || null,
      source: 'Home4Stay'
    });

    // Link Primary Guest to Booking
    await bookingRepository.createBookingGuest(booking.id, guest.id, true);

    // Process Concierge Services
    if (conciergeServices && conciergeServices.length > 0) {
      for (const svc of conciergeServices) {
        await bookingRepository.createConciergeService({
          bookingId: booking.id,
          serviceType: svc.serviceType,
          amount: svc.amount,
          configData: svc.configData || {},
          status: 'REQUESTED'
        });
      }
    }

    // Initialize Smart UPI Payment Intent (if requested)
    let paymentIntent = null;
    if (paymentMode === "SMART_UPI") {
      const { SmartUpiProvider } = await import("@/modules/payments/providers/smartUpi");
      const configList = await propertyPaymentConfigService.getPaymentConfigs(propertyId);
      const activeConfig = configList.find(c => c.isActive);
      
      const provider = new SmartUpiProvider();
      const intent = await provider.createPaymentIntent(booking.id, amount, {
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
    
    // Strict isolation checks
    let resolvedAllowedPropertyIds = allowedPropertyIds;
    if (role !== 'admin' && role !== 'super_admin') {
      if (!resolvedAllowedPropertyIds || resolvedAllowedPropertyIds.length === 0) {
        // Fetch from propertyService or do a quick Prisma query in the repository.
        // Since we are standardizing, we should fetch from a repo.
        // We will call a helper in BookingRepository.
        resolvedAllowedPropertyIds = await bookingRepository.findAllowedPropertyIds(options.userId);
      }
      if (resolvedAllowedPropertyIds.length === 0) {
        return { data: [], total: 0 }; // No access
      }
    }

    return await bookingRepository.findManyWithPagination({
      propertyId: searchParams.propertyId,
      allowedPropertyIds: role === 'admin' || role === 'super_admin' ? undefined : allowedPropertyIds,
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

  async cancelBooking(id: string, data: BookingCancellationDto) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError("Booking not found", 404, "NOT_FOUND");
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new AppError("Booking is already cancelled or expired", 400, "INVALID_STATE");
    }

    // --- ROOM MODULE INTEGRATION ---
    // Release locked inventory back to the available pool
    await propertyInventoryService.releaseRoomInventory(booking.roomId, 1);

    // Execute status update
    return await bookingRepository.updateStatus(id, 'CANCELLED', 'REFUNDED');
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
        } else if (["owner", "manager", "partner"].includes(authParams.role || "")) {
          const accesses = await bookingRepository.findAllowedPropertyIds(authParams.userId);
          if (accesses.includes(booking.propertyId)) {
            isAuthorized = true;
          }
        } else {
          // Verify if guest
          // Wait, user email vs guest email. We need user object.
          // For simplicity, guest email matching requires fetching user.
          // Instead, since this is a thin controller, we will fetch user using guestRepository or auth?
          // Since it's a domain service, we can fetch user from Prisma here? 
          // No, no Prisma in services!
          // We can use a helper in repository to check guest access.
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
