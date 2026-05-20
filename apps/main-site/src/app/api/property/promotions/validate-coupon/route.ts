import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/database/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, propertyId, bookingAmount } = body;

    if (!couponCode || !propertyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const offer = await db.propertyOffer.findFirst({
      where: {
        couponCode: couponCode.toUpperCase(),
        propertyId,
        isActive: true
      }
    });

    if (!offer) {
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid coupon code for this property." 
      }, { status: 404 });
    }

    // Check dates
    const now = new Date();
    if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) {
      return NextResponse.json({ 
        valid: false, 
        message: "This coupon has expired or is not yet active." 
      }, { status: 400 });
    }

    // Check minimum amount
    if (bookingAmount < offer.minimumBookingAmount) {
      return NextResponse.json({ 
        valid: false, 
        message: `Minimum booking amount of ₹${offer.minimumBookingAmount} required for this coupon.` 
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      offerId: offer.id,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      message: "Coupon applied successfully!"
    });

  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
