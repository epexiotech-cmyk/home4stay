import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";

export class CashfreeProvider implements IPaymentProvider {
  private apiKey: string;
  private secretKey: string;
  private isSandbox: boolean;

  constructor(config: { apiKey?: string; secretKey?: string; isSandbox?: boolean }) {
    this.apiKey = config.apiKey || "";
    this.secretKey = config.secretKey || "";
    this.isSandbox = !!config.isSandbox;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const mockOrderId = `cf_order_${Date.now()}`;
    const mockPaymentUrl = `https://payments.cashfree.com/order/${mockOrderId}`;

    return {
      success: true,
      gatewayOrderId: mockOrderId,
      paymentUrl: mockPaymentUrl,
      rawResponse: {
        message: "Cashfree order token created (sandbox mock)",
        orderId: mockOrderId,
        amount: request.amount
      }
    };
  }

  async verifyPayment(gatewayTransactionId: string, gatewayOrderId?: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    return {
      success: true,
      status: PaymentStatus.SUCCESS,
      rawResponse: {
        message: "Cashfree mock verification retrieved",
        orderId: gatewayOrderId,
        transactionId: gatewayTransactionId,
        orderStatus: "PAID"
      }
    };
  }

  async refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    const mockRefundId = `cf_ref_${Date.now()}`;
    return {
      success: true,
      refundId: mockRefundId,
      rawResponse: {
        message: "Cashfree mock refund succeeded",
        refundId: mockRefundId,
        amount
      }
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    const txStatus = payload?.txStatus as string | undefined;
    const orderId = payload?.orderId as string | undefined;

    if (txStatus === "SUCCESS" && orderId) {
      // In production, cashfree can match orderId or custom metadata
      return {
        processed: true,
        status: PaymentStatus.SUCCESS,
        transactionId: payload?.referenceId as string | undefined
      };
    }

    return {
      processed: false,
      status: PaymentStatus.PENDING
    };
  }
}
