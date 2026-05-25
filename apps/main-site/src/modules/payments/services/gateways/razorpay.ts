import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";

export class RazorpayProvider implements IPaymentProvider {
  private apiKey: string;
  private secretKey: string;
  private merchantId: string;
  private isSandbox: boolean;

  constructor(config: { apiKey?: string; secretKey?: string; merchantId?: string; isSandbox?: boolean }) {
    this.apiKey = config.apiKey || "";
    this.secretKey = config.secretKey || "";
    this.merchantId = config.merchantId || "";
    this.isSandbox = !!config.isSandbox;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Return a mock checkout payment order link
    const mockOrderId = `order_rzp_${Date.now()}`;
    const mockPaymentUrl = `https://api.razorpay.com/v1/checkout/mock?order_id=${mockOrderId}&amount=${request.amount}`;

    return {
      success: true,
      gatewayOrderId: mockOrderId,
      paymentUrl: mockPaymentUrl,
      rawResponse: {
        message: "Razorpay order intent created successfully (sandbox mock)",
        orderId: mockOrderId,
        amount: request.amount,
        currency: request.currency
      }
    };
  }

  async verifyPayment(gatewayTransactionId: string, gatewayOrderId?: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    return {
      success: true,
      status: PaymentStatus.SUCCESS,
      rawResponse: {
        message: "Razorpay mock verification complete",
        paymentId: gatewayTransactionId,
        orderId: gatewayOrderId,
        status: "captured"
      }
    };
  }

  async refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    const mockRefundId = `rfnd_rzp_${Date.now()}`;
    return {
      success: true,
      refundId: mockRefundId,
      rawResponse: {
        message: "Razorpay mock refund processed",
        refundId: mockRefundId,
        amount
      }
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    // In the future, verify the webhook signature here
    const event = payload?.event as string | undefined;
    const innerPayload = payload?.payload as Record<string, unknown> | undefined;
    const payment = innerPayload?.payment as Record<string, unknown> | undefined;
    const paymentEntity = payment?.entity as Record<string, unknown> | undefined;
    
    if (event === "payment.captured" && paymentEntity) {
      const notes = paymentEntity.notes as Record<string, string> | undefined;
      return {
        processed: true,
        status: PaymentStatus.SUCCESS,
        transactionId: notes?.transactionId || notes?.transaction_id
      };
    }

    return {
      processed: false,
      status: PaymentStatus.PENDING
    };
  }
}
