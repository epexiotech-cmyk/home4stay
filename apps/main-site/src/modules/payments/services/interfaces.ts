import { PaymentProviderType, PaymentStatus } from "@prisma/client";

export interface PaymentRequest {
  transactionId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  paymentUrl?: string; // Checkout redirect URL for Stripe/Razorpay
  qrCodeUrl?: string;  // QR payload or deep link for manual/auto UPI systems
  rawResponse: any;
}

export interface IPaymentProvider {
  /**
   * Initializes a payment intent/charge with the gateway or manual provider
   */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Verifies the actual real-time status of a transaction
   */
  verifyPayment(gatewayTransactionId: string, gatewayOrderId?: string): Promise<{ success: boolean; status: PaymentStatus; rawResponse: any }>;

  /**
   * Refunds a captured payment transaction
   */
  refundPayment(gatewayTransactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; rawResponse: any }>;

  /**
   * Handles webhook callback events from the provider
   */
  handleWebhook(payload: any, signature?: string): Promise<{ processed: boolean; status: PaymentStatus; transactionId?: string }>;
}
