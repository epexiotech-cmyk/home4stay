import 'server-only';
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface SubscriptionPdfData {
  invoiceNumber: string;
  issuedAt: string;
  paidAt: string;
  invoiceType: string;
  sacCode: string;
  
  // Platform settings
  platform: {
    companyName: string;
    legalBusinessName: string;
    gstin: string;
    pan: string;
    address: string;
    supportEmail: string;
    supportPhone: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };

  // Partner / Customer Details
  customer: {
    billingName: string;
    billingAddress: string;
    gstin: string;
  };

  // Plan Details
  plan: {
    name: string;
    billingCycle: string;
    startDate: string;
    endDate: string;
  };

  // Financial Breakdown
  pricing: {
    subtotal: number;
    gstPercent: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    currency: string;
  };

  // Transaction Info
  payment: {
    method: string;
    utrNumber: string;
  };

  // Optional Referral Reward
  referral?: {
    creditsUsed: number;
    discountAmount: number;
    originalSubtotal: number;
  };
}

export class SubscriptionPdfGenerator {
  /**
   * Compiles the dynamic SaaS subscription GST tax invoice to a PDF Buffer.
   */
  static async generate(data: SubscriptionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 40, bottom: 40, left: 45, right: 45 }
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (err) => reject(err));

        // Colors tailored to modern corporate luxury
        const BRAND_PRIMARY = "#053344";  // Luxury Teal
        const BRAND_ACCENT = "#FCBC43";   // Warm Gold
        const TEXT_DARK = "#1A202C";      // Slate Charcoal
        const TEXT_LIGHT = "#718096";     // Light Cool Gray
        const BG_LIGHT = "#F7FAFC";       // Off-white slate
        const BORDER_COLOR = "#E2E8F0";

        // --- 1. HEADER SECTION ---
        doc.rect(0, 0, 595.28, 120).fill(BRAND_PRIMARY);

        // Header Title Logo
        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(24)
           .text("HOME4STAY", 45, 38, { characterSpacing: 1 });

        doc.fillColor(BRAND_ACCENT)
           .font("Helvetica-Bold")
           .fontSize(8)
           .text("SUBSCRIPTION TAX INVOICE", 47, 66, { characterSpacing: 2 });

        // Invoice Label on Header Right
        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(20)
           .text("TAX INVOICE", 380, 38, { align: "right" });

        doc.fillColor(BRAND_ACCENT)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text(data.invoiceNumber, 380, 66, { align: "right" });

        // --- 2. DOUBLE COLUMN INFORMATION GRID ---
        const startY = 140;

        // Column 1: ISSUER DETAILS (Home4Stay)
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("ISSUED BY (PROVIDER)", 45, startY);

        doc.moveTo(45, startY + 12)
           .lineTo(250, startY + 12)
           .strokeColor(BRAND_ACCENT)
           .lineWidth(1)
           .stroke();

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(11)
           .text(data.platform.legalBusinessName, 45, startY + 20, { width: 205 });

        let currentHeight = startY + 36;
        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8.5)
           .text(data.platform.address, 45, currentHeight, { width: 205 });

        // Calculate size of address block
        const addrHeight = doc.heightOfString(data.platform.address, { width: 205 });
        currentHeight += Math.max(addrHeight + 4, 30);

        doc.text(`GSTIN: ${data.platform.gstin}`, 45, currentHeight)
           .text(`PAN: ${data.platform.pan}`, 45, currentHeight + 12)
           .text(`Email: ${data.platform.supportEmail}`, 45, currentHeight + 24)
           .text(`Phone: ${data.platform.supportPhone}`, 45, currentHeight + 36);

        // Column 2: BILLED TO (Partner / Customer)
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("BILLED TO (RECIPIENT)", 300, startY);

        doc.moveTo(300, startY + 12)
           .lineTo(550, startY + 12)
           .strokeColor(BRAND_ACCENT)
           .lineWidth(1)
           .stroke();

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(11)
           .text(data.customer.billingName, 300, startY + 20, { width: 250 });

        let clientHeight = startY + 36;
        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8.5)
           .text(data.customer.billingAddress || "No registered address provided", 300, clientHeight, { width: 250 });

        const clientAddrHeight = doc.heightOfString(data.customer.billingAddress || "", { width: 250 });
        clientHeight += Math.max(clientAddrHeight + 4, 30);

        doc.text(`GSTIN: ${data.customer.gstin || "N/A - Standard Customer"}`, 300, clientHeight);

        // --- 3. METADATA STATEMENT STRIP ---
        const metaY = 265;
        doc.rect(45, metaY, 505, 50)
           .fillAndStroke(BG_LIGHT, BORDER_COLOR);

        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(8);

        // Labels
        doc.text("INVOICE DATE", 65, metaY + 10)
           .text("BILLING CYCLE", 175, metaY + 10)
           .text("SAC CODE", 285, metaY + 10)
           .text("PAYMENT UTR", 395, metaY + 10);

        // Values
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(9.5);

        doc.text(data.issuedAt, 65, metaY + 24)
           .text(data.plan.billingCycle, 175, metaY + 24)
           .text(data.sacCode, 285, metaY + 24)
           .text(data.payment.utrNumber ? data.payment.utrNumber.substring(0, 15) : "ADMIN MANUAL", 395, metaY + 24);

        // --- 4. ITEMIZED CHARGES TABLE ---
        const tableY = 335;
        
        // Table Header
        doc.rect(45, tableY, 505, 26).fill(BRAND_PRIMARY);

        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(9);

        doc.text("DESCRIPTION", 60, tableY + 8)
           .text("SAC CODE", 250, tableY + 8, { width: 70, align: "center" })
           .text("RATE / PERIOD", 330, tableY + 8, { width: 95, align: "right" })
           .text("AMOUNT (INR)", 435, tableY + 8, { width: 105, align: "right" });

        let currentY = tableY + 38;

        // Row 1: Subscription details (Original base amount if referral discount exists)
        const subtotalToDisplay = data.referral ? data.referral.originalSubtotal : data.pricing.subtotal;
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text(`SaaS Plan: ${data.plan.name}`, 60, currentY);

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8.5)
           .text(`Subscription coverage: ${data.plan.startDate} to ${data.plan.endDate}`, 60, currentY + 14);

        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .fontSize(9.5)
           .text(data.sacCode, 250, currentY + 6, { width: 70, align: "center" })
           .text(`₹${subtotalToDisplay.toFixed(2)}`, 330, currentY + 6, { width: 95, align: "right" })
           .text(`₹${subtotalToDisplay.toFixed(2)}`, 435, currentY + 6, { width: 105, align: "right" });

        currentY += 40;

        // Optional Row: Referral Discount
        if (data.referral && data.referral.discountAmount > 0) {
          doc.fillColor(TEXT_DARK)
             .font("Helvetica-Bold")
             .fontSize(10)
             .text(`Referral Discount (Redeemed ${data.referral.creditsUsed} credits)`, 60, currentY);

          doc.fillColor(TEXT_LIGHT)
             .font("Helvetica")
             .fontSize(8.5)
             .text("Credits applied to base subscription before taxes", 60, currentY + 14);

          doc.fillColor(TEXT_DARK)
             .font("Helvetica")
             .fontSize(9.5)
             .text("-", 250, currentY + 6, { width: 70, align: "center" })
             .text(`-₹${data.referral.discountAmount.toFixed(2)}`, 330, currentY + 6, { width: 95, align: "right" })
             .text(`-₹${data.referral.discountAmount.toFixed(2)}`, 435, currentY + 6, { width: 105, align: "right" });

          currentY += 40;
        }

        // Row 2: Tax break columns
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("Integrated Goods and Services Tax (GST)", 60, currentY);

        const hasIgst = data.pricing.igst > 0;
        const taxDetails = hasIgst
          ? `IGST @ ${data.pricing.gstPercent}%`
          : `CGST @ ${data.pricing.gstPercent / 2}% + SGST @ ${data.pricing.gstPercent / 2}%`;

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8.5)
           .text(taxDetails, 60, currentY + 14);

        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .fontSize(9.5)
           .text("-", 250, currentY + 6, { width: 70, align: "center" })
           .text(`₹${data.pricing.gstAmount.toFixed(2)}`, 330, currentY + 6, { width: 95, align: "right" })
           .text(`₹${data.pricing.gstAmount.toFixed(2)}`, 435, currentY + 6, { width: 105, align: "right" });

        currentY += 40;

        // Horizontal Separator Line
        const sepY = currentY;
        doc.moveTo(45, sepY)
           .lineTo(550, sepY)
           .strokeColor(BORDER_COLOR)
           .lineWidth(1)
           .stroke();

        // --- 5. SUMMARY TOTALS ---
        const summaryY = sepY + 12;
        
        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(9.5)
           .text("Subtotal:", 320, summaryY, { width: 110, align: "right" });

        if (hasIgst) {
          doc.text(`IGST (${data.pricing.gstPercent}%):`, 320, summaryY + 14, { width: 110, align: "right" });
        } else {
          doc.text(`CGST (${data.pricing.gstPercent / 2}%):`, 320, summaryY + 14, { width: 110, align: "right" })
             .text(`SGST (${data.pricing.gstPercent / 2}%):`, 320, summaryY + 28, { width: 110, align: "right" });
        }

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(9.5)
           .text(`₹${data.pricing.subtotal.toFixed(2)}`, 445, summaryY, { width: 95, align: "right" });

        if (hasIgst) {
          doc.text(`₹${data.pricing.igst.toFixed(2)}`, 445, summaryY + 14, { width: 95, align: "right" });
        } else {
          doc.text(`₹${data.pricing.cgst.toFixed(2)}`, 445, summaryY + 14, { width: 95, align: "right" })
             .text(`₹${data.pricing.sgst.toFixed(2)}`, 445, summaryY + 28, { width: 95, align: "right" });
        }

        // Grand Total Box
        const totalBoxY = hasIgst ? summaryY + 36 : summaryY + 48;
        doc.rect(300, totalBoxY, 250, 32).fill(BRAND_PRIMARY);

        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("GRAND TOTAL (PAID):", 315, totalBoxY + 11)
           .fontSize(12)
           .text(`₹${data.pricing.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, totalBoxY + 10, { width: 110, align: "right" });

        // --- 6. BANK SETTLEMENT ACCOUNT DETAILS ---
        const bankY = totalBoxY + 42;
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(9.5)
           .text("BANK ACCOUNT DETAILS FOR RECORDS", 45, bankY);

        doc.moveTo(45, bankY + 12)
           .lineTo(550, bankY + 12)
           .strokeColor(BRAND_PRIMARY)
           .lineWidth(0.5)
           .stroke();

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8)
           .text(`Account Name: ${data.platform.accountName}`, 45, bankY + 18)
           .text(`Bank Name: ${data.platform.bankName} (${data.platform.branch})`, 45, bankY + 28)
           .text(`Account Number: ${data.platform.accountNumber}`, 300, bankY + 18)
           .text(`IFSC Code: ${data.platform.ifsc}`, 300, bankY + 28);

        // --- 7. REGULATORY DECLARES ---
        const noteY = bankY + 46;
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(9.5)
           .text("REGULATORY NOTES & CONDITIONS", 45, noteY);

        doc.moveTo(45, noteY + 12)
           .lineTo(550, noteY + 12)
           .strokeColor(BRAND_PRIMARY)
           .lineWidth(0.5)
           .stroke();

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8)
           .text("1. This document is a computer-generated tax invoice generated securely via Home4Stay automated ledger accounting engine. No physical signature is required.", 45, noteY + 18, { width: 505 })
           .text(`2. Fully settled through mode: [${data.payment.method || "MANUAL_UPI"}] with transaction validation: ${data.payment.utrNumber || "ADMIN APPROVAL"}.`, 45, noteY + 30, { width: 505 })
           .text("3. Subscription cancellation and refunds are subject to standard Host Agreements signed and verified digitally. GST rates applied are in accordance with standard services.", 45, noteY + 42, { width: 505 });

        // Finalize
        doc.end();

      } catch (err: unknown) {
        reject(err);
      }
    });
  }

  /**
   * Helper to compile and write the PDF directly to local storage inside apps/main-site.
   * Ensures safe path boundaries.
   */
  static async compileAndSave(data: SubscriptionPdfData, storageDir: string): Promise<string> {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const filename = `invoice-${data.invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`;
    const fullPath = path.join(storageDir, filename);

    // Check path boundary protection
    const resolvedPath = path.resolve(fullPath);
    const resolvedDir = path.resolve(storageDir);
    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error("Directory traversal detected!");
    }

    const buffer = await this.generate(data);
    fs.writeFileSync(fullPath, buffer);
    return filename;
  }
}
