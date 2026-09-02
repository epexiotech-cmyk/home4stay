import { z } from "zod";
import { PaymentMode } from "../types";

// Standard UPI ID (VPA) Regex: e.g. user@bank, user@oksbi, etc.
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const PropertyPaymentConfigSchema = z.object({
  provider: z.nativeEnum(PaymentMode, {
    message: "Invalid payment provider mode",
  }),
  upiId: z.string().nullable().optional(),
  merchantName: z.string().min(2, "Merchant name must be at least 2 characters").nullable().optional(),
  bankName: z.string().nullable().optional(),
  gatewayKey: z.string().nullable().optional(),
  gatewaySecret: z.string().nullable().optional(),
  webhookSecret: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.provider === PaymentMode.SMART_UPI) {
    if (!data.upiId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["upiId"],
        message: "UPI ID is required for SMART_UPI provider",
      });
    } else if (!UPI_ID_REGEX.test(data.upiId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["upiId"],
        message: "Invalid UPI ID format (e.g. name@bank)",
      });
    }

    if (!data.merchantName || data.merchantName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["merchantName"],
        message: "Merchant name is required for SMART_UPI provider",
      });
    }
  }

  // Future check: gateway validations for Stripe/Razorpay
  if ([PaymentMode.RAZORPAY, PaymentMode.STRIPE].includes(data.provider)) {
    if (!data.gatewayKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gatewayKey"],
        message: `Gateway API Key is required for ${data.provider}`,
      });
    }
  }
});

export const PaymentSubmitSchema = z.object({
  utrNumber: z.string()
    .min(12, "UPI UTR / Transaction number must be exactly 12 numeric digits")
    .max(12, "UPI UTR / Transaction number must be exactly 12 numeric digits")
    .regex(/^\d+$/, "UPI UTR / Transaction number must be strictly numeric digits"),
});
