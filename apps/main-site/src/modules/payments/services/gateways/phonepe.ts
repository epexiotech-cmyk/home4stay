import { IPaymentProvider, PaymentRequest, PaymentResponse } from "../interfaces";
import { PaymentStatus } from "@prisma/client";
import crypto from "crypto";

export class PhonePeProvider implements IPaymentProvider {
  private merchantId: string;
  private saltKey: string;
  private saltIndex: string;
  private callbackUrl: string;
  private redirectUrl: string;
  private isSandbox: boolean;

  constructor(config: {
    merchantId?: string;
    saltKey?: string;
    saltIndex?: string;
    callbackUrl?: string;
    redirectUrl?: string;
    isSandbox?: boolean;
    gatewayConfig?: Record<string, unknown>;
  }) {
    // Gracefully resolve configs from direct params or gatewayConfig JSON block
    const gatewayConfig = (config.gatewayConfig || {}) as Record<string, string | boolean | undefined>;
    this.merchantId = config.merchantId || (gatewayConfig.merchantId as string | undefined) || "MID_PHONEPE_MOCK";
    this.saltKey = config.saltKey || (gatewayConfig.saltKey as string | undefined) || "mock-salt-key-phonepe-1234567890";
    this.saltIndex = config.saltIndex || (gatewayConfig.saltIndex as string | undefined) || "1";
    this.callbackUrl = config.callbackUrl || (gatewayConfig.callbackUrl as string | undefined) || "http://localhost:3000/api/payments/webhooks/phonepe";
    this.redirectUrl = config.redirectUrl || (gatewayConfig.redirectUrl as string | undefined) || "http://localhost:3000/payments/checkout/phonepe";
    this.isSandbox = config.isSandbox !== undefined ? config.isSandbox : ((gatewayConfig.isSandbox as boolean | undefined) ?? true);
  }

  /**
   * Generates the SHA256 base64 header signature (X-VERIFY) matching PhonePe documentation format
   */
  public generateChecksum(payloadBase64: string, apiEndpoint: string): string {
    const dataToSign = payloadBase64 + apiEndpoint + this.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(dataToSign).digest("hex");
    return `${sha256Hash}###${this.saltIndex}`;
  }

  /**
   * Simulates the creation of a Payment Request with PhonePe
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const merchantTransactionId = `TXN_PP_${request.transactionId}`;
    
    // Amount in paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(request.amount * 100);

    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId,
      merchantUserId: request.metadata?.ownerId || "owner_user_mock",
      amount: amountInPaise,
      redirectUrl: `${this.redirectUrl}?transactionId=${request.transactionId}&amount=${request.amount}`,
      redirectMode: "REDIRECT",
      callbackUrl: this.callbackUrl,
      mobileNumber: request.customerPhone || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = this.generateChecksum(payloadBase64, "/pg/v1/pay");

    // Simulated payload for verification checkouts
    const mockPaymentUrl = `${this.redirectUrl}?transactionId=${request.transactionId}&amount=${request.amount}&merchantTransactionId=${merchantTransactionId}`;

    return {
      success: true,
      gatewayOrderId: merchantTransactionId,
      gatewayTransactionId: `pp_tx_${Date.now()}`,
      paymentUrl: mockPaymentUrl,
      rawResponse: {
        success: true,
        code: "PAYMENT_INITIATED",
        message: "Payment successfully initiated with PhonePe (preparedness mode)",
        data: {
          merchantId: this.merchantId,
          merchantTransactionId,
          instrumentResponse: {
            type: "PAY_PAGE",
            redirectInfo: {
              url: mockPaymentUrl,
              method: "GET"
            }
          }
        },
        _security: {
          payloadBase64,
          xVerifyHeader: checksum
        }
      }
    };
  }

  /**
   * Verifies the actual real-time status of a transaction with PhonePe
   */
  async verifyPayment(gatewayTransactionId: string, gatewayOrderId?: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: Record<string, unknown> }> {
    const txnId = gatewayOrderId || gatewayTransactionId;
    
    // Support test override simulation via query param markers inside simulated gatewayOrderId or custom metadata
    let mockCode = "PAYMENT_SUCCESS";
    let status: PaymentStatus = PaymentStatus.SUCCESS;

    if (txnId.includes("fail") || txnId.includes("FAIL")) {
      mockCode = "PAYMENT_ERROR";
      status = PaymentStatus.FAILED;
    } else if (txnId.includes("pending") || txnId.includes("PENDING")) {
      mockCode = "PAYMENT_PENDING";
      status = PaymentStatus.PENDING;
    }

    return {
      success: status === PaymentStatus.SUCCESS,
      status,
      rawResponse: {
        success: status === PaymentStatus.SUCCESS,
        code: mockCode,
        message: `PhonePe verification response resolved with: ${mockCode}`,
        data: {
          merchantId: this.merchantId,
          merchantTransactionId: txnId,
          transactionId: gatewayTransactionId,
          amount: 99900,
          state: status === PaymentStatus.SUCCESS ? "COMPLETED" : status === PaymentStatus.PENDING ? "PENDING" : "FAILED",
          responseCode: status === PaymentStatus.SUCCESS ? "SUCCESS" : "ERROR"
        }
      }
    };
  }

  /**
   * Simulates PhonePe refund protocol
   */
  async refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: Record<string, unknown> }> {
    const mockRefundId = `pp_ref_${Date.now()}`;
    return {
      success: true,
      refundId: mockRefundId,
      rawResponse: {
        success: true,
        code: "PAYMENT_SUCCESS",
        message: "PhonePe mock refund successfully settled",
        data: {
          merchantId: this.merchantId,
          transactionId: gatewayTransactionId,
          refundId: mockRefundId,
          amount: Math.round(amount * 100),
          state: "COMPLETED"
        }
      }
    };
  }

  /**
   * Handles webhook callback events from PhonePe
   */
  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }> {
    // Expect PhonePe payload format:
    // { response: "Base64JSONString" }
    // Signature header check
    if (!payload || !payload.response) {
      return { processed: false, status: PaymentStatus.FAILED };
    }

    const payloadResponse = payload.response as string;

    // Checksum verification
    if (signature) {
      const computed = this.generateChecksum(payloadResponse, "/api/payments/webhooks/phonepe");
      if (computed !== signature) {
        throw new Error("PhonePe Webhook validation failed: corrupt signature checksum mismatch");
      }
    }

    // Decode response body
    const decodedText = Buffer.from(payloadResponse, "base64").toString("utf-8");
    const body = JSON.parse(decodedText) as {
      success?: boolean;
      code?: string;
      data?: {
        merchantTransactionId?: string;
      };
    };

    const isSuccess = body.success === true && body.code === "PAYMENT_SUCCESS";
    const isFailed = body.code === "PAYMENT_ERROR";
    const isCancelled = body.code === "PAYMENT_CANCELLED";

    let targetStatus: PaymentStatus = PaymentStatus.PENDING;
    if (isSuccess) {
      targetStatus = PaymentStatus.SUCCESS;
    } else if (isFailed) {
      targetStatus = PaymentStatus.FAILED;
    } else if (isCancelled) {
      targetStatus = PaymentStatus.CANCELLED;
    }

    // Extract transactionId from merchantTransactionId (e.g. TXN_PP_<id>)
    const mtxnId = body.data?.merchantTransactionId || "";
    const originalTransactionId = mtxnId.startsWith("TXN_PP_") ? mtxnId.replace("TXN_PP_", "") : mtxnId;

    return {
      processed: true,
      status: targetStatus,
      transactionId: originalTransactionId || undefined
    };
  }
}
