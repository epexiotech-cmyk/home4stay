import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { getTenantData } from "@/lib/mock/tenantData";

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId") || "";
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
    }

    // 1. STRICT TENANT ISOLATION CHECK
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    // 2. QUERY REAL DATABASE BOOKINGS FOR DYNAMIC METRICS
    const dbBookings = await prisma.booking.findMany({
      where: { propertyId }
    });

    const confirmedBookings = dbBookings.filter(b => b.status === "CONFIRMED" || b.status === "confirmed" || b.status === "CHECKED_IN" || b.status === "checked_in");
    const dbRevenue = confirmedBookings.reduce((sum, b) => sum + b.amount, 0);
    const dbPending = dbBookings.filter(b => b.paymentStatus === "PENDING" || b.paymentStatus === "pending").reduce((sum, b) => sum + b.amount, 0);
    
    // Load static tenant stats securely inside the authorized boundary
    const tenantData = getTenantData(propertyId);
    const mockStats = tenantData.stats;

    // Merge database metrics securely into the mock stats layout
    const mergedStats = {
      ...mockStats,
      totalRevenue: mockStats.totalRevenue + dbRevenue,
      revenueMtd: mockStats.revenueMtd + dbRevenue,
      pendingPayments: mockStats.pendingPayments + dbPending,
      avgBookingValue: confirmedBookings.length > 0 
        ? Math.round((mockStats.totalRevenue + dbRevenue) / (confirmedBookings.length + 5)) 
        : mockStats.avgBookingValue
    };

    return NextResponse.json({ success: true, stats: mergedStats });
  } catch (error) {
    console.error("Dashboard stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
