import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";

export class ManualUpiProvider implements IPaymentProvider {
  private upiId: string;
  private qrImageUrl: string;
  private instructions: string;

  constructor(config: { upiId?: string; qrImageUrl?: string; instructions?: string }) {
    this.upiId = config.upiId || "payments@home4stay";
    this.qrImageUrl = config.qrImageUrl || "";
    this.instructions = config.instructions || "Please complete the payment to our UPI ID and submit your 12-digit UTR transaction reference.";
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Generate UPI deep-link payload: upi://pay?pa=address&pn=name&am=amount&cu=INR
    const encodedName = encodeURIComponent("Home4Stay Bookings");
    const upiDeepLink = `upi://pay?pa=${this.upiId}&pn=${encodedName}&am=${request.amount}&cu=${request.currency}&tr=${request.transactionId}`;

    return {
      success: true,
      qrCodeUrl: this.qrImageUrl || upiDeepLink,
      rawResponse: {
        message: "Manual UPI payment initialized",
        upiId: this.upiId,
        instructions: this.instructions,
        deepLink: upiDeepLink
      }
    };
  }

  async verifyPayment(): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    // Manual UPI payments require human review (UTR verification)
    return {
      success: false,
      status: PaymentStatus.PENDING_APPROVAL,
      rawResponse: {
        message: "Manual review required. Admin must verify UTR number in dashboard ledger."
      }
    };
  }

  async refundPayment(): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    // Manual refunds are executed offline by operations teams
    return {
      success: true,
      refundId: `REFUND-MANUAL-${Date.now()}`,
      rawResponse: {
        message: "Manual refund marked. Operations team must disburse funds out-of-band."
      }
    };
  }

  async handleWebhook(): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    // Webhooks are not supported for manual UPI transfers
    return {
      processed: false,
      status: PaymentStatus.PENDING
    };
  }
}
