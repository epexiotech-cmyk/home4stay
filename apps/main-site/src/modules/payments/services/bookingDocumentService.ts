import { InvoicePdfGenerator } from "./invoicePdfGenerator";
import { InvoiceStorageService } from "./invoiceStorageService";

export class BookingDocumentService {
  static async generateAndStoreInvoice(params: {
    bookingId: string;
    invoiceNumber: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    propertyName: string;
    propertyAddress: string;
    roomName: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    paymentMode?: string | null;
    paymentReference?: string | null;
    utrNumber?: string | null;
  }) {
    const nightsCount = Math.max(1, Math.round((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const baseAmount = params.amount / 1.12;
    const gstAmount = params.amount - baseAmount;

    const pdfBuffer = await InvoicePdfGenerator.generate({
      bookingId: params.bookingId,
      invoiceNumber: params.invoiceNumber,
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      guestPhone: params.guestPhone,
      propertyName: params.propertyName,
      propertyAddress: params.propertyAddress,
      roomName: params.roomName,
      checkIn: new Date(params.startDate).toLocaleDateString("en-IN"),
      checkOut: new Date(params.endDate).toLocaleDateString("en-IN"),
      nightsCount,
      baseAmount,
      gstAmount,
      totalAmount: params.amount,
      paymentMode: params.paymentMode || "UPI",
      paymentRef: params.paymentReference || "SUCCESS",
      utrNumber: params.utrNumber || "VERIFIED"
    });

    await InvoiceStorageService.saveInvoicePdf(params.bookingId, pdfBuffer);
    return pdfBuffer;
  }
}
