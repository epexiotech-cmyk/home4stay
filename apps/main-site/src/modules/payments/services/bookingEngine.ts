import { prisma } from "@/lib/database/prisma";
import { eventBroadcaster } from "./eventBroadcaster";
import { InvoiceNumberingService } from "./invoiceNumberingService";
import { InvoicePdfGenerator } from "./invoicePdfGenerator";
import { InvoiceStorageService } from "./invoiceStorageService";
import { AuditLogService } from "./auditLogService";
import { queueEmail } from "./emailQueue";
import { 
  sendBookingConfirmationEmail, 
  sendPaymentRejectedEmail, 
  sendBookingExpiredEmail, 
  sendInvoiceGeneratedEmail 
} from "@/lib/server/transactionalEmail";

export interface BookingEngineResult {
  success: boolean;
  message: string;
  invoiceNumber?: string;
}

class BookingEngine {
  private static instance: BookingEngine;

  private constructor() {}

  public static getInstance(): BookingEngine {
    if (!BookingEngine.instance) {
      BookingEngine.instance = new BookingEngine();
    }
    return BookingEngine.instance;
  }

  /**
   * Safe Confirmation Transaction Workflow (Owner Approves)
   */
  public async confirmBooking(bookingId: string, ownerUserId?: string): Promise<BookingEngineResult> {
    try {
      // 1. Run database state changes inside an optimized transaction
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Fetch booking under transaction isolation lock
        const booking = await tx.booking.findUnique({
          where: { id: bookingId }
        });

        if (!booking) {
          throw new Error("Booking not found.");
        }

        // Idempotency check: Already confirmed checks to avoid replay-attack hazards
        if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
          const inv = await tx.invoiceRecord.findFirst({ where: { bookingId } });
          return { 
            alreadyDone: true,
            booking,
            invoiceNumber: inv?.invoiceNumber 
          };
        }

        // Enforce source state
        if (booking.paymentStatus !== "UNDER_OWNER_VERIFICATION") {
            throw new Error(`Cannot verify payment from state: ${booking.paymentStatus}`);
        }

        // Multi-tenant property access guard
        if (ownerUserId) {
          const user = await tx.user.findUnique({ where: { id: ownerUserId } });
          if (user && !["admin", "super_admin"].includes(user.role)) {
            const hasAccess = await tx.propertyUserAccess.findUnique({
              where: {
                propertyId_userId: {
                  propertyId: booking.propertyId,
                  userId: ownerUserId
                }
              }
            });
            if (!hasAccess) {
              throw new Error("Unauthorized multi-tenant action denied.");
            }
          }
        }

        // Fetch property and room descriptions for notifications
        const property = await tx.property.findUnique({ where: { id: booking.propertyId } });
        const room = await tx.room.findUnique({ where: { id: booking.roomId } });
        const primaryGuestJoin = await tx.bookingGuest.findFirst({
          where: { bookingId, isPrimaryGuest: true },
          include: { guest: true }
        });
        const guestName = primaryGuestJoin?.guest.fullName || "Guest";
        const guestEmail = primaryGuestJoin?.guest.email || "billing@home4stay.homes";
        const guestPhone = primaryGuestJoin?.guest.mobile || "N/A";
        const guestUserId = primaryGuestJoin?.guest.id || ""; // target notification user

        // Allocate thread-safe sequential invoice serial number
        const invoiceNumber = await InvoiceNumberingService.generateInvoiceNumber({ regionCode: "IN" });

        // Atomic state update with conditional check
        const updateResult = await tx.booking.updateMany({
          where: { 
            id: bookingId,
            paymentStatus: "UNDER_OWNER_VERIFICATION" 
          },
          data: {
            status: "confirmed",
            paymentStatus: "paid",
            paymentVerifiedAt: new Date(),
            temporaryInventoryLockedUntil: null // Release lease lock safely
          }
        });

        if (updateResult.count === 0) {
          throw new Error("Concurrency conflict: The booking payment state was modified by another request.");
        }

        // Create Invoice Record
        await tx.invoiceRecord.create({
          data: {
            bookingId,
            invoiceNumber,
            status: "PAID",
            paymentReference: booking.paymentReference,
            utrNumber: booking.utrNumber
          }
        });

        // Store Unread In-App Notifications for Guest
        await tx.notification.create({
          data: {
            userId: guestUserId,
            bookingId,
            title: "Booking Confirmed! 🎉",
            message: `Your reservation at ${property?.title || "Home4Stay"} is verified. Enjoy your stay!`,
            type: "BOOKING_CONFIRMED"
          }
        });

        // Store Unread In-App Notifications for Host Owner
        if (ownerUserId) {
          await tx.notification.create({
            data: {
              userId: ownerUserId,
              bookingId,
              title: "Payment Approved ✅",
              message: `Verified ₹${booking.amount} for stay reservation ${bookingId.substring(0, 8).toUpperCase()} (${guestName}).`,
              type: "PAYMENT_CONFIRMED"
            }
          });
        }

        return {
          alreadyDone: false,
          booking,
          invoiceNumber,
          property,
          room,
          guestName,
          guestEmail,
          guestPhone,
          guestUserId
        };
      });

      if (transactionResult.alreadyDone) {
        return { 
          success: true, 
          message: "Booking already verified and confirmed.",
          invoiceNumber: transactionResult.invoiceNumber 
        };
      }

      const {
        booking,
        invoiceNumber,
        property,
        room,
        guestName,
        guestEmail,
        guestPhone
      } = transactionResult;

      // 2. Perform file operations and network triggers OUTSIDE database transaction block
      // This is a crucial performance optimization preventing database thread hold latency
      try {
        const nightsCount = Math.max(1, Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const baseAmount = booking.amount / 1.12;
        const gstAmount = booking.amount - baseAmount;

        // Compile High-fidelity PDF Document in-memory
        const pdfBuffer = await InvoicePdfGenerator.generate({
          bookingId,
          invoiceNumber: invoiceNumber!,
          guestName: guestName || "Guest",
          guestEmail: guestEmail || "billing@home4stay.homes",
          guestPhone: guestPhone || "N/A",
          propertyName: property?.title || "Home4Stay Resort",
          propertyAddress: property?.title || "Premium Hospitality Stay",
          roomName: room?.name || "Luxury Suite",
          checkIn: new Date(booking.startDate).toLocaleDateString("en-IN"),
          checkOut: new Date(booking.endDate).toLocaleDateString("en-IN"),
          nightsCount,
          baseAmount,
          gstAmount,
          totalAmount: booking.amount,
          paymentMode: booking.paymentMode || "UPI",
          paymentRef: booking.paymentReference || "SUCCESS",
          utrNumber: booking.utrNumber || "VERIFIED"
        });

        // Persist PDF inside local isolated folder path
        await InvoiceStorageService.saveInvoicePdf(bookingId, pdfBuffer);

        // Record central Immutable Audit Log
        await AuditLogService.logAction({
          userId: ownerUserId,
          action: "BOOKING_CONFIRMED",
          resourceType: "booking",
          resourceId: bookingId,
          status: "SUCCESS",
          metadata: { invoiceNumber, amount: booking.amount }
        });

        // Queue beautiful confirmation and invoice transactional emails
        const emailDetails = {
          guestName: guestName || "Guest",
          propertyName: property?.title || "Home4Stay Resort",
          roomName: room?.name || "Luxury Suite",
          checkIn: new Date(booking.startDate).toLocaleDateString("en-IN"),
          checkOut: new Date(booking.endDate).toLocaleDateString("en-IN"),
          amount: booking.amount,
          bookingId,
          invoiceNumber: invoiceNumber || "",
          paymentRef: booking.utrNumber || "VERIFIED"
        };

        // Queue Booking Confirmed Email
        const confEmail = await sendBookingConfirmationEmail(guestEmail || "billing@home4stay.homes", emailDetails);
        await queueEmail(guestEmail || "billing@home4stay.homes", confEmail.subject, confEmail.html);

        // Queue Invoice Generated Email with embedded bookingId to trigger attachment handling
        const invEmail = await sendInvoiceGeneratedEmail(guestEmail || "billing@home4stay.homes", emailDetails);
        const htmlWithComment = `${invEmail.html}\n<!-- bookingId: ${bookingId} -->`;
        await queueEmail(guestEmail || "billing@home4stay.homes", invEmail.subject, htmlWithComment);

      } catch (err) {
        console.error("[BookingEngine] Post-transaction billing operations failed:", err);
        // Do not crash the return since database states have committed successfully
      }

      // Emit real-time Event Broadcast via SSE pipelines
      eventBroadcaster.broadcast("BOOKING_CONFIRMED", {
        bookingId,
        propertyId: booking.propertyId,
        amount: booking.amount,
        paymentStatus: "paid",
        status: "confirmed",
        paymentReference: booking.paymentReference || undefined,
        utrNumber: booking.utrNumber || undefined,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        message: "Booking verified and room inventory reserved successfully.",
        invoiceNumber 
      };

    } catch (error) {
      console.error("[BookingEngine] Confirmation transaction crashed:", error);
      const message = error instanceof Error ? error.message : "Confirmation failed.";
      return { success: false, message };
    }
  }

  /**
   * Safe Rejection Transaction Workflow (Owner Rejects)
   */
  public async rejectBooking(bookingId: string, ownerUserId?: string, rejectionReason?: string): Promise<BookingEngineResult> {
    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Fetch booking
        const booking = await tx.booking.findUnique({
          where: { id: bookingId }
        });

        if (!booking) {
          throw new Error("Booking not found.");
        }

        // Idempotency check: Already rejected checks to avoid double release holds
        if (booking.status === "rejected" || booking.status === "cancelled") {
          return { alreadyDone: true, booking };
        }

        // Multi-tenant access check
        if (ownerUserId) {
          const user = await tx.user.findUnique({ where: { id: ownerUserId } });
          if (user && !["admin", "super_admin"].includes(user.role)) {
            const hasAccess = await tx.propertyUserAccess.findUnique({
              where: {
                propertyId_userId: {
                  propertyId: booking.propertyId,
                  userId: ownerUserId
                }
              }
            });
            if (!hasAccess) {
              throw new Error("Unauthorized multi-tenant action denied.");
            }
          }
        }

        const property = await tx.property.findUnique({ where: { id: booking.propertyId } });
        const primaryGuestJoin = await tx.bookingGuest.findFirst({
          where: { bookingId, isPrimaryGuest: true },
          include: { guest: true }
        });
        const guestName = primaryGuestJoin?.guest.fullName || "Guest";
        const guestEmail = primaryGuestJoin?.guest.email || "billing@home4stay.homes";
        const guestUserId = primaryGuestJoin?.guest.id || "";



        // Update booking record
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "rejected",
            paymentStatus: "rejected",
            temporaryInventoryLockedUntil: null
          }
        });

        // Store In-App Notifications for Guest
        await tx.notification.create({
          data: {
            userId: guestUserId,
            bookingId,
            title: "Payment Declined ❌",
            message: `Your payment proof for reservation was declined. Please verify your receipt details.`,
            type: "PAYMENT_REJECTED"
          }
        });

        // Store In-App Notifications for Host Owner
        if (ownerUserId) {
          await tx.notification.create({
            data: {
              userId: ownerUserId,
              bookingId,
              title: "Payment Rejected ⚠️",
              message: `Declined payment UTR for stay reservation ${bookingId.substring(0, 8).toUpperCase()} (${guestName}).`,
              type: "PAYMENT_REJECTED"
            }
          });
        }

        return {
          alreadyDone: false,
          booking,
          property,
          guestName,
          guestEmail
        };
      });

      if (transactionResult.alreadyDone) {
        return { success: true, message: "Booking already cancelled or rejected." };
      }

      const { booking, property, guestName, guestEmail } = transactionResult;

      try {
        // Record Audit Log
        await AuditLogService.logAction({
          userId: ownerUserId,
          action: "PAYMENT_REJECTED",
          resourceType: "booking",
          resourceId: bookingId,
          status: "SUCCESS",
          metadata: { reason: rejectionReason || "Manual decline" }
        });

        // Queue Payment Rejected Transactional Email
        const emailDetails = {
          guestName: guestName || "Guest",
          propertyName: property?.title || "Home4Stay Resort",
          roomName: "Luxury Suite",
          checkIn: new Date(booking.startDate).toLocaleDateString("en-IN"),
          checkOut: new Date(booking.endDate).toLocaleDateString("en-IN"),
          amount: booking.amount,
          bookingId,
          rejectionReason: rejectionReason || "UTR number could not be reconciled with banking statement transactions."
        };

        const rejectMail = await sendPaymentRejectedEmail(guestEmail || "billing@home4stay.homes", emailDetails);
        await queueEmail(guestEmail || "billing@home4stay.homes", rejectMail.subject, rejectMail.html);

      } catch (err) {
        console.error("[BookingEngine] Post-transaction rejection operations failed:", err);
      }

      // Broadcast Real-time event
      eventBroadcaster.broadcast("PAYMENT_REJECTED", {
        bookingId,
        propertyId: booking.propertyId,
        amount: booking.amount,
        paymentStatus: "rejected",
        status: "rejected",
        paymentReference: booking.paymentReference || undefined,
        utrNumber: booking.utrNumber || undefined,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: "Booking declined and room hold released." };

    } catch (error) {
      console.error("[BookingEngine] Rejection transaction crashed:", error);
      const message = error instanceof Error ? error.message : "Rejection failed.";
      return { success: false, message };
    }
  }

  /**
   * Safe Expiry Transaction Workflow (Holds Timeout Cleanup)
   */
  public async expireBooking(bookingId: string): Promise<BookingEngineResult> {
    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId }
        });

        if (!booking) {
          throw new Error("Booking not found.");
        }

        // Idempotency: only expire if it is pending and has active holds
        if (booking.status !== "pending" || booking.paymentStatus !== "pending_payment") {
          return { alreadyDone: true, booking };
        }

        const property = await tx.property.findUnique({ where: { id: booking.propertyId } });
        const primaryGuestJoin = await tx.bookingGuest.findFirst({
          where: { bookingId, isPrimaryGuest: true },
          include: { guest: true }
        });
        const guestName = primaryGuestJoin?.guest.fullName || "Guest";
        const guestEmail = primaryGuestJoin?.guest.email || "billing@home4stay.homes";
        const guestUserId = primaryGuestJoin?.guest.id || "";



        // Mark booking as expired
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "expired",
            paymentStatus: "rejected",
            temporaryInventoryLockedUntil: null
          }
        });

        // Create In-App Notification
        await tx.notification.create({
          data: {
            userId: guestUserId,
            bookingId,
            title: "Reservation Expired ⏱️",
            message: `Your payment window for stay has expired. The locked inventory hold is released.`,
            type: "BOOKING_EXPIRED"
          }
        });

        return {
          alreadyDone: false,
          booking,
          property,
          guestName,
          guestEmail
        };
      });

      if (transactionResult.alreadyDone) {
        return { success: true, message: "Booking is not in an active holds pending status." };
      }

      const { booking, property, guestName, guestEmail } = transactionResult;

      try {
        // Record Audit Log
        await AuditLogService.logAction({
          action: "BOOKING_EXPIRED",
          resourceType: "booking",
          resourceId: bookingId,
          status: "SUCCESS",
          metadata: { details: "Lease lock time window exceeded" }
        });

        // Queue Booking Hold Expired Transactional Email
        const emailDetails = {
          guestName: guestName || "Guest",
          propertyName: property?.title || "Home4Stay Resort",
          roomName: "Luxury Suite",
          checkIn: new Date(booking.startDate).toLocaleDateString("en-IN"),
          checkOut: new Date(booking.endDate).toLocaleDateString("en-IN"),
          amount: booking.amount,
          bookingId
        };

        const expireMail = await sendBookingExpiredEmail(guestEmail || "billing@home4stay.homes", emailDetails);
        await queueEmail(guestEmail || "billing@home4stay.homes", expireMail.subject, expireMail.html);

      } catch (err) {
        console.error("[BookingEngine] Post-transaction expiry operations failed:", err);
      }

      // Broadcast event
      eventBroadcaster.broadcast("BOOKING_EXPIRED", {
        bookingId,
        propertyId: booking.propertyId,
        amount: booking.amount,
        paymentStatus: "rejected",
        status: "expired",
        timestamp: new Date().toISOString()
      });

      return { success: true, message: "Booking holds lease automatically expired successfully." };

    } catch (error) {
      console.error("[BookingEngine] Expiry transaction crashed:", error);
      const message = error instanceof Error ? error.message : "Expiry failed.";
      return { success: false, message };
    }
  }
}

export const bookingEngine = BookingEngine.getInstance();

