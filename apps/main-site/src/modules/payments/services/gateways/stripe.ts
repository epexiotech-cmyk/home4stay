import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";

export class StripeProvider implements IPaymentProvider {
  private apiKey: string;
  private secretKey: string;
  private webhookSecret: string;
  private isSandbox: boolean;

  constructor(config: { apiKey?: string; secretKey?: string; webhookSecret?: string; isSandbox?: boolean }) {
    this.apiKey = config.apiKey || "";
    this.secretKey = config.secretKey || "";
    this.webhookSecret = config.webhookSecret || "";
    this.isSandbox = !!config.isSandbox;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const mockSessionId = `cs_stripe_${Date.now()}`;
    const mockPaymentUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;

    return {
      success: true,
      gatewayOrderId: mockSessionId,
      paymentUrl: mockPaymentUrl,
      rawResponse: {
        message: "Stripe checkout session initialized (sandbox mock)",
        sessionId: mockSessionId,
        amount: request.amount
      }
    };
  }

  async verifyPayment(gatewayTransactionId: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    return {
      success: true,
      status: PaymentStatus.SUCCESS,
      rawResponse: {
        message: "Stripe mock payment status retrieved",
        paymentIntentId: gatewayTransactionId,
        status: "succeeded"
      }
    };
  }

  async refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    const mockRefundId = `re_stripe_${Date.now()}`;
    return {
      success: true,
      refundId: mockRefundId,
      rawResponse: {
        message: "Stripe mock refund succeeded",
        refundId: mockRefundId,
        amount
      }
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    const type = payload?.type as string | undefined;
    const data = payload?.data as Record<string, unknown> | undefined;
    const object = data?.object as Record<string, unknown> | undefined;

    if (type === "checkout.session.completed" && object) {
      const metadata = object.metadata as Record<string, string> | undefined;
      return {
        processed: true,
        status: PaymentStatus.SUCCESS,
        transactionId: metadata?.transactionId || metadata?.transaction_id
      };
    }

    return {
      processed: false,
      status: PaymentStatus.PENDING
    };
  }
}
