import { z } from "zod";
import { yesBankWebhookSchema, phonePeWebhookSchema, manualUpiSubmitSchema, reviewPaymentSchema } from "../validators/payment.validators";

export type YesBankWebhookDto = z.infer<typeof yesBankWebhookSchema>;
export type PhonePeWebhookDto = z.infer<typeof phonePeWebhookSchema>;
export type ManualUpiSubmitDto = z.infer<typeof manualUpiSubmitSchema> & { screenshot: File };
export type ReviewPaymentDto = z.infer<typeof reviewPaymentSchema>;
