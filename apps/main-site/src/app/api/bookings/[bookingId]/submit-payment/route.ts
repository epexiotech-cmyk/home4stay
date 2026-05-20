import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { PaymentSubmitSchema } from "@/modules/payments/validators";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await props.params;
    const body = await request.json();
    const { utrNumber } = body;

    // 1. Fetch booking and verify existence + current status
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Strict transition check: Can only submit payment if booking is PENDING_PAYMENT
    if (booking.paymentStatus !== "PENDING_PAYMENT") {
      return NextResponse.json({
        success: false,
        error: `Cannot submit payment. Current status is ${booking.paymentStatus}`
      }, { status: 400 });
    }

    let validatedUtr: string | undefined;

    // 2. Validate UTR (if provided)
    if (utrNumber && utrNumber.trim() !== "") {
      const validation = PaymentSubmitSchema.safeParse({ utrNumber });
      if (!validation.success) {
        return NextResponse.json({
          success: false,
          error: validation.error.issues[0].message
        }, { status: 400 });
      }
      validatedUtr = validation.data.utrNumber;

      // 3. Replay & Duplicate Submission Protection
      // Check if this UTR number has already been submitted for another booking
      const duplicateUtr = await prisma.booking.findFirst({
        where: {
          utrNumber: validatedUtr,
          id: { not: bookingId },
          paymentStatus: { in: ["PAYMENT_SUBMITTED", "UNDER_OWNER_VERIFICATION", "CONFIRMED"] }
        }
      });

      if (duplicateUtr) {
        return NextResponse.json({
          success: false,
          error: "This Transaction UTR has already been submitted for another reservation."
        }, { status: 409 });
      }
    }

    // 4. Update state inside a single transaction
    const targetStatus = validatedUtr ? "UNDER_OWNER_VERIFICATION" : "PAYMENT_SUBMITTED";

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: targetStatus,
        status: "pending",
        utrNumber: validatedUtr || null,
        paymentSubmittedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      bookingId: updatedBooking.id,
      paymentStatus: updatedBooking.paymentStatus,
      status: updatedBooking.status
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Booking submit-payment API failure:", message);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
