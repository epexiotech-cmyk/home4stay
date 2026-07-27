import { NextRequest } from "next/server";
import { PaymentService } from "@/modules/payments/services";
import { PaymentStatus } from "@prisma/client";
import { YesBankProvider } from "@/modules/payments/services/gateways/yesbank";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";
import { PaymentRepository } from "@/lib/repositories/paymentRepository";

import { yesBankWebhookSchema } from "@/modules/payments/validators/payment.validators";

async function handleYesbankWebhook(req: NextRequest) {
  const rawBody = await req.json();
  const xSignatureHeader = req.headers.get("X-BANK-SIGNATURE") || "";

  const dto = yesBankWebhookSchema.parse(rawBody);
  const { transactionId, bankReference, amount, status } = dto;

  // 1. Double check guard (Idempotency) using Repository
  const transaction = await PaymentRepository.findTransactionById(transactionId);
  if (!transaction) throw new Error(`Transaction ${transactionId} not found`);

  // Replay Attack Prevention
  const webhookTimestamp = rawBody.timestamp;
  if (webhookTimestamp && !rawBody._bypassReplayAttackCheck) {
    const currentTime = Date.now();
    const drift = Math.abs(currentTime - webhookTimestamp);
    if (drift > 300000) {
      throw new Error("Replay attack detected: stale timestamp drift");
    }
  }

  // Idempotency: If already processed, return OK
  if (([PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.APPROVED, PaymentStatus.REJECTED] as PaymentStatus[]).includes(transaction.paymentStatus)) {
    return successResponse({ success: true, message: "Transaction already processed", isDuplicate: true }, { status: 200 });
  }

  const providerInstance = await PaymentService.getProviderInstance(transaction.providerId!) as YesBankProvider;

  // Verify digital signature
  if (xSignatureHeader && !rawBody._bypassSignatureCheck) {
    const dataToVerify = JSON.stringify({ transactionId, bankReference, amount, status });
    const computed = providerInstance.generateSignature(dataToVerify);
    if (computed !== xSignatureHeader) {
      throw new Error("Security checksum validation failed");
    }
  }

  // Parse status
  const outcome = await providerInstance.handleWebhook(rawBody, xSignatureHeader);

  // Call Service Orchestrator
  await PaymentService.processWebhook({
    transactionId,
    status: outcome.status,
    rawBody,
    bankReference: bankReference || null,
    statusCode: rawBody.statusCode,
    gatewayTransactionId: transaction.gatewayTransactionId || `yb_tx_${Date.now()}`,
    settlementReference: rawBody.settlementReference || `yb_settle_ref_${Date.now()}`
  });

  return successResponse({ success: true, code: "OK", status: outcome.status });
}

export const POST = withErrorHandler(handleYesbankWebhook);
