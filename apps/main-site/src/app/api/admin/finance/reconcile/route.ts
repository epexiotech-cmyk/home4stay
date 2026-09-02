import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { SettlementTracker, ReconciliationEngine } from "@/lib/financial/financeService";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["super_admin"]);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "recordSettlement") {
      const { providerType, settlementReference, settlementDate, settlementAmount, currency, metadata } = body;

      if (!providerType || !settlementReference || !settlementDate || settlementAmount === undefined) {
        return NextResponse.json({ error: "Missing required settlement payload parameters" }, { status: 400 });
      }

      const settlement = await SettlementTracker.recordSettlement({
        providerType,
        settlementReference,
        settlementDate,
        settlementAmount: parseFloat(settlementAmount),
        currency,
        metadata
      });

      return NextResponse.json({
        success: true,
        message: "Settlement record tracked successfully",
        settlement
      });
    }

    if (action === "reconcile") {
      const { transactionId, receivedAmount, settlementRecordId } = body;

      if (!transactionId || receivedAmount === undefined) {
        return NextResponse.json({ error: "Missing required reconciliation engine parameters" }, { status: 400 });
      }

      const result = await ReconciliationEngine.reconcilePaymentWithSettlement(
        transactionId,
        parseFloat(receivedAmount),
        settlementRecordId
      );

      return NextResponse.json({
        success: true,
        message: `Reconciliation logged successfully with status: ${result.status}`,
        result
      });
    }

    return NextResponse.json({ error: "Invalid action specifier. Must be 'recordSettlement' or 'reconcile'." }, { status: 400 });
  } catch (error) {
    console.error("[FINANCE_RECONCILE_POST] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
