import { PrismaClient } from '@prisma/client';

export class FinancialNumberingService {
  /**
   * Generates the next sequential, collision-safe invoice number.
   * Acquires an ACCESS EXCLUSIVE lock on the invoices table to block parallel race conditions.
   * Must be called inside a Prisma transaction ($transaction).
   */
  static async generateNextInvoiceNumber(tx: any): Promise<string> {
    // 1. Lock the invoices table for access-exclusive execution isolation to prevent race conditions
    await tx.$executeRawUnsafe('LOCK TABLE "invoices" IN ACCESS EXCLUSIVE MODE');

    // 2. Resolve Financial Settings
    let settings = await tx.financialSettings.findFirst();
    if (!settings) {
      // Bootstrapping default settings if none exist to avoid system blocks
      settings = await tx.financialSettings.create({
        data: {
          companyName: 'Home4Stay India',
          legalBusinessName: 'Home4Stay Technologies Private Limited',
          GSTIN: '29ABCDE1234F1Z5',
          PAN: 'ABCDE1234F',
          address: '123 Luxury Boulevard, Indiranagar, Bangalore, KA, 560038',
          supportEmail: 'finance@home4stay.com',
          supportPhone: '+91 80 4912 3456',
          invoicePrefix: 'H4S',
          invoiceStartingNumber: 1,
          defaultGSTPercent: 18.0,
          SACCode: '998311', // Lodging services
          bankDetails: {
            bankName: 'YES BANK',
            accountName: 'Home4Stay Technologies Pvt Ltd',
            accountNumber: '123456789012345',
            ifsc: 'YESB0000123',
            branch: 'Indiranagar'
          }
        }
      });
    }

    const currentYear = new Date().getFullYear();
    const prefix = settings.invoicePrefix;
    const startingNum = settings.invoiceStartingNumber;

    // 3. Find the highest invoice number for the current year with the matching prefix
    const lastInvoice = await tx.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `${prefix}-${currentYear}-`
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let nextSeq = startingNum;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeqStr = parts[parts.length - 1];
      const lastSeqVal = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeqVal)) {
        nextSeq = lastSeqVal + 1;
      }
    }

    const paddedSeq = String(nextSeq).padStart(6, '0');
    return `${prefix}-${currentYear}-${paddedSeq}`;
  }
}
