import 'server-only';
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";

interface InvoicePdfData {
  bookingId: string;
  invoiceNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyAddress: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMode: string;
  paymentRef: string;
  utrNumber: string;
}

/**
 * Service responsible for compiling luxury PDF invoice layouts on the server side using pdfkit.
 */
export class InvoicePdfGenerator {
  /**
   * Generates a buffer representing the compiled PDF invoice.
   */
  static async generate(data: InvoicePdfData): Promise<Buffer> {
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

        const BRAND_PRIMARY = "#053344";  // Luxury Teal
        const BRAND_ACCENT = "#FCBC43";   // Warm Gold
        const TEXT_DARK = "#1A202C";      // Slate Charcoal
        const TEXT_LIGHT = "#718096";     // Light Cool Gray
        const BG_LIGHT = "#F7FAFC";       // Off-white / light slate background

        // --- 1. HEADER SECTION ---
        doc.rect(0, 0, 595.28, 120)
           .fill(BRAND_PRIMARY);

        // Header Title Logo
        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(24)
           .text("HOME4STAY", 45, 38, { characterSpacing: 1 });

        doc.fillColor(BRAND_ACCENT)
           .font("Helvetica-Bold")
           .fontSize(8)
           .text("LUXURY LIVING REDEFINED", 47, 66, { characterSpacing: 2 });

        // Invoice Label & Details on Header Right
        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(22)
           .text("TAX INVOICE", 380, 38, { align: "right" });

        doc.fillColor(BRAND_ACCENT)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text(data.invoiceNumber, 380, 66, { align: "right" });

        // --- 2. DOUBLE COLUMN INFORMATION GRID ---
        const startY = 145;

        // Column 1: Billed To / Guest Info
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("BILLED TO (GUEST)", 45, startY);

        doc.moveTo(45, startY + 12)
           .lineTo(250, startY + 12)
           .strokeColor(BRAND_ACCENT)
           .lineWidth(1)
           .stroke();

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(12)
           .text(data.guestName, 45, startY + 22);

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(9.5)
           .text(`Email: ${data.guestEmail}`, 45, startY + 38)
           .text(`Phone: ${data.guestPhone || "N/A"}`, 45, startY + 52);

        // Column 2: Stay Context / Properties Info
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("STAY DESTINATION", 300, startY);

        doc.moveTo(300, startY + 12)
           .lineTo(550, startY + 12)
           .strokeColor(BRAND_ACCENT)
           .lineWidth(1)
           .stroke();

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(12)
           .text(data.propertyName, 300, startY + 22);

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(9.5)
           .text(data.propertyAddress || "Premium Hospitality Stay", 300, startY + 38, { width: 250 });

        // --- 3. METADATA STATEMENT STRIP ---
        const metaY = 235;
        doc.rect(45, metaY, 505, 55)
           .fillAndStroke(BG_LIGHT, "#E2E8F0");

        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(8.5);

        // Labels
        doc.text("CHECK-IN", 65, metaY + 12)
           .text("CHECK-OUT", 175, metaY + 12)
           .text("ALLOCATION", 285, metaY + 12)
           .text("PAYMENT UTR", 395, metaY + 12);

        // Values
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10.5);

        doc.text(data.checkIn, 65, metaY + 26)
           .text(data.checkOut, 175, metaY + 26)
           .text(data.roomName.substring(0, 15), 285, metaY + 26)
           .text(data.utrNumber ? data.utrNumber.substring(0, 13) : "VERIFIED", 395, metaY + 26);

        // --- 4. ITEMIZED CHARGES TABLE ---
        const tableY = 315;
        
        // Table Header
        doc.rect(45, tableY, 505, 26)
           .fill(BRAND_PRIMARY);

        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(9.5);

        doc.text("DESCRIPTION", 60, tableY + 9)
           .text("QTY / NIGHTS", 250, tableY + 9, { width: 80, align: "center" })
           .text("UNIT RATE", 340, tableY + 9, { width: 90, align: "right" })
           .text("AMOUNT (INR)", 445, tableY + 9, { width: 95, align: "right" });

