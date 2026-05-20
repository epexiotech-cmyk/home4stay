import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing transaction ID parameter" }, { status: 400 });
    }

    // 1. Query the transaction with all details included
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        property: true,
        subscription: true,
        provider: true,
        auditLogs: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 2. STRICT TENANT SECURITY CHECK
    const auth = await requirePropertyAccess(request, transaction.propertyId);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Return the transaction data with precise field selections
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        propertyId: transaction.propertyId,
        propertyTitle: transaction.property.title,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentStatus: transaction.paymentStatus,
        utrNumber: transaction.utrNumber,
        paymentScreenshotUrl: transaction.paymentScreenshotUrl,
        adminReviewNote: transaction.adminReviewNote,
        reviewedAt: transaction.reviewedAt,
        paidAt: transaction.paidAt,
        createdAt: transaction.createdAt,
        provider: transaction.provider ? {
          displayName: transaction.provider.displayName,
          upiId: transaction.provider.upiId,
          merchantName: transaction.provider.merchantName
        } : null,
        subscription: transaction.subscription ? {
          id: transaction.subscription.id,
          selectedPlanId: transaction.subscription.selectedPlanId,
          billingCycle: transaction.subscription.billingCycle,
          startsAt: transaction.subscription.startsAt,
          expiresAt: transaction.subscription.expiresAt
        } : null,
        auditLogs: transaction.auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          oldStatus: log.oldStatus,
          newStatus: log.newStatus,
          performedBy: log.performedBy === auth.userId ? "You" : "Super Admin",
          createdAt: log.createdAt,
          metadata: log.metadata
        }))
      }
    });

  } catch (error) {
    console.error("[TRANSACTION_DETAILS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
