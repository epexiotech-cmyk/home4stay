import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { resolveStateName } from "@/lib/financial/taxValidator";

/**
 * GET: Retrieve active financial settings
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    let settings = await prisma.financialSettings.findFirst();
    if (!settings) {
      // Bootstrap dynamic default settings if none exist - Default to Gujarat (24)
      settings = await prisma.financialSettings.create({
        data: {
          companyName: "Home4Stay India",
          legalBusinessName: "Home4Stay Technologies Private Limited",
          GSTIN: "24ABCDE1234F1Z5",
          PAN: "ABCDE1234F",
          address: "G-42 Corporate Plaza, S.G. Highway, Ahmedabad, GJ, 380054",
          supportEmail: "finance@home4stay.com",
          supportPhone: "+91 79 4912 3456",
          invoicePrefix: "H4S",
          invoiceStartingNumber: 1,
          defaultGSTPercent: 18.0,
          SACCode: "998311",
          bankDetails: {
            bankName: "YES BANK",
            accountName: "Home4Stay Technologies Pvt Ltd",
            accountNumber: "123456789012345",
            ifsc: "YESB0000123",
            branch: "S.G. Highway"
          },
          defaultStateCode: "24",
          placeOfSupplyMode: "STATE_MATCH",
          enableGSTSplitting: true,
          enableIGST: true,
          invoiceTerms: "1. All fees are exclusive of applicable Indian taxes (GST).\n2. Subscriptions are billed monthly in advance.",
          refundTerms: "1. Refund requests must be submitted within 7 business days.\n2. Approved refunds will be credited back via original source within 5-7 working days.",
          SLAUptimeTarget: 99.9,
          SLAMaintenanceWindow: "Sunday 02:00 AM - 04:00 AM IST",
          liabilityCapMonths: 6,
          dataRetentionDays: 365
        }
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("[FINANCIAL_SETTINGS_GET] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Create or Update financial settings
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      legalBusinessName,
      GSTIN,
      PAN,
      address,
      supportEmail,
      supportPhone,
      invoicePrefix,
      invoiceStartingNumber,
      defaultGSTPercent,
      SACCode,
      bankDetails,
      defaultStateCode,
      placeOfSupplyMode,
      enableGSTSplitting,
      enableIGST,
      invoiceTerms,
      refundTerms,
      SLAUptimeTarget,
      SLAMaintenanceWindow,
      liabilityCapMonths,
      dataRetentionDays
    } = body;

    // Validation checks
    if (
      !companyName ||
      !legalBusinessName ||
      !GSTIN ||
      !PAN ||
      !address ||
      !supportEmail ||
      !supportPhone ||
      !invoicePrefix ||
      !invoiceStartingNumber ||
      defaultGSTPercent === undefined ||
      !SACCode ||
      !bankDetails
    ) {
      return NextResponse.json({ error: "Missing required financial configurations" }, { status: 400 });
    }

    // Validate GSTIN regex (15 digits typical Indian format)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(GSTIN)) {
      return NextResponse.json({ error: "Invalid GSTIN format. Typical format is 24ABCDE1234F1Z5" }, { status: 400 });
    }

    // Validate State Code matches GSTIN Prefix
    const gstinPrefix = GSTIN.substring(0, 2);
    if (defaultStateCode && defaultStateCode !== gstinPrefix) {
      return NextResponse.json({
        error: `State Code '${defaultStateCode}' must match the first two digits of your GSTIN '${gstinPrefix}'`
      }, { status: 400 });
    }

    // Verify state code is valid in India
    const stateName = resolveStateName(gstinPrefix);
    if (!stateName) {
      return NextResponse.json({ error: `Invalid State Code prefix '${gstinPrefix}' in GSTIN` }, { status: 400 });
    }

    // Validate PAN regex (10 characters)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(PAN)) {
      return NextResponse.json({ error: "Invalid PAN format. Typical format is ABCDE1234F" }, { status: 400 });
    }

    // Validate bank details structure
    const { bankName, accountName, accountNumber, ifsc, branch } = bankDetails;
    if (!bankName || !accountName || !accountNumber || !ifsc || !branch) {
      return NextResponse.json({ error: "Bank account details structure must be complete" }, { status: 400 });
    }

    // Check if starting number is valid
    const startingNum = parseInt(invoiceStartingNumber, 10);
    if (isNaN(startingNum) || startingNum < 1) {
      return NextResponse.json({ error: "Invoice starting number must be a valid positive integer" }, { status: 400 });
    }

    const gstPercent = parseFloat(defaultGSTPercent);
    if (isNaN(gstPercent) || gstPercent < 0 || gstPercent > 100) {
      return NextResponse.json({ error: "Default GST percentage must be between 0 and 100" }, { status: 400 });
    }

    const slaUptime = SLAUptimeTarget !== undefined && SLAUptimeTarget !== "" ? parseFloat(SLAUptimeTarget) : null;
    const lCapMonths = liabilityCapMonths !== undefined && liabilityCapMonths !== "" ? parseInt(liabilityCapMonths, 10) : null;
    const dRetDays = dataRetentionDays !== undefined && dataRetentionDays !== "" ? parseInt(dataRetentionDays, 10) : null;

    const dataToSave = {
      companyName,
      legalBusinessName,
      GSTIN,
      PAN,
      address,
      supportEmail,
      supportPhone,
      invoicePrefix,
      invoiceStartingNumber: startingNum,
      defaultGSTPercent: gstPercent,
      SACCode,
      bankDetails: {
        bankName,
        accountName,
        accountNumber,
        ifsc,
        branch
      },
      defaultStateCode: defaultStateCode || gstinPrefix,
      placeOfSupplyMode: placeOfSupplyMode || "STATE_MATCH",
      enableGSTSplitting: enableGSTSplitting !== undefined ? Boolean(enableGSTSplitting) : true,
      enableIGST: enableIGST !== undefined ? Boolean(enableIGST) : true,
      invoiceTerms: invoiceTerms || null,
      refundTerms: refundTerms || null,
      SLAUptimeTarget: slaUptime,
      SLAMaintenanceWindow: SLAMaintenanceWindow || null,
      liabilityCapMonths: lCapMonths,
      dataRetentionDays: dRetDays
    };

    // Find and update, or create
    let settings = await prisma.financialSettings.findFirst();
    if (settings) {
      settings = await prisma.financialSettings.update({
        where: { id: settings.id },
        data: dataToSave
      });
    } else {
      settings = await prisma.financialSettings.create({
        data: dataToSave
      });
    }

    return NextResponse.json({
      success: true,
      message: "Financial configurations updated successfully",
      settings
    });
  } catch (error: any) {
    console.error("[FINANCIAL_SETTINGS_POST] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
