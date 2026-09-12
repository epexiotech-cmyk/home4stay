import { prisma } from "@/lib/database/prisma";
import { endOfDay, startOfDay, startOfMonth, format } from "date-fns";

export class PartnerDashboardService {
  static async getDashboardStats(propertyId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      revenueData,
      totalRoomsAgg,
      activeBookingsCount,
      approvalsCount,
      todayCheckIns,
      todayCheckOuts,
      monthBookings
    ] = await Promise.all([
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          createdAt: { gte: monthStart }
        }
      }),
      prisma.room.aggregate({
        _sum: { roomCount: true },
        where: { propertyId, isActive: true }
      }),
      prisma.booking.count({
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          startDate: { lte: todayEnd },
          endDate: { gt: todayStart }
        }
      }),
      prisma.booking.count({
        where: {
          propertyId,
          paymentStatus: "UNDER_OWNER_VERIFICATION"
        }
      }),
      prisma.booking.findMany({
        where: { propertyId, startDate: { gte: todayStart, lte: todayEnd } },
        select: { id: true, startDate: true, room: { select: { name: true } } }
      }),
      prisma.booking.findMany({
        where: { propertyId, endDate: { gte: todayStart, lte: todayEnd } },
        select: { id: true, endDate: true, room: { select: { name: true } } }
      }),
      prisma.booking.findMany({
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          createdAt: { gte: monthStart }
        },
        select: { amount: true, createdAt: true }
      })
    ]);

    const revenueMtd = revenueData._sum.amount || 0;
    const totalRooms = totalRoomsAgg._sum.roomCount || 0;
    const occupancy = totalRooms > 0 ? Math.round((activeBookingsCount / totalRooms) * 100) : 0;

    const todayOps = [
      ...todayCheckIns.map(b => ({
        status: "pending",
        task: `Check-in: ${b.room?.name || "Room"}`,
        time: format(b.startDate, "hh:mm a")
      })),
      ...todayCheckOuts.map(b => ({
        status: "pending",
        task: `Check-out: ${b.room?.name || "Room"}`,
        time: format(b.endDate, "hh:mm a")
      }))
    ];

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyRevenue = new Array(daysInMonth).fill(0);
    monthBookings.forEach(b => {
      const day = b.createdAt.getDate() - 1;
      dailyRevenue[day] += Number(b.amount) || 0;
    });
    const maxRevenue = Math.max(...dailyRevenue, 1);
    const revenueChart = dailyRevenue.map(rev => Math.round((rev / maxRevenue) * 100));

    const elapsedDays = Math.max(1, now.getDate());
    
    return {
      revenueMtd,
      revenueTrend: 0,
      avgDaily: revenueMtd > 0 ? Math.round(revenueMtd / elapsedDays) : 0,
      targetPercent: null,
      occupancy,
      todayOps,
      approvals: approvalsCount,
      revenueChart
    };
  }

  static async getFinancials(propertyId: string) {
    const [revenueData, pendingData, confirmedBookings] = await Promise.all([
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] }
        }
      }),
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: {
          propertyId,
          paymentStatus: "UNDER_OWNER_VERIFICATION"
        }
      }),
      prisma.booking.count({
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] }
        }
      })
    ]);

    const totalRevenue = revenueData._sum.amount || 0;
    const pendingPayments = pendingData._sum.amount || 0;

    return {
      transactions: [], 
      invoices: [],
      stats: {
        totalRevenue,
        pendingPayments,
        gstCollected: Math.round(totalRevenue * 0.18),
        avgBookingValue: confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0
      }
    };
  }
}
