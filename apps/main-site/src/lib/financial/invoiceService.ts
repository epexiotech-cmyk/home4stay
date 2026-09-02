import 'server-only';
import { prisma } from "@/lib/database/prisma";
import { GstEngine } from "./gstEngine";
import { FinancialNumberingService } from "./financialNumberingService";
import { SubscriptionPdfGenerator, SubscriptionPdfData } from "./subscriptionPdfGenerator";
import { logger } from "@/lib/observability/logger";
import path from "path";
import fs from "fs";

export class InvoiceService {
  /**
   * Automatically generates a tax invoice for a verified subscription payment transaction.
   * Acquires access-exclusive lock, calculates taxes, inserts the Invoice, compiles PDF and saves locally.
   */
  static async generateInvoiceForTransaction(transactionId: string): Promise<any> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch transaction with related property, subscription and owner details
      const transaction = await tx.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: {
          property: {
            include: {
              owner: true
            }
          },
          subscription: true
        }
      });

      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      if (!transaction.subscription) {
        throw new Error(`Transaction ${transactionId} is not linked to a subscription`);
      }

      // Check if an invoice is already issued for this transaction to prevent duplication
      const existingInvoice = await tx.invoice.findFirst({
        where: { transactionId: transaction.id }
      });

      if (existingInvoice) {
        logger({
          level: "info",
          event: "INVOICE_GENERATION_SKIPPED",
          message: `Invoice already exists for transaction ${transactionId}, skipping issuance.`,
          requestId: "invoice-service"
        });
        return existingInvoice;
      }

      // 2. Fetch active financial settings or bootstrap defaults
      let settings = await tx.financialSettings.findFirst();
      if (!settings) {
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
            SACCode: '998311',
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

      // 3. Resolve customer/owner billing information (prioritize B2B User profile details)
      const owner = transaction.property.owner;
      const billingName = owner.legalBusinessName || owner.name || "Registered Partner";
      const billingAddress = owner.billingAddress || (transaction.property.title + ", India"); // standard fallback address format
      const recipientGstin = owner.gstin || (transaction.gatewayResponse as any)?.billingGstin || null;

      // 4. Calculate GST allocations using decimal-safe engine resolving place-of-supply
      const supplierState = settings.defaultStateCode || settings.GSTIN?.substring(0, 2) || "24";
      let customerState = null;
      if (recipientGstin) {
        customerState = recipientGstin.substring(0, 2);
      } else if (owner.billingState) {
        customerState = owner.billingState;
      }

      const isInterstate = GstEngine.isInterstateTransaction(supplierState, customerState);

      const gstRate = settings.defaultGSTPercent;
      const breakdown = GstEngine.calculateTaxBreakdown(transaction.amount, gstRate, isInterstate);

      // Resolve optional referral reward redemption details linked to subscription
      let referralDiscount = 0;
      let referralCreditsUsed = 0;
      let originalSubtotal = breakdown.subtotal;

      if (transaction.subscriptionId) {
        const redemption = await tx.referralRewardRedemption.findFirst({
          where: { subscriptionId: transaction.subscriptionId },
          orderBy: { createdAt: "desc" }
        });
        if (redemption) {
          referralDiscount = redemption.discountAmount;
          referralCreditsUsed = redemption.creditsUsed;
          originalSubtotal = breakdown.subtotal + referralDiscount;
        }
      }

      // 5. Generate lock-isolated sequential invoice number
      const invoiceNumber = await FinancialNumberingService.generateNextInvoiceNumber(tx);

      // 6. Define temporary empty PDF URL, insert Invoice database record first to assert DB constraints
      const invoiceType = transaction.subscriptionId ? "SUBSCRIPTION" : "MANUAL_ADJUSTMENT";
      
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          userId: owner.id,
          subscriptionId: transaction.subscriptionId,
          transactionId: transaction.id,
          invoiceType: invoiceType as any,
          status: "PAID", // payments approved are implicitly fully paid
          subtotal: breakdown.subtotal,
          gstPercent: breakdown.gstPercent,
          gstAmount: breakdown.gstAmount,
          totalAmount: breakdown.total,
          currency: transaction.currency,
          billingName,
          billingAddress,
          GSTIN: recipientGstin,
          issuedAt: new Date(),
          paidAt: transaction.paidAt || new Date(),
          metadata: {
            cgst: breakdown.cgst,
            sgst: breakdown.sgst,
            igst: breakdown.igst,
            paymentMethod: transaction.utrNumber ? "MANUAL_UPI" : "GATEWAY",
            utrNumber: transaction.utrNumber || "",
            referralDiscount,
            referralCreditsUsed,
            originalSubtotal
          }
        }
      });

      // 7. Resolve plan details for compiler
      // Try resolving plan name
      let planName = "SaaS Premium Plan";
      try {
        const plan = await tx.subscriptionPlan.findUnique({
          where: { id: transaction.subscription.selectedPlanId }
        });
        if (plan) {
          planName = plan.name;
        }
      } catch (err) {
        // Fallback silently if plans table holds custom tags
      }

      const billingCycleStr = transaction.subscription.billingCycle;
      const startDateStr = transaction.subscription.startsAt
        ? new Date(transaction.subscription.startsAt).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");
      const endDateStr = transaction.subscription.expiresAt
        ? new Date(transaction.subscription.expiresAt).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");

      // 8. Compile SaaS Styled PDF Tax Statement
      const bankDetailsObj = settings.bankDetails as any;
      const pdfData: SubscriptionPdfData = {
        invoiceNumber,
        issuedAt: new Date(invoice.issuedAt!).toLocaleDateString("en-IN"),
        paidAt: new Date(invoice.paidAt!).toLocaleDateString("en-IN"),
        invoiceType: String(invoice.invoiceType),
        sacCode: settings.SACCode,
        platform: {
          companyName: settings.companyName,
          legalBusinessName: settings.legalBusinessName,
          gstin: settings.GSTIN,
          pan: settings.PAN,
          address: settings.address,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          bankName: bankDetailsObj.bankName || "YES BANK",
          accountName: bankDetailsObj.accountName || "Home4Stay Technologies Pvt Ltd",
          accountNumber: bankDetailsObj.accountNumber || "",
          ifsc: bankDetailsObj.ifsc || "",
          branch: bankDetailsObj.branch || "Headquarters"
        },
        customer: {
          billingName,
          billingAddress,
          gstin: recipientGstin || ""
        },
        plan: {
          name: planName,
          billingCycle: billingCycleStr,
          startDate: startDateStr,
          endDate: endDateStr
        },
        pricing: {
          subtotal: breakdown.subtotal,
          gstPercent: breakdown.gstPercent,
          gstAmount: breakdown.gstAmount,
          cgst: breakdown.cgst,
          sgst: breakdown.sgst,
          igst: breakdown.igst,
          totalAmount: breakdown.total,
          currency: invoice.currency
        },
        payment: {
          method: transaction.utrNumber ? "MANUAL_UPI" : "GATEWAY",
          utrNumber: transaction.utrNumber || ""
        },
        referral: referralDiscount > 0 ? {
          creditsUsed: referralCreditsUsed,
          discountAmount: referralDiscount,
          originalSubtotal
        } : undefined
      };

      const storageDir = path.join(process.cwd(), "storage", "subscription-invoices");
      const filename = await SubscriptionPdfGenerator.compileAndSave(pdfData, storageDir);
      const relativePdfUrl = `/api/payments/invoices/${invoice.id}/download`;

      // 9. Update Invoice record with generated local PDF URL reference
      const finalizedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          invoicePdfUrl: relativePdfUrl,
          metadata: {
            ...(invoice.metadata as any),
            localPath: path.join("storage", "subscription-invoices", filename)
          }
        }
      });

      // 10. Audit log the successful auto-issuance
      logger({
        level: "info",
        event: "INVOICE_GENERATED_SUCCESS",
        message: `Successfully auto-issued sequential tax invoice ${invoiceNumber} for transaction ${transactionId}`,
        requestId: "invoice-service"
      });

      return finalizedInvoice;
    });
  }
}
