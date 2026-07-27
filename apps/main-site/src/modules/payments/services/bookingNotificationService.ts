import { queueEmail } from "./emailQueue";
import { 
  sendBookingConfirmationEmail, 
  sendPaymentRejectedEmail, 
  sendBookingExpiredEmail, 
  sendInvoiceGeneratedEmail 
} from "@/lib/server/transactionalEmail";
import { eventBroadcaster } from "./eventBroadcaster";

export class BookingNotificationService {
  static async sendConfirmation(params: {
    bookingId: string;
    propertyId: string;
    guestName: string;
    guestEmail: string;
    propertyName: string;
    roomName: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    invoiceNumber?: string;
    paymentReference?: string | null;
    utrNumber?: string | null;
  }) {
    const emailDetails = {
      guestName: params.guestName,
      propertyName: params.propertyName,
      roomName: params.roomName,
      checkIn: new Date(params.startDate).toLocaleDateString("en-IN"),
      checkOut: new Date(params.endDate).toLocaleDateString("en-IN"),
      amount: params.amount,
      bookingId: params.bookingId,
      invoiceNumber: params.invoiceNumber || "",
      paymentRef: params.utrNumber || "VERIFIED"
    };

    try {
      const confEmail = await sendBookingConfirmationEmail(params.guestEmail, emailDetails);
      await queueEmail(params.guestEmail, confEmail.subject, confEmail.html);

      const invEmail = await sendInvoiceGeneratedEmail(params.guestEmail, emailDetails);
      const htmlWithComment = `${invEmail.html}\n<!-- bookingId: ${params.bookingId} -->`;
      await queueEmail(params.guestEmail, invEmail.subject, htmlWithComment);
    } catch (err) {
      console.error("[BookingNotificationService] Confirmation email failed:", err);
    }

    eventBroadcaster.broadcast("BOOKING_CONFIRMED", {
      bookingId: params.bookingId,
      propertyId: params.propertyId,
      amount: params.amount,
      paymentStatus: "paid",
      status: "confirmed",
      paymentReference: params.paymentReference || undefined,
      utrNumber: params.utrNumber || undefined,
      timestamp: new Date().toISOString()
    });
  }

  static async sendRejection(params: {
    bookingId: string;
    propertyId: string;
    guestName: string;
    guestEmail: string;
    propertyName: string;
    roomName: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    rejectionReason?: string;
    paymentReference?: string | null;
    utrNumber?: string | null;
  }) {
    const emailDetails = {
      guestName: params.guestName,
      propertyName: params.propertyName,
      roomName: params.roomName,
      checkIn: new Date(params.startDate).toLocaleDateString("en-IN"),
      checkOut: new Date(params.endDate).toLocaleDateString("en-IN"),
      amount: params.amount,
      bookingId: params.bookingId,
      rejectionReason: params.rejectionReason || "UTR number could not be reconciled with banking statement transactions."
    };

    try {
      const rejectMail = await sendPaymentRejectedEmail(params.guestEmail, emailDetails);
      await queueEmail(params.guestEmail, rejectMail.subject, rejectMail.html);
    } catch (err) {
      console.error("[BookingNotificationService] Rejection email failed:", err);
    }

    eventBroadcaster.broadcast("PAYMENT_REJECTED", {
      bookingId: params.bookingId,
      propertyId: params.propertyId,
      amount: params.amount,
      paymentStatus: "rejected",
      status: "rejected",
      paymentReference: params.paymentReference || undefined,
      utrNumber: params.utrNumber || undefined,
      timestamp: new Date().toISOString()
    });
  }

  static async sendExpiry(params: {
    bookingId: string;
    propertyId: string;
    guestName: string;
    guestEmail: string;
    propertyName: string;
    roomName: string;
    startDate: Date;
    endDate: Date;
    amount: number;
  }) {
    const emailDetails = {
      guestName: params.guestName,
      propertyName: params.propertyName,
      roomName: params.roomName,
      checkIn: new Date(params.startDate).toLocaleDateString("en-IN"),
      checkOut: new Date(params.endDate).toLocaleDateString("en-IN"),
      amount: params.amount,
      bookingId: params.bookingId
    };

    try {
      const expireMail = await sendBookingExpiredEmail(params.guestEmail, emailDetails);
      await queueEmail(params.guestEmail, expireMail.subject, expireMail.html);
    } catch (err) {
      console.error("[BookingNotificationService] Expiry email failed:", err);
    }

    eventBroadcaster.broadcast("BOOKING_EXPIRED", {
      bookingId: params.bookingId,
      propertyId: params.propertyId,
      amount: params.amount,
      paymentStatus: "rejected",
      status: "expired",
      timestamp: new Date().toISOString()
    });
  }
}
