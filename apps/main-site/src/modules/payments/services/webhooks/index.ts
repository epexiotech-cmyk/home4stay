import { prisma } from "../../../../lib/database/prisma";
import { PaymentService } from "../index";
import { PaymentStatus } from "@prisma/client";

export class PaymentWebhookDelegator {
  /**
   * Dispatches and processes webhook events dynamically matching providers
   */
  static async handleWebhook(providerId: string, payload: any, signature?: string): Promise<{ processed: boolean; status: string }> {
    const provider = await PaymentService.getProviderInstance(providerId);
    
    // Call gateway webhook parser
    const outcome = await provider.handleWebhook(payload, signature);

    if (!outcome.processed || !outcome.transactionId) {
      return { processed: false, status: "SKIPPED" };
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: outcome.transactionId }
    });

    if (!transaction) {
      throw new Error(`Webhook transaction mapping failure: Transaction ${outcome.transactionId} not found`);
    }

    // Process status updates transactionally
    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          paymentStatus: outcome.status,
          paidAt: outcome.status === PaymentStatus.SUCCESS ? new Date() : null,
          gatewayResponse: {
            ...(transaction.gatewayResponse as any || {}),
            webhookPayload: payload
          }
        }
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId: transaction.id,
          action: "WEBHOOK_RECEIVED",
          oldStatus: transaction.paymentStatus,
          newStatus: outcome.status,
          performedBy: `webhook_delegator_${providerId}`,
          metadata: {
            signature: signature || null,
            eventPayload: payload
          }
        }
      });
    });

    return { processed: true, status: outcome.status };
  }
}
