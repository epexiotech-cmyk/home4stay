import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { getTenantData } from "@/lib/mock/tenantData";
import { BookingStatus, KYCStatus, MealPlan, PaymentStatus } from "@/components/calendar/types";

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId") || "";
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
    }

    // 1. STRICT TENANT ISOLATION CHECK against PostgreSQL
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    // 2. QUERY PHYSICAL DATABASE FOR ROOMS
    const dbRooms = await prisma.room.findMany({
      where: { propertyId, isActive: true }
    });

    const roomGroups = dbRooms.map((r, index) => ({
      name: r.name,
      rooms: [
        { id: r.id, name: `${r.name} Room ${101 + index}`, type: r.view, status: "clean" as const }
      ]
    }));

    // 3. QUERY PHYSICAL DATABASE FOR BOOKINGS
    const dbBookings = await prisma.booking.findMany({
      where: { propertyId },
      include: {
        guests: {
          where: { isPrimaryGuest: true },
          include: { guest: true }
        }
      }
    });

    // Load static tenant reservations securely inside the authorized boundary
    const tenantData = getTenantData(propertyId);
    const mockReservations = tenantData.reservations || [];

    // Map database bookings to Reservation contract
    const dbReservations = dbBookings.map(b => {
      const primaryGuestNode = b.guests[0]?.guest;
      return {
        id: b.id,
        guestName: primaryGuestNode?.fullName || "Database Guest",
        roomId: b.roomId,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status.toLowerCase() as BookingStatus,
        kycStatus: (primaryGuestNode?.kycStatus as KYCStatus) || "PENDING",
        source: b.source,
        mealPlan: b.mealPlan as MealPlan,
        paymentStatus: b.paymentStatus.toLowerCase() as PaymentStatus,
        occupancy: { adults: 2, children: 0 },
        amount: b.amount,
        primaryGuest: primaryGuestNode ? {
          id: primaryGuestNode.id,
          fullName: primaryGuestNode.fullName,
          mobile: primaryGuestNode.mobile,
          email: primaryGuestNode.email || undefined,
          nationality: primaryGuestNode.nationality,
          kycStatus: primaryGuestNode.kycStatus as KYCStatus,
          aadhaarVerified: primaryGuestNode.aadhaarVerified,
          address: {
            line1: primaryGuestNode.addressLine1 || "",
            city: primaryGuestNode.city || "",
            state: primaryGuestNode.state || "",
            pincode: primaryGuestNode.pincode || "",
            country: primaryGuestNode.country || ""
          }
        } : undefined
      };
    });

    // Combine both database-first bookings and tenant mock bookings securely
    const reservations = [...dbReservations, ...mockReservations];

    return NextResponse.json({ success: true, roomGroups, reservations });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
