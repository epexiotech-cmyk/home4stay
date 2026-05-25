import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["super_admin"]);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch overall collections & tax aggregates from Invoice where status is PAID/ISSUED
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["ISSUED", "PAID"] }
      }
    });

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

    // 2. Fetch reconciliation counts
    const matchedCount = await prisma.reconciliationLog.count({
      where: { reconciliationStatus: "MATCHED" }
    });

    const mismatchCount = await prisma.reconciliationLog.count({
      where: { reconciliationStatus: "MISMATCH" }
    });

    const pendingCount = await prisma.reconciliationLog.count({
      where: { reconciliationStatus: "PENDING" }
    });

    // 3. Find payment transactions that are APPROVED but have NO reconciliation log yet
    const approvedTransactions = await prisma.paymentTransaction.findMany({
      where: {
        paymentStatus: "APPROVED"
      },
      select: {
        id: true,
        reconciliationLogs: true
      }
    });

    const pendingReconCount = approvedTransactions.filter(
      tx => tx.reconciliationLogs.length === 0
    ).length;

    // 4. Retrieve recent tables
    const recentTransactions = await prisma.paymentTransaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            title: true,
            owner: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        reconciliationLogs: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const recentSettlements = await prisma.settlementRecord.findMany({
      take: 10,
      orderBy: { settlementDate: "desc" }
    });

    const recentReconciliationLogs = await prisma.reconciliationLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        transaction: {
          select: {
            utrNumber: true,
            gatewayTransactionId: true
          }
        },
        invoice: {
          select: {
            invoiceNumber: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
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
    });
  } catch (error) {
    console.error("[FINANCE_DASHBOARD_GET] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
