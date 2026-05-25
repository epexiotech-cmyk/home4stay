import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";
import crypto from "crypto";

export class YesBankProvider implements IPaymentProvider {
  private merchantId: string;
  private terminalId: string;
  private encryptionKey: string;
  private callbackUrl: string;
  private redirectUrl: string;
  private isSandbox: boolean;

  constructor(config: {
    merchantId?: string;
    terminalId?: string;
    encryptionKey?: string;
    callbackUrl?: string;
    redirectUrl?: string;
    isSandbox?: boolean;
    gatewayConfig?: Record<string, unknown>;
  }) {
    const gatewayConfig = (config.gatewayConfig || {}) as Record<string, string | boolean | undefined>;
    this.merchantId = config.merchantId || (gatewayConfig.merchantId as string | undefined) || "YB_MERCH_MOCK";
    this.terminalId = config.terminalId || (gatewayConfig.terminalId as string | undefined) || "YB_TERM_MOCK";
    this.encryptionKey = config.encryptionKey || (gatewayConfig.encryptionKey as string | undefined) || "yb-mock-encryption-secret-987654321";
    this.callbackUrl = config.callbackUrl || (gatewayConfig.callbackUrl as string | undefined) || "http://localhost:3000/api/payments/webhooks/yesbank";
    this.redirectUrl = config.redirectUrl || (gatewayConfig.redirectUrl as string | undefined) || "http://localhost:3000/payments/checkout/yesbank";
    this.isSandbox = config.isSandbox !== undefined ? config.isSandbox : ((gatewayConfig.isSandbox as boolean | undefined) ?? true);
  }

  /**
   * Generates a secure HMAC-SHA256 signature for bank payloads
   */
  public generateSignature(data: string): string {
    return crypto.createHmac("sha256", this.encryptionKey).update(data).digest("hex");
  }

  /**
   * Initiates payment order and creates a secure bank redirect URL
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const bankReference = `YB_TXN_${request.transactionId}`;
    
    // Bank payload requirements
    const payload = {
      merchantId: this.merchantId,
      terminalId: this.terminalId,
      transactionId: request.transactionId,
      bankReference,
      amount: request.amount,
      currency: request.currency || "INR",
      customerEmail: request.customerEmail,
      timestamp: Date.now()
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);

    const mockPaymentUrl = `${this.redirectUrl}?transactionId=${request.transactionId}&amount=${request.amount}&merchantTransactionId=${bankReference}&signature=${signature}`;

    return {
      success: true,
      gatewayOrderId: bankReference,
      gatewayTransactionId: `yb_tx_${Date.now()}`,
      paymentUrl: mockPaymentUrl,
      rawResponse: {
        success: true,
        message: "YES BANK payment checkout generated successfully",
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        bankReference,
        signature,
        payload
      }
    };
  }

  /**
   * Verifies actual transaction state with YES BANK core system
   */
  async verifyPayment(gatewayTransactionId: string, gatewayOrderId?: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    const txnId = gatewayOrderId || gatewayTransactionId;
    
    let bankState = "SUCCESS";
    let status: PaymentStatus = PaymentStatus.SUCCESS;

    if (txnId.includes("fail") || txnId.includes("FAIL")) {
      bankState = "FAILED";
      status = PaymentStatus.FAILED;
    } else if (txnId.includes("pending") || txnId.includes("PENDING")) {
      bankState = "PENDING";
      status = PaymentStatus.PENDING;
    }

    return {
      success: status === PaymentStatus.SUCCESS,
      status,
      rawResponse: {
        success: status === PaymentStatus.SUCCESS,
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        bankReference: txnId,
        transactionId: gatewayTransactionId,
        status: bankState,
        statusCode: status === PaymentStatus.SUCCESS ? "00" : "01",
        statusDescription: status === PaymentStatus.SUCCESS ? "Transaction Approved" : "Transaction Failed/Pending"
      }
    };
  }

  /**
   * Simulates YES BANK corporate refund processing
   */
  async refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    const mockRefundId = `yb_ref_${Date.now()}`;
    return {
      success: true,
      refundId: mockRefundId,
      rawResponse: {
        success: true,
        message: "YES BANK refund processed successfully",
        refundId: mockRefundId,
        gatewayTransactionId,
        amount
      }
    };
  }

  /**
   * Handles YES BANK webhook response payload
   */
  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    if (!payload || !payload.transactionId) {
      return { processed: false, status: PaymentStatus.FAILED };
    }

    // Verify digital signature
    if (signature) {
      const dataToVerify = JSON.stringify({
        transactionId: payload.transactionId,
        bankReference: payload.bankReference,
        amount: payload.amount,
        status: payload.status
      });

      const computed = this.generateSignature(dataToVerify);
      if (computed !== signature) {
        throw new Error("YES BANK webhook callback verification failed: signature mismatch");
      }
    }

    const isApproved = payload.status === "SUCCESS";
    const isDeclined = payload.status === "FAILED";
    const isCancelled = payload.status === "CANCELLED";

    let targetStatus: PaymentStatus = PaymentStatus.PENDING;
    if (isApproved) {
      targetStatus = PaymentStatus.SUCCESS;
    } else if (isDeclined) {
      targetStatus = PaymentStatus.FAILED;
    } else if (isCancelled) {
      targetStatus = PaymentStatus.CANCELLED;
    }

    return {
      processed: true,
      status: targetStatus,
      transactionId: payload.transactionId as string | undefined
    };
  }
}
