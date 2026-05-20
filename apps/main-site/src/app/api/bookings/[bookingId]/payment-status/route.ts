import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { generateQrDataUri } from "@/modules/payments/utils/qr";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await props.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const activeConfig = await prisma.propertyPaymentConfig.findFirst({
      where: {
        propertyId: booking.propertyId,
        isActive: true
      }
    });

    let qrPayload: string | undefined;
    let deepLink: string | undefined;

    if (booking.paymentMode === "SMART_UPI" && activeConfig?.upiId) {
      const upiId = activeConfig.upiId;
      const merchantName = activeConfig.merchantName || "Home4Stay Merchant";
      const referenceNote = booking.paymentReference || `H4S${booking.id.substring(0, 8).toUpperCase()}`;
      const amountStr = booking.amount.toFixed(2);
      
      deepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(referenceNote)}`;
      qrPayload = generateQrDataUri(deepLink, 280);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      paymentMode: booking.paymentMode,
      amount: booking.amount,
      paymentReference: booking.paymentReference,
      paymentExpiresAt: booking.paymentExpiresAt,
      temporaryInventoryLockedUntil: booking.temporaryInventoryLockedUntil,
      qrPayload,
      deepLink
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Booking payment-status API failure:", message);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
