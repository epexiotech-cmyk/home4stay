import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { AccountingExportEngine } from "@/lib/financial/accountingExportService";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["super_admin"]);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "general";
    const startStr = searchParams.get("startDate");
    const endStr = searchParams.get("endDate");

    let startDate = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let endDate = endStr ? new Date(endStr) : new Date();

    // Reset times to cover full days
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let csvContent = "";
    let fileName = `home4stay_finance_${format}_export.csv`;

    switch (format) {
      case "general":
        csvContent = await AccountingExportEngine.exportInvoicesToCSV(startDate, endDate);
        fileName = `home4stay_invoices_general_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
        break;
      case "zoho":
        csvContent = await AccountingExportEngine.exportInvoicesToZoho(startDate, endDate);
        fileName = `home4stay_zoho_books_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
        break;
      case "tally":
        csvContent = await AccountingExportEngine.exportInvoicesToTally(startDate, endDate);
        fileName = `home4stay_tally_erp_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
        break;
      case "payments":
        csvContent = await AccountingExportEngine.exportPaymentsToCSV(startDate, endDate);
        fileName = `home4stay_payment_ledger_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
        break;
      case "recon":
        csvContent = await AccountingExportEngine.exportReconciliationLogsToCSV(startDate, endDate);
        fileName = `home4stay_reconciliation_audit_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
        break;
      default:
        return NextResponse.json({ error: `Unsupported export format: ${format}. Must be one of: general, zoho, tally, payments, recon` }, { status: 400 });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error("[FINANCE_EXPORT_GET] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
