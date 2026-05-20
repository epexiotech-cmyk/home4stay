import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Fortify under strict Admin/Super Admin role bounds
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Helper: Safe double-lookup to fetch the owner for a property
    const resolveOwnerDetails = async (propertyId: string) => {
      const ownerAccess = await prisma.propertyUserAccess.findFirst({
        where: {
          propertyId,
          role: "owner"
        },
        include: {
          user: true
        }
      });
      if (ownerAccess?.user) {
        return {
          name: ownerAccess.user.name,
          email: ownerAccess.user.email
        };
      }

      // Fallback
      const property = await prisma.property.findUnique({
        where: { id: propertyId }
      });
      if (property && property.ownerId) {
        const user = await prisma.user.findUnique({
          where: { id: property.ownerId }
        });
        if (user) {
          return {
            name: user.name,
            email: user.email
          };
        }
      }
      return {
        name: "Platform Owner",
        email: "owner@home4stay.com"
      };
    };

    // 2. Fetch pending approvals queue
    const pendingTransactions = await prisma.paymentTransaction.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.PENDING_APPROVAL, PaymentStatus.PENDING] }
      },
      include: {
        property: true,
        subscription: true,
        provider: true
      },
      orderBy: { createdAt: "asc" }
    });

    const pendingQueue = await Promise.all(pendingTransactions.map(async (tx) => {
      const owner = await resolveOwnerDetails(tx.propertyId);
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

    // 3. Fetch recent transaction history (Approved / Rejected)
    const recentTransactions = await prisma.paymentTransaction.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.APPROVED, PaymentStatus.REJECTED, PaymentStatus.SUCCESS] }
      },
      include: {
        property: true,
        subscription: true
      },
      orderBy: { createdAt: "desc" },
      take: 40
    });

    const historyLogs = await Promise.all(recentTransactions.map(async (tx) => {
      const owner = await resolveOwnerDetails(tx.propertyId);
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

    // 4. Fetch expiring subscriptions
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const expiringSubscriptions = await prisma.propertySubscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          gt: now,
          lte: next30Days
        }
      },
      include: {
        property: true
      },
      orderBy: { expiresAt: "asc" }
    });

    const expiringQueue = await Promise.all(expiringSubscriptions.map(async (sub) => {
      const owner = await resolveOwnerDetails(sub.propertyId);
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

    // 5. Gather Finance Analytics Counters
    const allApprovedTx = await prisma.paymentTransaction.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.APPROVED, PaymentStatus.SUCCESS] }
      }
    });

    const totalRevenue = allApprovedTx.reduce((sum, tx) => sum + tx.amount, 0);

    const pendingApprovalsAmount = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const activeSubscriptionsCount = await prisma.propertySubscription.count({
      where: { status: SubscriptionStatus.ACTIVE }
    });

    const rejectedPaymentCount = await prisma.paymentTransaction.count({
      where: { paymentStatus: PaymentStatus.REJECTED }
    });

    // SaaS MRR / ARR Analytics Engine
    const activeSubscriptions = await prisma.propertySubscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE }
    });

    let mrr = 0;
    activeSubscriptions.forEach((sub) => {
      const amount = sub.amount;
      switch (sub.billingCycle) {
        case "MONTHLY":
          mrr += amount;
          break;
        case "QUARTERLY":
          mrr += amount / 3;
          break;
        case "YEARLY":
          mrr += amount / 12;
          break;
        case "LIFETIME":
          mrr += amount / 120; // Estimated 10 year amortization standard
          break;
        default:
          mrr += amount / 12;
      }
    });

    const arr = mrr * 12;

    return NextResponse.json({
      success: true,
      finance: {
        totalRevenue,
        pendingApprovalsAmount,
        activeSubscriptionsCount,
        rejectedPaymentCount,
        mrr,
        arr
      },
      pendingQueue,
      historyLogs,
      expiringQueue
    });

  } catch (error) {
    console.error("[ADMIN_PAYMENTS_DASHBOARD_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
