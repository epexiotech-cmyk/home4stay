import { prisma } from "@/lib/database/prisma";
import { getTenantData } from "@/lib/mock/tenantData";

export class PartnerDashboardService {
  static async getDashboardStats(propertyId: string) {
    const dbBookings = await prisma.booking.findMany({ where: { propertyId } });
    
    const confirmedBookings = dbBookings.filter((b: any) => b.status === "CONFIRMED" || b.status === "confirmed" || b.status === "CHECKED_IN" || b.status === "checked_in");
    const dbRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + b.amount, 0);
    const dbPending = dbBookings.filter((b: any) => b.paymentStatus === "PENDING" || b.paymentStatus === "pending").reduce((sum: number, b: any) => sum + b.amount, 0);
    
    const tenantData = getTenantData(propertyId);
    const mockStats = tenantData.stats;

    return {
      ...mockStats,
      totalRevenue: mockStats.totalRevenue + dbRevenue,
      revenueMtd: mockStats.revenueMtd + dbRevenue,
      pendingPayments: mockStats.pendingPayments + dbPending,
      avgBookingValue: confirmedBookings.length > 0 
        ? Math.round((mockStats.totalRevenue + dbRevenue) / (confirmedBookings.length + 5)) 
        : mockStats.avgBookingValue
    };
  }

  static async getFinancials(propertyId: string) {
    const dbBookings = await prisma.booking.findMany({ where: { propertyId } });
    
    const confirmedBookings = dbBookings.filter((b: any) => b.status === "CONFIRMED" || b.status === "confirmed" || b.status === "CHECKED_IN" || b.status === "checked_in");
    const dbRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + b.amount, 0);
    const dbPending = dbBookings.filter((b: any) => b.paymentStatus === "PENDING" || b.paymentStatus === "pending").reduce((sum: number, b: any) => sum + b.amount, 0);

    const tenantData = getTenantData(propertyId);
    const mockStats = tenantData.stats;

    return {
      transactions: tenantData.transactions, 
      invoices: tenantData.invoices,
      stats: {
        totalRevenue: mockStats.totalRevenue + dbRevenue,
        pendingPayments: mockStats.pendingPayments + dbPending,
        gstCollected: mockStats.gstCollected + Math.round(dbRevenue * 0.18),
        avgBookingValue: confirmedBookings.length > 0
          ? Math.round((mockStats.totalRevenue + dbRevenue) / (confirmedBookings.length + 5))
          : mockStats.avgBookingValue
      }
    };
  }
}
