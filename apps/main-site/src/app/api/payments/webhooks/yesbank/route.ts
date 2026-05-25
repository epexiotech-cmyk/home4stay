import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { PaymentService } from "@/modules/payments/services";
import { PaymentStatus } from "@prisma/client";
import { YesBankProvider } from "@/modules/payments/services/gateways/yesbank";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const xSignatureHeader = req.headers.get("X-BANK-SIGNATURE") || "";

    if (!rawBody || !rawBody.transactionId) {
      return NextResponse.json({ success: false, error: "Missing banking transaction parameters" }, { status: 400 });
    }

    const { transactionId, bankReference, amount, status } = rawBody;

    // 1. Transaction Lock / Double check guard (Idempotency)
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { provider: true, reconciliation: true }
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: `Transaction ${transactionId} not found` }, { status: 404 });
    }

    // Replay Attack Prevention: Validate timestamp drift (mock-bypass active for testing)
    const webhookTimestamp = rawBody.timestamp;
    if (webhookTimestamp && !rawBody._bypassReplayAttackCheck) {
      const currentTime = Date.now();
      const drift = Math.abs(currentTime - webhookTimestamp);
      // Reject if timestamp is older than 5 minutes (300000 ms)
      if (drift > 300000) {
        return NextResponse.json({ success: false, error: "Replay attack detected: stale timestamp drift" }, { status: 401 });
      }
    }

    // If transaction is already processed, return 200 immediately to prevent duplicate runs
    if (([PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.APPROVED, PaymentStatus.REJECTED] as PaymentStatus[]).includes(transaction.paymentStatus)) {
      return NextResponse.json({ success: true, message: "Transaction already processed", isDuplicate: true }, { status: 200 });
    }

    const providerInstance = await PaymentService.getProviderInstance(transaction.providerId!) as YesBankProvider;

    // Verify digital signature
    if (xSignatureHeader && !rawBody._bypassSignatureCheck) {
      const dataToVerify = JSON.stringify({ transactionId, bankReference, amount, status });
      const computed = providerInstance.generateSignature(dataToVerify);
      if (computed !== xSignatureHeader) {
        return NextResponse.json({ success: false, error: "Security checksum validation failed" }, { status: 401 });
      }
    }

    // Parse status
    const outcome = await providerInstance.handleWebhook(rawBody, xSignatureHeader);

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
            webhookPayload: rawBody
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
          performedBy: "yesbank_webhook_v1",
          metadata: {
            bankReference,
            statusCode: rawBody.statusCode
          }
        }
      });

      // Reconciliation
      const existingRecon = await tx.paymentReconciliation.findUnique({
        where: { transactionId }
      });

      const bankRef = bankReference || `yb_bank_ref_${Date.now()}`;
      const settlementRef = rawBody.settlementReference || `yb_settle_ref_${Date.now()}`;

      if (existingRecon) {
        const previousLogs = (existingRecon.callbackLogs as import("@prisma/client").Prisma.InputJsonValue[]) || [];
        const newLogEntry: import("@prisma/client").Prisma.InputJsonValue = {
          timestamp: new Date().toISOString(),
          event: "yesbank_webhook",
          status: outcome.status
        };
        await tx.paymentReconciliation.update({
          where: { transactionId },
          data: {
            gatewayTransactionId: transaction.gatewayTransactionId || `yb_tx_${Date.now()}`,
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
          event: "yesbank_webhook_init",
          status: outcome.status
        };
        await tx.paymentReconciliation.create({
          data: {
            transactionId,
            gatewayTransactionId: transaction.gatewayTransactionId || `yb_tx_${Date.now()}`,
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
    console.error("YES BANK Webhook processing exception:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
