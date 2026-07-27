import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PaymentService } from "@/modules/payments/services";
import { BillingCycle } from "@prisma/client";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";

import { manualUpiSubmitSchema } from "@/modules/payments/validators/payment.validators";

async function handleManualUpiSubmit(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // 1. Authenticate caller
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    throw new Error("Unauthorized: Missing active session");
  }

  // 2. Parse Multipart form payload
  const formData = await request.formData();
  const screenshot = formData.get("screenshot") as File | null;
  if (!screenshot) {
    throw new Error("Missing screenshot");
  }

  const dto = manualUpiSubmitSchema.parse({
    propertyId: formData.get("propertyId"),
    selectedPlanId: formData.get("selectedPlanId"),
    billingCycle: formData.get("billingCycle")?.toString().toUpperCase(),
    utrNumber: formData.get("utrNumber"),
    acceptedSubscriptionAgreementVersion: formData.get("acceptedSubscriptionAgreementVersion"),
  });

  // 5. Call Service Orchestrator
  const transaction = await PaymentService.processManualUpiSubmission({
    userId: auth.userId,
    ...dto,
    screenshot,
    ip,
    userAgent
  });

  return successResponse({
    success: true,
    message: "Manual UPI payment proof submitted successfully for verification",
    transactionId: transaction.id
  });
}

export const POST = withErrorHandler(handleManualUpiSubmit);
