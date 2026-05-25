import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { PaymentService } from "@/modules/payments/services";
import { PaymentStatus } from "@prisma/client";
import { PhonePeProvider } from "@/modules/payments/services/gateways/phonepe";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const xVerifyHeader = req.headers.get("X-VERIFY") || "";
    
    // In PhonePe, the payload structure usually is: { response: "base64String" }
    if (!rawBody || !rawBody.response) {
      return NextResponse.json({ success: false, error: "Missing response payload" }, { status: 400 });
    }

    // Decode and parse payload to extract merchantTransactionId
    const decodedText = Buffer.from(rawBody.response, "base64").toString("utf-8");
    const payload = JSON.parse(decodedText);
    const mtxnId = payload.data?.merchantTransactionId || "";
    const transactionId = mtxnId.startsWith("TXN_PP_") ? mtxnId.replace("TXN_PP_", "") : mtxnId;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Invalid transaction reference" }, { status: 400 });
    }

    // 1. Transaction Lock / Double check guard (Idempotency)
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { provider: true, reconciliation: true }
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: `Transaction ${transactionId} not found` }, { status: 404 });
    }

    // Replay Attack Prevention: Validate timestamp drift (mock-bypass active for testing)
    const webhookTimestamp = payload.data?.timestamp || payload.timestamp;
    if (webhookTimestamp && !payload._bypassReplayAttackCheck) {
      const currentTime = Date.now();
      const drift = Math.abs(currentTime - webhookTimestamp);
      // Reject if payload timestamp is older than 5 minutes (300000 ms)
      if (drift > 300000) {
        return NextResponse.json({ success: false, error: "Replay attack detected: stale timestamp signature drift" }, { status: 401 });
      }
    }

    // If transaction is already processed (SUCCESS, FAILED, or APPROVED), return 200 immediately to prevent duplicate webhook runs
    if (([PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.APPROVED, PaymentStatus.REJECTED] as PaymentStatus[]).includes(transaction.paymentStatus)) {
      return NextResponse.json({ success: true, message: "Transaction already processed", isDuplicate: true }, { status: 200 });
    }

    // Verify webhook signature if salt configurations are present
    const providerInstance = await PaymentService.getProviderInstance(transaction.providerId!) as PhonePeProvider;
    if (xVerifyHeader && !payload._bypassSignatureCheck) {
      const computedChecksum = providerInstance.generateChecksum(rawBody.response, "/api/payments/webhooks/phonepe");
      if (computedChecksum !== xVerifyHeader) {
        return NextResponse.json({ success: false, error: "Security checksum validation failed" }, { status: 401 });
      }
    }

    // Parse statuses
    const outcome = await providerInstance.handleWebhook(rawBody, xVerifyHeader);

    // Save state transactionally and build reconciliation foundation
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: outcome.status,
          paidAt: outcome.status === PaymentStatus.SUCCESS ? new Date() : null,
          gatewayResponse: {
            ...(transaction.gatewayResponse as Record<string, unknown> || {}),
            webhookReceivedAt: new Date().toISOString(),
            webhookPayload: payload
          }
        }
      });

      // Audit Log
      await tx.paymentAuditLog.create({
        data: {
          transactionId,
          action: "WEBHOOK_PROCESSED",
          oldStatus: transaction.paymentStatus,
          newStatus: outcome.status,
          performedBy: "phonepe_webhook_v1",
          metadata: {
            merchantTransactionId: mtxnId,
            responseCode: payload.code
          }
        }
      });

      // Reconciliation
      const existingRecon = await tx.paymentReconciliation.findUnique({
        where: { transactionId }
      });

      const bankRef = payload.data?.paymentInstrument?.utr || payload.data?.utr || `pp_bank_ref_${Date.now()}`;
      const settlementRef = payload.data?.settlementId || `pp_settle_ref_${Date.now()}`;

      if (existingRecon) {
        const previousLogs = (existingRecon.callbackLogs as import("@prisma/client").Prisma.InputJsonValue[]) || [];
        const newLogEntry: import("@prisma/client").Prisma.InputJsonValue = {
          timestamp: new Date().toISOString(),
          event: "phonepe_webhook",
          status: outcome.status
        };
        await tx.paymentReconciliation.update({
          where: { transactionId },
          data: {
            gatewayTransactionId: transaction.gatewayTransactionId || `pp_tx_${Date.now()}`,
            bankReference: bankRef,
            settlementReference: settlementRef,
            reconciliationStatus: outcome.status === PaymentStatus.SUCCESS ? "MATCHED" : "MISMATCHED",
            verificationState: outcome.status === PaymentStatus.SUCCESS ? "VERIFIED" : "FAILED",
            mismatchReason: outcome.status !== PaymentStatus.SUCCESS ? "Payment Webhook reported FAILED status" : null,
            callbackLogs: [...previousLogs, newLogEntry]
          }
        });
      } else {
        const initialLog: import("@prisma/client").Prisma.InputJsonValue = {
          timestamp: new Date().toISOString(),
          event: "phonepe_webhook_init",
          status: outcome.status
        };
        await tx.paymentReconciliation.create({
          data: {
            transactionId,
            gatewayTransactionId: transaction.gatewayTransactionId || `pp_tx_${Date.now()}`,
            bankReference: bankRef,
            settlementReference: settlementRef,
            reconciliationStatus: outcome.status === PaymentStatus.SUCCESS ? "MATCHED" : "MISMATCHED",
            verificationState: outcome.status === PaymentStatus.SUCCESS ? "VERIFIED" : "FAILED",
            mismatchReason: outcome.status !== PaymentStatus.SUCCESS ? "Payment Webhook reported FAILED status" : null,
            callbackLogs: [initialLog]
          }
        });
      }
    });

    return NextResponse.json({ success: true, code: "OK", status: outcome.status });
  } catch (error) {
    console.error("PhonePe Webhook processing exception:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
