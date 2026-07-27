import { AdminRepository } from "@/lib/repositories/adminRepository";

export class AdminService {
  static async getFinanceDashboardStats() {
    const invoices = await AdminRepository.getInvoicesForFinance();

    let totalCollections = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGstAmount = 0;
    let totalSubtotal = 0;

    for (const inv of invoices) {
      totalCollections += inv.totalAmount;
      totalSubtotal += inv.subtotal;
      totalGstAmount += inv.gstAmount;

      const metadata = (inv.metadata as { cgst?: number; sgst?: number; igst?: number } | null) || {};
      totalCGST += metadata.cgst || 0;
      totalSGST += metadata.sgst || 0;
      totalIGST += metadata.igst || 0;
    }

    const { matchedCount, mismatchCount, pendingCount } = await AdminRepository.getReconciliationCounts();

    const approvedTransactions = await AdminRepository.getApprovedTransactionsWithReconciliation();

    const pendingReconCount = approvedTransactions.filter(
      (tx: any) => tx.reconciliationLogs.length === 0
    ).length;

    const recentTransactions = await AdminRepository.getRecentPaymentTransactions(10);
    const recentSettlements = await AdminRepository.getRecentSettlements(10);
    const recentReconciliationLogs = await AdminRepository.getRecentReconciliationLogs(10);

    return {
      stats: {
        totalCollections: Number(totalCollections.toFixed(2)),
        totalSubtotal: Number(totalSubtotal.toFixed(2)),
        totalGstAmount: Number(totalGstAmount.toFixed(2)),
        totalCGST: Number(totalCGST.toFixed(2)),
        totalSGST: Number(totalSGST.toFixed(2)),
        totalIGST: Number(totalIGST.toFixed(2)),
        matchedCount,
        mismatchCount,
        pendingCount,
        pendingReconCount
      },
      recentTransactions,
      recentSettlements,
      recentReconciliationLogs
    };
  }

  static async getPaymentsDashboardStats() {
    const pendingTransactions = await AdminRepository.getPendingTransactions();
    
    const pendingQueue = await Promise.all(pendingTransactions.map(async (tx: any) => {
      const owner = await AdminRepository.resolveOwnerDetails(tx.propertyId);
      return {
        id: tx.id,
        propertyId: tx.propertyId,
        propertyName: tx.property.title,
        ownerName: owner.name,
        ownerEmail: owner.email,
        amount: tx.amount,
        currency: tx.currency,
        utrNumber: tx.utrNumber,
        paymentScreenshotUrl: tx.paymentScreenshotUrl,
        createdAt: tx.createdAt,
        billingCycle: tx.subscription?.billingCycle || "YEARLY",
        planId: tx.subscription?.selectedPlanId || "BASIC"
      };
    }));

    const recentTransactions = await AdminRepository.getHistoryTransactions(40);
    
    const historyLogs = await Promise.all(recentTransactions.map(async (tx: any) => {
      const owner = await AdminRepository.resolveOwnerDetails(tx.propertyId);
      return {
        id: tx.id,
        propertyId: tx.propertyId,
        propertyName: tx.property.title,
        ownerName: owner.name,
        ownerEmail: owner.email,
        amount: tx.amount,
        currency: tx.currency,
        paymentStatus: tx.paymentStatus,
        utrNumber: tx.utrNumber,
        reviewedAt: tx.reviewedAt,
        createdAt: tx.createdAt,
        billingCycle: tx.subscription?.billingCycle || "YEARLY",
        planId: tx.subscription?.selectedPlanId || "BASIC"
      };
    }));

    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const expiringSubscriptions = await AdminRepository.getExpiringSubscriptions(now, next30Days);
    
    const expiringQueue = await Promise.all(expiringSubscriptions.map(async (sub: any) => {
      const owner = await AdminRepository.resolveOwnerDetails(sub.propertyId);
      return {
        id: sub.id,
        propertyId: sub.propertyId,
        propertyName: sub.property.title,
        ownerName: owner.name,
        ownerEmail: owner.email,
        selectedPlanId: sub.selectedPlanId,
        billingCycle: sub.billingCycle,
        amount: sub.amount,
        expiresAt: sub.expiresAt
      };
    }));

    const allApprovedTx = await AdminRepository.getAllApprovedTransactions();
    const totalRevenue = allApprovedTx.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const pendingApprovalsAmount = pendingTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const activeSubscriptionsCount = await AdminRepository.getActiveSubscriptionsCount();
    const rejectedPaymentCount = await AdminRepository.getRejectedPaymentCount();

    const activeSubscriptions = await AdminRepository.getActiveSubscriptions();
    let mrr = 0;
    activeSubscriptions.forEach((sub: any) => {
      const amount = sub.amount;
      switch (sub.billingCycle) {
        case "MONTHLY": mrr += amount; break;
        case "QUARTERLY": mrr += amount / 3; break;
        case "YEARLY": mrr += amount / 12; break;
        case "LIFETIME": mrr += amount / 120; break;
        default: mrr += amount / 12;
      }
    });
    const arr = mrr * 12;

    return {
      finance: {
        totalRevenue,
        mrr: Number(mrr.toFixed(2)),
        arr: Number(arr.toFixed(2)),
        activeSubscriptionsCount,
        pendingApprovalsCount: pendingTransactions.length,
        pendingApprovalsAmount,
        rejectedPaymentCount
      },
      pendingQueue,
      expiringQueue,
      historyLogs
    };
  }

  static async getAuditLogs() {
    const auditLogs = await AdminRepository.getAuditLogs(100);
    return { auditLogs };
  }
}
