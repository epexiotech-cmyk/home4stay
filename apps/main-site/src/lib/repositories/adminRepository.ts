import { prisma } from "@/lib/database/prisma";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

export class AdminRepository {
  // Finance Dashboard
  static async getInvoicesForFinance() {
    return prisma.invoice.findMany({
      where: { status: { in: ["ISSUED", "PAID"] } }
    });
  }
  
  static async getReconciliationCounts() {
    const [matchedCount, mismatchCount, pendingCount] = await Promise.all([
      prisma.reconciliationLog.count({ where: { reconciliationStatus: "MATCHED" } }),
      prisma.reconciliationLog.count({ where: { reconciliationStatus: "MISMATCH" } }),
      prisma.reconciliationLog.count({ where: { reconciliationStatus: "PENDING" } })
    ]);
    return { matchedCount, mismatchCount, pendingCount };
  }
  
  static async getApprovedTransactionsWithReconciliation() {
    return prisma.paymentTransaction.findMany({
      where: { paymentStatus: "APPROVED" },
      select: { id: true, reconciliationLogs: true }
    });
  }

  static async getRecentPaymentTransactions(take = 10) {
    return prisma.paymentTransaction.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { title: true, owner: { select: { name: true, email: true } } } },
        reconciliationLogs: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });
  }

  static async getRecentSettlements(take = 10) {
    return prisma.settlementRecord.findMany({
      take,
      orderBy: { settlementDate: "desc" }
    });
  }

  static async getRecentReconciliationLogs(take = 10) {
    return prisma.reconciliationLog.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: {
        transaction: { select: { utrNumber: true, gatewayTransactionId: true } },
        invoice: { select: { invoiceNumber: true } }
      }
    });
  }

  // Payments Dashboard
  static async resolveOwnerDetails(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: { select: { name: true, email: true } },
        userAccesses: {
          where: { role: "owner" },
          include: { user: { select: { name: true, email: true } } },
          take: 1
        }
      }
    });
    
    if (property?.userAccesses?.[0]?.user) {
      return { 
        name: property.userAccesses[0].user.name, 
        email: property.userAccesses[0].user.email 
      };
    }
    
    if (property?.owner) {
      return { 
        name: property.owner.name, 
        email: property.owner.email 
      };
    }
    
    return { name: "Platform Owner", email: "owner@home4stay.com" };
  }

  static async getPendingTransactions() {
    return prisma.paymentTransaction.findMany({
      where: { paymentStatus: { in: [PaymentStatus.PENDING_APPROVAL, PaymentStatus.PENDING] } },
      include: { property: true, subscription: true, provider: true },
      orderBy: { createdAt: "asc" }
    });
  }

  static async getHistoryTransactions(take = 40) {
    return prisma.paymentTransaction.findMany({
      where: { paymentStatus: { in: [PaymentStatus.APPROVED, PaymentStatus.REJECTED, PaymentStatus.SUCCESS] } },
      include: { property: true, subscription: true },
      orderBy: { createdAt: "desc" },
      take
    });
  }

  static async getExpiringSubscriptions(now: Date, next30Days: Date) {
    return prisma.propertySubscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: { gt: now, lte: next30Days }
      },
      include: { property: true },
      orderBy: { expiresAt: "asc" }
    });
  }

  static async getAllApprovedTransactions() {
    return prisma.paymentTransaction.findMany({
      where: { paymentStatus: { in: [PaymentStatus.APPROVED, PaymentStatus.SUCCESS] } }
    });
  }

  static async getActiveSubscriptions() {
    return prisma.propertySubscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE }
    });
  }

  static async getActiveSubscriptionsCount() {
    return prisma.propertySubscription.count({
      where: { status: SubscriptionStatus.ACTIVE }
    });
  }

  static async getRejectedPaymentCount() {
    return prisma.paymentTransaction.count({
      where: { paymentStatus: PaymentStatus.REJECTED }
    });
  }

  // Audit Logs
  static async getAuditLogs(take = 100) {
    return prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, role: true } }
      }
    });
  }
}
