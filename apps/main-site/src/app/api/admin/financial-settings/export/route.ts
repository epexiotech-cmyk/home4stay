import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Must be admin or super_admin)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    // 2. Fetch parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "zoho"; // 'zoho', 'tally', 'raw'
    const type = searchParams.get("type") || "csv"; // 'csv', 'json'
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Build filter
    const where: any = {};
    if (startDateParam || endDateParam) {
      where.createdAt = {};
      if (startDateParam) {
        where.createdAt.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        where.createdAt.lte = new Date(endDateParam);
      }
    }

    // 3. Query all invoices with related subscription details
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        user: true
      }
    });

    // 4. Map the invoice records to the requested format
    const formattedData = invoices.map(inv => {
      const meta = inv.metadata as any;
      const cgst = meta?.cgst || 0;
      const sgst = meta?.sgst || 0;
      const igst = meta?.igst || 0;

      const dateFormatted = inv.issuedAt
        ? new Date(inv.issuedAt).toISOString().split("T")[0]
        : new Date(inv.createdAt).toISOString().split("T")[0];

      const planName = inv.subscription?.selectedPlanId 
        ? inv.subscription.selectedPlanId.toUpperCase() 
        : "PARTNER PORTAL LICENSE";

      if (format === "zoho") {
        return {
          "Invoice Number": inv.invoiceNumber,
          "Customer Name": inv.billingName,
          "Invoice Date": dateFormatted,
          "Item Name": `Home4Stay SaaS - ${planName} Plan`,
          "SAC/HSN Code": "998311",
          "Taxable Rate (Subtotal)": inv.subtotal.toFixed(2),
          "GST %": inv.gstPercent,
          "CGST Amount": cgst.toFixed(2),
          "SGST Amount": sgst.toFixed(2),
          "IGST Amount": igst.toFixed(2),
          "Total Amount Paid": inv.totalAmount.toFixed(2),
          "Currency": inv.currency,
          "Payment Reference / UTR": meta?.utrNumber || "ADMIN_MANUAL",
          "Status": inv.status
        };
      } else if (format === "tally") {
        return {
          "Voucher No": inv.invoiceNumber,
          "Voucher Date": dateFormatted,
          "Party Ledger Name": inv.billingName,
          "Sales Ledger Name": "SaaS Subscription Income",
          "Product Description": `Home4Stay Partner ${planName} Plan`,
          "HSN/SAC": "998311",
          "Assessable Value (Subtotal)": inv.subtotal.toFixed(2),
          "CGST Ledger Value": cgst.toFixed(2),
          "SGST Ledger Value": sgst.toFixed(2),
          "IGST Ledger Value": igst.toFixed(2),
          "Invoice Value": inv.totalAmount.toFixed(2),
          "Voucher Status": inv.status
        };
      } else {
        // Raw dump
        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          userId: inv.userId,
          subscriptionId: inv.subscriptionId,
          transactionId: inv.transactionId,
          invoiceType: inv.invoiceType,
          status: inv.status,
          subtotal: inv.subtotal,
          gstPercent: inv.gstPercent,
          gstAmount: inv.gstAmount,
          cgst,
          sgst,
          igst,
          totalAmount: inv.totalAmount,
          currency: inv.currency,
          billingName: inv.billingName,
          billingAddress: inv.billingAddress,
          GSTIN: inv.GSTIN,
          utrNumber: meta?.utrNumber || "",
          issuedAt: inv.issuedAt,
          createdAt: inv.createdAt
        };
      }
    });

    // 5. Handle CSV formatting if CSV format is requested
    if (type === "csv") {
      if (formattedData.length === 0) {
        return new NextResponse("", {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="invoices-export-${format}.csv"`
          }
        });
      }

      const headers = Object.keys(formattedData[0]);
      const csvRows = [];
      csvRows.push(headers.join(","));

      for (const row of formattedData) {
        const values = headers.map(header => {
          const val = (row as any)[header];
          // Escape quotes and wrap commas in quotes
          const escaped = ("" + (val !== undefined && val !== null ? val : "")).replace(/"/g, '\\"');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");

      return new NextResponse(csvString, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="invoices-export-${format}-${dateFormattedFilename()}.csv"`,
          "Content-Length": Buffer.byteLength(csvString).toString()
        }
      });
    }

    // Default: JSON return
    return NextResponse.json({
      success: true,
      format,
      count: formattedData.length,
      data: formattedData
    });

  } catch (error: any) {
    console.error("[INVOICE_EXPORT_API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

function dateFormattedFilename() {
  const d = new Date();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`;
}
