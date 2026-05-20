import { 
  PaymentProvider, 
  PaymentIntentResult, 
  PaymentVerificationResult, 
  BookingPaymentState, 
  PaymentRefundResult, 
  WebhookResult 
} from "@/modules/payments/types";
import { generateQrDataUri } from "@/modules/payments/utils/qr";
import { prisma } from "@/lib/database/prisma";

export class SmartUpiProvider implements PaymentProvider {
  /**
   * Generates a unique decimal amount lease for a base amount to prevent collision.
   * e.g. If two people pay 5000 INR, one pays 5000.01 and the other 5000.02.
   */
  private async acquireUniqueDecimalAmount(baseAmount: number): Promise<number> {
    const integerPart = Math.floor(baseAmount);
    
    // Find all active bookings of the same base amount whose payment window is still valid (not expired)
    const activeBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: {
          in: ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "UNDER_OWNER_VERIFICATION"]
        },
        paymentExpiresAt: {
          gt: new Date()
        },
        amount: {
          gte: integerPart,
          lt: integerPart + 1.0
        }
      },
      select: {
        amount: true
      }
    });

    const activeDecimals = new Set(
      activeBookings.map(b => Math.round((b.amount - integerPart) * 100))
    );

    // Scan for the first free decimal offset from 0.01 to 0.99
    for (let offset = 1; offset <= 99; offset++) {
      if (!activeDecimals.has(offset)) {
        return integerPart + offset / 100;
      }
    }

    // High traffic fallback: random decimal or base integer
    const randomOffset = Math.floor(Math.random() * 99) + 1;
    return integerPart + randomOffset / 100;
  }

  async createPaymentIntent(
    bookingId: string,
    amount: number,
    config: {
      upiId?: string | null;
      merchantName?: string | null;
    }
  ): Promise<PaymentIntentResult> {
    try {
      if (!config.upiId) {
        return {
          success: false,
          paymentReference: "",
          reconciliationAmount: amount,
          expiresAt: new Date(),
          error: "UPI ID is not configured for this property"
        };
      }

      const upiId = config.upiId;
      const merchantName = config.merchantName || "Home4Stay Merchant";
      const referenceNote = `H4S${bookingId.substring(0, 8).toUpperCase()}`;

      // Allocate unique decimal amount for reconciliation
      const reconciledAmount = await this.acquireUniqueDecimalAmount(amount);

      // Define standard 15 minute payment expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Construct upi://pay URI
      const deepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${reconciledAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(referenceNote)}`;
      
      // Generate standard base64 QR Data URI
      const qrPayload = generateQrDataUri(deepLink, 280);

      // Persist the unique reconciliation amount and reference to the booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          amount: reconciledAmount, // Update booking amount to the precise reconciled amount
          paymentMode: "SMART_UPI",
          paymentStatus: "PENDING_PAYMENT",
          paymentReference: referenceNote,
          paymentExpiresAt: expiresAt,
          temporaryInventoryLockedUntil: expiresAt
        }
      });

      return {
        success: true,
        paymentReference: referenceNote,
        reconciliationAmount: reconciledAmount,
        qrPayload,
        deepLink,
        expiresAt
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error creating payment intent in SmartUpiProvider:", message);
      return {
        success: false,
        paymentReference: "",
        reconciliationAmount: amount,
        expiresAt: new Date(),
        error: message
      };
    }
  }

  async verifyPayment(
    bookingId: string,
    params: { utrNumber?: string }
  ): Promise<PaymentVerificationResult> {
    try {
      if (!params.utrNumber) {
        return {
          success: false,
          status: BookingPaymentState.PENDING_PAYMENT,
          error: "UTR Number is required for manual verification"
        };
      }

      // Check if UTR is already used by another booking to prevent duplicate submissions
      const duplicateUtr = await prisma.booking.findFirst({
        where: {
          utrNumber: params.utrNumber,
          id: { not: bookingId }
        }
      });

      if (duplicateUtr) {
        return {
          success: false,
          status: BookingPaymentState.PENDING_PAYMENT,
          error: "This UTR number has already been submitted for another booking"
        };
      }

      // Set booking payment status to UNDER_OWNER_VERIFICATION once UTR is submitted
      const now = new Date();
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "UNDER_OWNER_VERIFICATION",
          utrNumber: params.utrNumber,
          paymentSubmittedAt: now
        }
      });

      return {
        success: true,
        status: BookingPaymentState.UNDER_OWNER_VERIFICATION,
        utrNumber: params.utrNumber,
        verifiedAt: now
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error verifying payment in SmartUpiProvider:", message);
      return {
        success: false,
        status: BookingPaymentState.PENDING_PAYMENT,
        error: message
      };
    }
  }

  async expirePayment(bookingId: string): Promise<boolean> {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "EXPIRED"
        }
      });
      return true;
    } catch (err) {
      console.error("Error expiring payment:", err);
      return false;
    }
  }

  async refundPayment(bookingId: string, amount: number): Promise<PaymentRefundResult> {
    // Smart UPI is a direct bank-to-bank mode; automated programmatic refunds are not supported.
    // They must be manually processed by the merchant/owner.
    return {
      success: false,
      amount,
      error: "Automated refunds are not supported for SMART_UPI. Please initiate a manual bank refund."
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, unknown>
  ): Promise<WebhookResult> {
    // Avoid unused variable warnings by logging/referencing payload and headers
    console.log("Smart UPI Webhook ignored payload type:", typeof payload, "headers type:", typeof headers);
    return {
      processed: false,
      error: "Webhooks are not supported for SMART_UPI."
    };
  }

  async getPaymentStatus(bookingId: string): Promise<BookingPaymentState> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { paymentStatus: true }
    });
    return (booking?.paymentStatus as BookingPaymentState) || BookingPaymentState.PENDING_PAYMENT;
  }
}
