import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/database/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params;

    // 1. Authenticate caller
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    // 2. Fetch transaction with related fields
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        property: {
          select: {
            ownerId: true,
            title: true,
            slug: true
          }
        },
        subscription: true,
        provider: {
          select: {
            displayName: true,
            providerType: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Payment transaction not found" }, { status: 404 });
    }

    // 3. Multi-tenant access check
    if (transaction.property.ownerId !== auth.userId && auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    // 4. Return formatted response details
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.paymentStatus,
        reviewNote: transaction.adminReviewNote,
        amount: transaction.amount,
        currency: transaction.currency,
        utrNumber: transaction.utrNumber,
        paidAt: transaction.paidAt,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        paymentMethod: transaction.provider?.displayName || "Manual UPI",
        planInfo: {
          selectedPlanId: transaction.subscription?.selectedPlanId,
          billingCycle: transaction.subscription?.billingCycle,
          subscriptionExpiry: transaction.subscription?.expiresAt
        }
      }
    });

  } catch (error) {
    console.error("[TRANSACTION_STATUS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
