import { NextRequest } from "next/server";
import { PaymentService } from "@/modules/payments/services";
import { PaymentStatus } from "@prisma/client";
import { PhonePeProvider } from "@/modules/payments/services/gateways/phonepe";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";
import { PaymentRepository } from "@/lib/repositories/paymentRepository";

import { phonePeWebhookSchema } from "@/modules/payments/validators/payment.validators";

async function handlePhonepeWebhook(req: NextRequest) {
  const rawBody = await req.json();
  const xVerifyHeader = req.headers.get("X-VERIFY") || "";
  
  const dto = phonePeWebhookSchema.parse(rawBody);

  // Decode and parse payload to extract merchantTransactionId
  const decodedText = Buffer.from(dto.response, "base64").toString("utf-8");
  const payload = JSON.parse(decodedText);
  const mtxnId = payload.data?.merchantTransactionId || "";
  const transactionId = mtxnId.startsWith("TXN_PP_") ? mtxnId.replace("TXN_PP_", "") : mtxnId;

  if (!transactionId) {
    throw new Error("Invalid transaction reference");
  }

  // 1. Transaction Lock / Double check guard (Idempotency) using Repository
  const transaction = await PaymentRepository.findTransactionById(transactionId);
  if (!transaction) throw new Error(`Transaction ${transactionId} not found`);

  // Replay Attack Prevention
  const webhookTimestamp = payload.data?.timestamp || payload.timestamp;
  if (webhookTimestamp && !payload._bypassReplayAttackCheck) {
    const currentTime = Date.now();
    const drift = Math.abs(currentTime - webhookTimestamp);
    if (drift > 300000) {
      throw new Error("Replay attack detected: stale timestamp signature drift");
    }
  }

  // Idempotency: If already processed, return OK
  if (([PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.APPROVED, PaymentStatus.REJECTED] as PaymentStatus[]).includes(transaction.paymentStatus)) {
    return successResponse({ success: true, message: "Transaction already processed", isDuplicate: true }, { status: 200 });
  }

  const providerInstance = await PaymentService.getProviderInstance(transaction.providerId!) as PhonePeProvider;

  // Verify webhook signature
  if (xVerifyHeader && !payload._bypassSignatureCheck) {
    const computedChecksum = providerInstance.generateChecksum(rawBody.response, "/api/payments/webhooks/phonepe");
    if (computedChecksum !== xVerifyHeader) {
      throw new Error("Security checksum validation failed");
    }
  }

  // Parse statuses
  const outcome = await providerInstance.handleWebhook(rawBody, xVerifyHeader);

  // Call Service Orchestrator
  await PaymentService.processWebhook({
    transactionId,
    status: outcome.status,
    rawBody: payload,
    bankReference: payload.data?.paymentInstrument?.utr || payload.data?.utr || null,
    statusCode: payload.code,
    gatewayTransactionId: transaction.gatewayTransactionId || `pp_tx_${Date.now()}`,
    settlementReference: payload.data?.settlementId || `pp_settle_ref_${Date.now()}`
  });

  return successResponse({ success: true, code: "OK", status: outcome.status });
}

export const POST = withErrorHandler(handlePhonepeWebhook);
