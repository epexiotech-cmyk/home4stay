import { z } from "zod";
import { BillingCycle } from "@prisma/client";

// Webhooks
export const yesBankWebhookSchema = z.object({
  transactionId: z.string().min(1, "transactionId is required"),
  bankReference: z.string().optional(),
  amount: z.number().optional(),
  status: z.any().optional(), // Depending on how it's handled downstream
  statusCode: z.string().optional(),
  settlementReference: z.string().optional(),
  timestamp: z.number().optional(),
  _bypassReplayAttackCheck: z.boolean().optional(),
  _bypassSignatureCheck: z.boolean().optional(),
});

export const phonePeWebhookSchema = z.object({
  response: z.string().min(1, "Missing response payload"),
});

// Manual UPI
export const manualUpiSubmitSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  selectedPlanId: z.string().min(1, "selectedPlanId is required"),
  billingCycle: z.nativeEnum(BillingCycle, { error: "Invalid billing cycle" }),
  utrNumber: z.string().min(1, "utrNumber is required"),
  acceptedSubscriptionAgreementVersion: z.string().min(1, "acceptedSubscriptionAgreementVersion is required"),
});

// Admin Reviews
export const reviewPaymentSchema = z.object({
  reviewNote: z.string().optional(),
});
