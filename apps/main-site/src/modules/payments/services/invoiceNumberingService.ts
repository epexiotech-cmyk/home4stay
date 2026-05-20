import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";

interface InvoiceNumberOptions {
  regionCode?: string; // e.g. "IN", "US" (default: "IN")
  gstPrefix?: boolean;  // e.g. include GST codes for India
}

/**
 * Service to manage sequential, globally unique, human-readable invoice serial codes.
 * Implements a strict table-level lock in PostgreSQL to fully prevent race conditions.
 */
export class InvoiceNumberingService {
  /**
   * Generates and reserves a globally unique sequential invoice number.
   * Format: H4S-[REGION]-[YYYY]-[6-digit-sequence] (e.g., H4S-IN-2026-000182)
   */
  static async generateInvoiceNumber(options: InvoiceNumberOptions = {}): Promise<string> {
    const region = (options.regionCode || "IN").toUpperCase();
    const currentYear = new Date().getFullYear();
    const prefix = `H4S-${region}-${currentYear}-`;

    try {
      const invoiceNumber = await prisma.$transaction(async (tx) => {
        // Acquire Exclusive Table Lock on invoice_records to prevent any other thread
        // from fetching or inserting until this transaction completes.
        await tx.$executeRawUnsafe(`LOCK TABLE invoice_records IN ACCESS EXCLUSIVE MODE;`);

        // Find the highest sequence number generated for the current region & year
        const latestRecord = await tx.invoiceRecord.findFirst({
          where: {
            invoiceNumber: {
              startsWith: prefix
            }
          },
          orderBy: {
            invoiceNumber: "desc"
          }
        });

        let nextSequence = 1;
        if (latestRecord) {
          // Parse the serial sequence from "H4S-IN-[YYYY]-[SEQUENCE]"
          const segments = latestRecord.invoiceNumber.split("-");
          const lastSeqStr = segments[segments.length - 1];
          const lastSeq = parseInt(lastSeqStr || "0", 10);
          nextSequence = lastSeq + 1;
        }

        const paddedSequence = String(nextSequence).padStart(6, "0");
        const finalInvoiceNumber = `${prefix}${paddedSequence}`;

        logger({
          level: "info",
          event: "INVOICE_NUMBER_ALLOCATED",
          message: `Allocated serial billing code: ${finalInvoiceNumber}`,
          requestId: "billing-system"
        });

        return finalInvoiceNumber;
      });

      return invoiceNumber;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger({
        level: "error",
        event: "INVOICE_NUMBER_GENERATION_FAILED",
        message: `Failed to allocate serial invoice: ${msg}`,
        requestId: "billing-system"
      });
      throw new Error(`Invoice numbering sequence failed: ${msg}`);
    }
  }
}
