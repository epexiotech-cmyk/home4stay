import 'server-only';
import { prisma } from "@/lib/database/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface GstSummaryData {
  monthLabel: string;
  invoiceCount: number;
  totalSubtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGstAmount: number;
  totalGross: number;
}

export class AccountingExportEngine {
  /**
   * Helper to safely compile double-quoted CSV records, escaping internal quotes.
   */
  private static toCSVString(headers: string[], rows: any[][]): string {
    const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",");
    const bodyRows = rows.map(row =>
      row.map(cell => {
        if (cell === null || cell === undefined) return '""';
        if (typeof cell === "number") {
          return `"${cell.toFixed(2)}"`;
        }
        if (cell instanceof Date) {
          return `"${cell.toISOString().split("T")[0]}"`;
        }
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(",")
    );
    return [headerRow, ...bodyRows].join("\r\n");
  }

  /**
   * Aggregates GST metrics and total taxable collections for a selected year and month.
   */
  static async getMonthGstSummary(year: number, month: number): Promise<GstSummaryData> {
    const targetDate = new Date(year, month - 1, 1);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: {
          gte: start,
          lte: end
        },
        status: { in: ["ISSUED", "PAID"] }
      }
    });

    let invoiceCount = invoices.length;
    let totalSubtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGstAmount = 0;
    let totalGross = 0;

    for (const inv of invoices) {
      totalSubtotal += inv.subtotal;
      totalGstAmount += inv.gstAmount;
      totalGross += inv.totalAmount;

      const cgst = (inv.metadata as any)?.cgst || 0;
      const sgst = (inv.metadata as any)?.sgst || 0;
      const igst = (inv.metadata as any)?.igst || 0;

      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;
    }

    const monthName = targetDate.toLocaleString("default", { month: "long" });

    return {
      monthLabel: `${monthName} ${year}`,
      invoiceCount,
      totalSubtotal: Number(totalSubtotal.toFixed(2)),
      totalCGST: Number(totalCGST.toFixed(2)),
      totalSGST: Number(totalSGST.toFixed(2)),
      totalIGST: Number(totalIGST.toFixed(2)),
      totalGstAmount: Number(totalGstAmount.toFixed(2)),
      totalGross: Number(totalGross.toFixed(2))
    };
  }

  /**
   * Compiles general CSV of issued billing invoices.
   */
  static async exportInvoicesToCSV(startDate: Date, endDate: Date): Promise<string> {
    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { invoiceNumber: "asc" }
    });

    const headers = [
      "Invoice ID", "Invoice Number", "User ID", "Billing Name", "Billing Address",
      "GSTIN", "Type", "Status", "Subtotal", "GST %", "GST Amount", "CGST", "SGST",
      "IGST", "Total Amount", "Currency", "Issued At", "Paid At"
    ];

    const rows = invoices.map(inv => {
      const metadata = (inv.metadata as any) || {};
      return [
        inv.id,
        inv.invoiceNumber,
        inv.userId,
        inv.billingName,
        inv.billingAddress,
        inv.GSTIN || "",
        inv.invoiceType,
        inv.status,
        inv.subtotal,
        inv.gstPercent,
        inv.gstAmount,
        metadata.cgst || 0,
        metadata.sgst || 0,
        metadata.igst || 0,
        inv.totalAmount,
        inv.currency,
        inv.issuedAt || "",
        inv.paidAt || ""
      ];
    });

    return this.toCSVString(headers, rows);
  }

  /**
   * Zoho Books compliance format.
   */
  static async exportInvoicesToZoho(startDate: Date, endDate: Date): Promise<string> {
    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ["ISSUED", "PAID"] }
      },
      orderBy: { invoiceNumber: "asc" }
    });

    const headers = [
      "Invoice Number", "Customer Name", "Invoice Date", "Item Name", "SAC/HSN Code",
      "Taxable Rate (Subtotal)", "GST %", "CGST Amount", "SGST Amount", "IGST Amount",
      "Total Amount Paid", "Status"
    ];

    const rows = invoices.map(inv => {
      const metadata = (inv.metadata as any) || {};
      const planName = metadata.planName || `SaaS Entitlement Plan`;
      return [
        inv.invoiceNumber,
        inv.billingName,
        inv.issuedAt || "",
        planName,
        "998311", // Default lodging services SAC code
        inv.subtotal,
        inv.gstPercent,
        metadata.cgst || 0,
        metadata.sgst || 0,
        metadata.igst || 0,
        inv.totalAmount,
        inv.status
      ];
    });

    return this.toCSVString(headers, rows);
  }

  /**
   * Tally ERP compatible voucher layout mapping.
   */
  static async exportInvoicesToTally(startDate: Date, endDate: Date): Promise<string> {
    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ["ISSUED", "PAID"] }
      },
      orderBy: { invoiceNumber: "asc" }
    });

    const headers = [
      "Voucher No", "Voucher Date", "Party Ledger Name", "Sales Ledger Name",
      "Product Description", "HSN/SAC", "Assessable Value (Subtotal)",
      "CGST Ledger Value", "SGST Ledger Value", "IGST Ledger Value", "Invoice Value"
    ];

    const rows = invoices.map(inv => {
      const metadata = (inv.metadata as any) || {};
      const planName = metadata.planName || `SaaS Entitlement Plan`;
      return [
        inv.invoiceNumber,
        inv.billingName,
        inv.issuedAt || "",
        "SaaS Subscription Income",
        "998311",
        inv.subtotal,
        metadata.cgst || 0,
        metadata.sgst || 0,
        metadata.igst || 0,
        inv.totalAmount
      ];
    });

    return this.toCSVString(headers, rows);
  }

  /**
   * Payment transactions bookkeeping record.
   */
  static async exportPaymentsToCSV(startDate: Date, endDate: Date): Promise<string> {
    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        property: {
          include: {
            owner: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    const headers = [
      "Transaction ID", "Property ID", "Property Title", "Owner Name", "Owner Email",
      "Amount", "Currency", "Status", "UTR Number", "Gateway Trans ID", "Gateway Order ID", "Created At"
    ];

    const rows = transactions.map(tx => {
      return [
        tx.id,
        tx.propertyId,
        tx.property.title,
        tx.property.owner.name || "Registered Partner",
        tx.property.owner.email,
        tx.amount,
        tx.currency,
        tx.paymentStatus,
        tx.utrNumber || "",
        tx.gatewayTransactionId || "",
        tx.gatewayOrderId || "",
        tx.createdAt
      ];
    });

    return this.toCSVString(headers, rows);
  }

  /**
   * Reconciliation logs auditor spreadsheet.
   */
  static async exportReconciliationLogsToCSV(startDate: Date, endDate: Date): Promise<string> {
    const logs = await prisma.reconciliationLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: "asc" }
    });

    const headers = [
      "Reconciliation Log ID", "Transaction ID", "Invoice ID", "Settlement Record ID",
      "Status", "Expected Amount", "Received Amount", "Mismatch Amount", "Notes", "Reconciled At"
    ];

    const rows = logs.map(log => {
      return [
        log.id,
        log.transactionId || "",
        log.invoiceId || "",
        log.settlementRecordId || "",
        log.reconciliationStatus,
        log.expectedAmount,
        log.receivedAmount,
        log.mismatchAmount,
        log.notes || "",
        log.reconciledAt || ""
      ];
    });

    return this.toCSVString(headers, rows);
  }
}
