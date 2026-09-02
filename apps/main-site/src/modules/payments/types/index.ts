export enum PaymentMode {
  SMART_UPI = "SMART_UPI",
  RAZORPAY = "RAZORPAY",
  CASHFREE = "CASHFREE",
  PHONEPE = "PHONEPE",
  STRIPE = "STRIPE",
  OFFLINE = "OFFLINE"
}

export enum BookingPaymentState {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED",
  UNDER_OWNER_VERIFICATION = "UNDER_OWNER_VERIFICATION",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}

export interface PaymentIntentResult {
  success: boolean;
  paymentReference: string;
  reconciliationAmount: number;
  qrPayload?: string;
  deepLink?: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: BookingPaymentState;
  utrNumber?: string;
  verifiedAt?: Date;
  error?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  refundedAt?: Date;
  error?: string;
}

export interface WebhookResult {
  processed: boolean;
  bookingId?: string;
  status?: BookingPaymentState;
  error?: string;
}

export interface PaymentProvider {
  createPaymentIntent(
    bookingId: string,
    amount: number,
    config: {
      upiId?: string | null;
      merchantName?: string | null;
      gatewayKey?: string | null;
      gatewaySecret?: string | null;
    }
  ): Promise<PaymentIntentResult>;

  verifyPayment(
    bookingId: string,
    params: { utrNumber?: string; [key: string]: unknown }
  ): Promise<PaymentVerificationResult>;

  expirePayment(bookingId: string): Promise<boolean>;

  refundPayment(bookingId: string, amount: number): Promise<PaymentRefundResult>;

  handleWebhook(payload: Record<string, unknown>, headers: Record<string, unknown>): Promise<WebhookResult>;

  getPaymentStatus(bookingId: string): Promise<BookingPaymentState>;
}