        // Row 1: Base Suite Rental
        const row1Y = tableY + 38;
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10.5)
           .text(`Luxury Suite - ${data.roomName}`, 60, row1Y);

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(9.5)
           .text("Standard Accommodation Plan charges", 60, row1Y + 14);

        // Units
        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .text(String(data.nightsCount), 250, row1Y + 6, { width: 80, align: "center" })
           .text(`₹${(data.baseAmount / data.nightsCount).toFixed(2)}`, 340, row1Y + 6, { width: 90, align: "right" })
           .text(`₹${data.baseAmount.toFixed(2)}`, 445, row1Y + 6, { width: 95, align: "right" });

        // Row 2: Future GST Placeholders
        const row2Y = row1Y + 44;
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10.5)
           .text("Luxury Lodging GST (Placeholders)", 60, row2Y);

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(9.5)
           .text("CGST @ 6% + SGST @ 6%", 60, row2Y + 14);

        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .text("1", 250, row2Y + 6, { width: 80, align: "center" })
           .text(`₹${data.gstAmount.toFixed(2)}`, 340, row2Y + 6, { width: 90, align: "right" })
           .text(`₹${data.gstAmount.toFixed(2)}`, 445, row2Y + 6, { width: 95, align: "right" });

        // Horizontal Separator Line
        const sepY = row2Y + 42;
        doc.moveTo(45, sepY)
           .lineTo(550, sepY)
           .strokeColor("#E2E8F0")
           .lineWidth(1)
           .stroke();

        // --- 5. SUMMARY TOTALS ---
        const summaryY = sepY + 16;
        
        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(10)
           .text("Subtotal:", 320, summaryY, { width: 110, align: "right" })
           .text("Tax Total (GST):", 320, summaryY + 18, { width: 110, align: "right" });

        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .text(`₹${data.baseAmount.toFixed(2)}`, 445, summaryY, { width: 95, align: "right" })
           .text(`₹${data.gstAmount.toFixed(2)}`, 445, summaryY + 18, { width: 95, align: "right" });

        // Grand Total Box
        const totalBoxY = summaryY + 38;
        doc.rect(300, totalBoxY, 250, 34)
           .fill(BRAND_PRIMARY);

        doc.fillColor("#FFFFFF")
           .font("Helvetica-Bold")
           .fontSize(11)
           .text("GRAND TOTAL (PAID):", 315, totalBoxY + 12)
           .fontSize(13)
           .text(`₹${data.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, totalBoxY + 11, { width: 110, align: "right" });

        // --- 6. REGULATORY AND SECURITY DECLARATIONS ---
        const noteY = 560;
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(9.5)
           .text("TERMS & REGULATORY DECLARATIONS", 45, noteY);

        doc.moveTo(45, noteY + 11)
           .lineTo(550, noteY + 11)
           .strokeColor(BRAND_PRIMARY)
           .lineWidth(0.5)
           .stroke();

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica")
           .fontSize(8)
           .text("1. This is a computer-generated tax invoice generated securely via Home4Stay ledgers on verification of receipt of settlement. No physical signatures are mandatory.", 45, noteY + 18, { width: 505 })
           .text(`2. Complete payment was received via mode [${data.paymentMode || "UPI"}] against transaction reference: ${data.paymentRef || "SUCCESS"}.`, 45, noteY + 32, { width: 505 })
           .text("3. Stay policies, guest terms, and cancel-refund structures are governed by the primary partner contract allocated at registration. Thank you for staying with us!", 45, noteY + 46, { width: 505 });

        // --- 7. QR CODE LAYOUT PLACEHOLDER ---
        const qrBoxY = noteY + 68;
        doc.rect(45, qrBoxY, 55, 55)
           .fillAndStroke(BG_LIGHT, "#CBD5E0");

        // QR Mini Label inside box
        doc.fillColor(BRAND_PRIMARY)
           .font("Helvetica-Bold")
           .fontSize(6)
           .text("DIGITAL LEDGER", 48, qrBoxY + 16, { width: 50, align: "center" })
           .fontSize(7)
           .text("VERIFIED", 48, qrBoxY + 28, { width: 50, align: "center" });

        doc.fillColor(TEXT_LIGHT)
           .font("Helvetica-Oblique")
           .fontSize(8.5)
           .text("Scan code or browse verification details directly from your Customer stay dashboard.", 115, qrBoxY + 22);

        // Finalize document compilation
        doc.end();

        logger({
          level: "info",
          event: "PDF_COMPILE_SUCCESS",
          message: `Successfully compiled PDF invoice for booking ID: ${data.bookingId}`,
          requestId: "pdf-generator"
        });

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        logger({
          level: "error",
          event: "PDF_COMPILE_FAILURE",
          message: `Failed to compile PDF: ${msg}`,
          requestId: "pdf-generator"
        });
        reject(err);
      }
    });
  }
}
