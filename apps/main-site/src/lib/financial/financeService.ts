import 'server-only';
import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";
import { ReconciliationStatus } from "@prisma/client";

export interface ReconciliationResult {
  log: any;
  status: ReconciliationStatus;
  mismatchAmount: number;
}

export class SettlementTracker {
  /**
   * Idempotently logs a gateway settlement payout record.
   * Prevents duplicate reference writes, updating the entry if it already exists.
   */
  static async recordSettlement(params: {
    providerType: string;
    settlementReference: string;
    settlementDate: Date | string;
    settlementAmount: number;
    currency?: string;
    metadata?: any;
  }): Promise<any> {
    const { providerType, settlementReference, settlementDate, settlementAmount, currency = "INR", metadata = {} } = params;

    // Use transaction-safe upsert or write
    return await prisma.$transaction(async (tx) => {
      const parsedDate = new Date(settlementDate);

      // Check if reference exists
      const existing = await tx.settlementRecord.findUnique({
        where: { settlementReference }
      });

      if (existing) {
        logger({
          level: "info",
          event: "SETTLEMENT_RECORD_UPDATED",
          message: `Settlement record reference ${settlementReference} already exists. Updating details.`,
          requestId: "settlement-tracker"
        });

        return await tx.settlementRecord.update({
          where: { settlementReference },
          data: {
            providerType,
            settlementDate: parsedDate,
            settlementAmount,
            currency,
            metadata: {
              ...((existing.metadata as any) || {}),
              ...metadata
            }
          }
        });
      }

      logger({
        level: "info",
        event: "SETTLEMENT_RECORD_CREATED",
        message: `Logging new settlement record ${settlementReference} for ₹${settlementAmount}`,
        requestId: "settlement-tracker"
      });

      return await tx.settlementRecord.create({
        data: {
          providerType,
          settlementReference,
          settlementDate: parsedDate,
          settlementAmount,
          currency,
          status: "PENDING",
          metadata
        }
      });
    });
  }
}

export class ReconciliationEngine {
  /**
   * Reconciles a verified payment transaction against actual gateway settlement figures.
   * Calculates discrepancies, queries duplicate transaction alerts, and logs a permanent audit-safe report.
   */
  static async reconcilePaymentWithSettlement(
    transactionId: string,
    receivedAmount: number,
    settlementRecordId?: string
  ): Promise<ReconciliationResult> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch transaction with linked invoices and audit trace
      const transaction = await tx.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: {
          invoices: true
        }
      });

      if (!transaction) {
        throw new Error(`Reconciliation Error: Transaction ${transactionId} not found in PostgreSQL.`);
      }

      // Check if already MATCHED to prevent duplicate updates
      const priorLog = await tx.reconciliationLog.findFirst({
        where: {
          transactionId: transaction.id,
          reconciliationStatus: "MATCHED"
        }
      });

      if (priorLog) {
        logger({
          level: "info",
          event: "RECONCILIATION_SKIPPED",
          message: `Transaction ${transactionId} already successfully reconciled as MATCHED in logs. Skipping retry runs.`,
          requestId: "recon-engine"
        });
        return {
          log: priorLog,
          status: "MATCHED",
          mismatchAmount: 0.00
        };
      }

      // 2. Perform duplicate transaction risk check
      let duplicateAlertNotes = "";
      let hasDuplicateRisk = false;

      if (transaction.utrNumber) {
        const potentialDuplicate = await tx.paymentTransaction.findFirst({
          where: {
            utrNumber: transaction.utrNumber,
            id: { not: transaction.id },
            paymentStatus: "APPROVED"
          }
        });

        if (potentialDuplicate) {
          hasDuplicateRisk = true;
          duplicateAlertNotes = `[CRITICAL WARNING]: Duplicate UTR detected in payment transactions. UTR ${transaction.utrNumber} is already logged on transaction ID ${potentialDuplicate.id}. Possible collision/replay risk.`;
          
          logger({
            level: "warn",
            event: "RECONCILIATION_DUPLICATE_UTR_DETECTED",
            message: `Possible replay risk: UTR ${transaction.utrNumber} detected multiple times.`,
            requestId: "recon-engine"
          });
        }
      }

      // 3. Compute expected value and mismatch difference
      const expectedAmount = transaction.amount;
      const mismatch = Number((expectedAmount - receivedAmount).toFixed(2));
      const mismatchAmount = Math.abs(mismatch);

      // Determine compliance status states
      let status: ReconciliationStatus = "MATCHED";
      let statusNotes = `Reconciliation completed successfully. Expected ₹${expectedAmount.toFixed(2)} matches received ₹${receivedAmount.toFixed(2)}.`;

      if (mismatchAmount > 0.01) {
        status = "MISMATCH";
        statusNotes = `Discrepancy resolved: Expected ₹${expectedAmount.toFixed(2)}, but actually settled ₹${receivedAmount.toFixed(2)}. Mismatch is ₹${mismatchAmount.toFixed(2)}.`;
        
        logger({
          level: "error",
          event: "RECONCILIATION_MISMATCH_DETECTED",
          message: `Discrepancy flagged for transaction ${transactionId}. Expected ₹${expectedAmount}, got ₹${receivedAmount}.`,
          requestId: "recon-engine"
        });
      }

      if (hasDuplicateRisk) {
        status = "MISMATCH";
        statusNotes = duplicateAlertNotes + " " + statusNotes;
      }

      const linkedInvoiceId = transaction.invoices[0]?.id || null;

      // 4. Create immutable ReconciliationLog entry
      const log = await tx.reconciliationLog.create({
        data: {
          transactionId: transaction.id,
          invoiceId: linkedInvoiceId,
          settlementRecordId: settlementRecordId || null,
          reconciliationStatus: status,
          expectedAmount,
          receivedAmount,
          mismatchAmount,
          notes: statusNotes,
          reconciledAt: new Date(),
          metadata: {
            hasDuplicateRisk,
            mismatchDirection: mismatch > 0 ? "UNDERPAID" : mismatch < 0 ? "OVERPAID" : "EXACT",
            originalUtr: transaction.utrNumber
          }
        }
      });

      // 5. Update settlement record status if provided
      if (settlementRecordId) {
        await tx.settlementRecord.update({
          where: { id: settlementRecordId },
          data: {
            status: status
          }
        });
      }

      logger({
        level: "info",
        event: "RECONCILIATION_LOGGED",
        message: `Immutable reconciliation log ${log.id} successfully saved as ${status} for transaction ${transactionId}`,
        requestId: "recon-engine"
      });

      return {
        log,
        status,
        mismatchAmount
      };
    });
  }
}
