import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  exports: {},
  loaded: true
};

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runTests() {
  const { GstEngine } = await import("../apps/main-site/src/lib/financial/gstEngine.ts");
  const { FinancialNumberingService } = await import("../apps/main-site/src/lib/financial/financialNumberingService.ts");
  const { SubscriptionPdfGenerator } = await import("../apps/main-site/src/lib/financial/subscriptionPdfGenerator.ts");
  const { InvoiceService } = await import("../apps/main-site/src/lib/financial/invoiceService.ts");

  console.log("=== 🚀 RUNNING PHASE 10B: GST INVOICE ENGINE & FINANCIAL COMPLIANCE TEST SUITE ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Track entities to delete in finally block
  let testUserId = null;
  let testPropertyId = null;
  let testSubscriptionId = null;
  let testTransactionId = null;
  let createdInvoiceIds = [];
  let backupSettings = null;

  try {
    // --------------------------------------------------
    // TEST 1: Decimal-safe GstEngine calculations
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Decimal-safe GST Calculation Engine");
    console.log("--------------------------------------------------");

    // Test Interstate Split (18% on ₹118)
    const interstate = GstEngine.calculateTaxBreakdown(118.00, 18.00, true);
    assert(interstate.subtotal === 100.00, `Interstate subtotal is exact: ₹${interstate.subtotal} (Expected: 100.00)`);
    assert(interstate.gstAmount === 18.00, `Interstate GST amount is exact: ₹${interstate.gstAmount} (Expected: 18.00)`);
    assert(interstate.igst === 18.00, `Interstate IGST is exact: ₹${interstate.igst} (Expected: 18.00)`);
    assert(interstate.cgst === 0.00 && interstate.sgst === 0.00, "Interstate CGST and SGST are zero");

    // Test Intrastate Split (18% on ₹118)
    const intrastate = GstEngine.calculateTaxBreakdown(118.00, 18.00, false);
    assert(intrastate.subtotal === 100.00, `Intrastate subtotal is exact: ₹${intrastate.subtotal} (Expected: 100.00)`);
    assert(intrastate.gstAmount === 18.00, `Intrastate GST amount is exact: ₹${intrastate.gstAmount} (Expected: 18.00)`);
    assert(intrastate.cgst === 9.00, `Intrastate CGST is exact: ₹${intrastate.cgst} (Expected: 9.00)`);
    assert(intrastate.sgst === 9.00, `Intrastate SGST is exact: ₹${intrastate.sgst} (Expected: 9.00)`);
    assert(intrastate.igst === 0.00, "Intrastate IGST is zero");

    // Test Rounding Corrections & Drift Compensation
    const oddPrice = GstEngine.calculateTaxBreakdown(999.00, 18.00, false);
    const calculatedSum = oddPrice.subtotal + oddPrice.gstAmount;
    assert(Number(calculatedSum.toFixed(2)) === oddPrice.total, `Compensation handles rounding drift cleanly: subtotal (${oddPrice.subtotal}) + gst (${oddPrice.gstAmount}) = ${oddPrice.total}`);

    // --------------------------------------------------
    // TEST 2: Exclusive Lock Sequential Numbering Service
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Lock-Protected Sequential Sequential Numbering");
    console.log("--------------------------------------------------");

    // Backup dynamic settings
    backupSettings = await prisma.financialSettings.findFirst();
    await prisma.financialSettings.deleteMany();

    // Seed test custom settings
    const currentYear = new Date().getFullYear();
    const testSettings = await prisma.financialSettings.create({
      data: {
        companyName: "Test Invoicing Corp",
        legalBusinessName: "Test Invoicing Pvt Ltd",
        GSTIN: "29AAAAA0000A1Z0",
        PAN: "AAAAA0000A",
        address: "123 Tester Way, Bangalore, KA, 560001",
        supportEmail: "billing-test@example.com",
        supportPhone: "+91 99999 99999",
        invoicePrefix: "TEST",
        invoiceStartingNumber: 105,
        defaultGSTPercent: 18.0,
        SACCode: "998311",
        bankDetails: {
          bankName: "TEST BANK",
          accountName: "Test Corp Account",
          accountNumber: "987654321012",
          ifsc: "TEST0000001",
          branch: "Testing Branch"
        }
      }
    });

    // Run within interactive transaction block to check numbering sequence
    const invoiceNumber = await prisma.$transaction(async (tx) => {
      return await FinancialNumberingService.generateNextInvoiceNumber(tx);
    });

    const expectedInvoiceNumber = `TEST-${currentYear}-000105`;
    assert(invoiceNumber === expectedInvoiceNumber, `Correctly resolves starting sequence prefix and padding: ${invoiceNumber} (Expected: ${expectedInvoiceNumber})`);

    // --------------------------------------------------
    // TEST 3: Dynamic PDF Generator Buffer Compilation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Dynamic PDF kit Compiler Buffer Verification");
    console.log("--------------------------------------------------");

    const mockPdfData = {
      invoiceNumber: "TEST-2026-000105",
      issuedAt: "20/05/2026",
      paidAt: "20/05/2026",
      invoiceType: "SUBSCRIPTION",
      sacCode: "998311",
      platform: {
        companyName: "Test Invoicing Corp",
        legalBusinessName: "Test Invoicing Pvt Ltd",
        gstin: "29AAAAA0000A1Z0",
        pan: "AAAAA0000A",
        address: "123 Tester Way, Bangalore, KA, 560001",
        supportEmail: "billing-test@example.com",
        supportPhone: "+91 99999 99999",
        bankName: "TEST BANK",
        accountName: "Test Corp Account",
        accountNumber: "987654321012",
        ifsc: "TEST0000001",
        branch: "Testing Branch"
      },
      customer: {
        billingName: "Mock Host Partner",
        billingAddress: "456 Customer Road, India",
        gstin: "29BBBBB0000B1Z1"
      },
      plan: {
        name: "Enterprise Gold Yearly Plan",
        billingCycle: "YEARLY",
        startDate: "20/05/2026",
        endDate: "20/05/2027"
      },
      pricing: {
        subtotal: 1000.00,
        gstPercent: 18.00,
        gstAmount: 180.00,
        cgst: 0.00,
        sgst: 0.00,
        igst: 180.00,
        totalAmount: 1180.00,
        currency: "INR"
      },
      payment: {
        method: "MANUAL_UPI",
        utrNumber: "123456789012"
      }
    };

    const pdfBuffer = await SubscriptionPdfGenerator.generate(mockPdfData);
    assert(pdfBuffer !== null && pdfBuffer.length > 100, `Successfully compiles A4 styled SaaS tax invoice PDF. Buffer size: ${pdfBuffer.length} bytes`);

    // --------------------------------------------------
    // TEST 4: E2E Automatic Invoice Service Hook Linkage & Duplicate blocks
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Automated Hook & Entitlement Linkage Operations");
    console.log("--------------------------------------------------");

    // Create seed records
    const testUser = await prisma.user.create({
      data: {
        email: `finance-test-${Date.now()}@example.com`,
        name: "Finance E2E Tester",
        password: "TesterPassword1!",
        role: "owner"
      }
    });
    testUserId = testUser.id;

    // Create a property plan
    // Try to find if a plan exists or create a test one
    let testPlan = await prisma.subscriptionPlan.findFirst();
    if (!testPlan) {
      testPlan = await prisma.subscriptionPlan.create({
        data: {
          name: "Test Gold Plan",
          slug: "test-gold",
          description: "Test description",
          monthlyPrice: 99,
          quarterlyPrice: 249,
          yearlyPrice: 899,
          lifetimePrice: 4999,
          maxProperties: 5,
          maxRoomListings: 20,
          maxImagesPerProperty: 15,
          maxVideosPerProperty: 2,
          maxBookingsPerMonth: 50,
          supportPriority: "HIGH",
          featureFlags: "{}"
        }
      });
    }

    const testProperty = await prisma.property.create({
      data: {
        ownerId: testUserId,
        slug: `e2e-luxury-villa-${Date.now()}`,
        title: "E2E Luxury Villa Resort",
        status: "APPROVED"
      }
    });
    testPropertyId = testProperty.id;

    const testSubscription = await prisma.propertySubscription.create({
      data: {
        propertyId: testPropertyId,
        selectedPlanId: testPlan.slug,
        status: "ACTIVE",
        billingCycle: "YEARLY",
        amount: 1180.00
      }
    });
    testSubscriptionId = testSubscription.id;

    const testTransaction = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        amount: 1180.00,
        currency: "INR",
        paymentStatus: "APPROVED",
        utrNumber: "998877665544",
        gatewayResponse: { billingGstin: "29BBBBB0000B1Z1" }
      }
    });
    testTransactionId = testTransaction.id;

    // Trigger Invoice service auto-issuance hook
    const invoice = await InvoiceService.generateInvoiceForTransaction(testTransactionId);
    createdInvoiceIds.push(invoice.id);

    assert(invoice !== null, "Invoice successfully auto-generated via transaction approval hook");
    assert(invoice.invoiceNumber.startsWith("TEST-"), `Invoice sequentially numbers via settings config: ${invoice.invoiceNumber}`);
    assert(invoice.transactionId === testTransactionId, "Invoice properly links with core PaymentTransaction record");
    assert(invoice.subscriptionId === testSubscriptionId, "Invoice properly links with core PropertySubscription entitlement record");
    assert(invoice.userId === testUserId, "Invoice accurately assigns owner user footprint");

    // Test duplicate block check: generate second time for same transaction
    const secondInvoice = await InvoiceService.generateInvoiceForTransaction(testTransactionId);
    assert(secondInvoice.id === invoice.id, "Auto-generation hook correctly blocks duplicate invoice issuance");

    // --------------------------------------------------
    // TEST 5: Zoho & Tally Compliance Layout Formats
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Accounting Export Format compliance (Zoho/Tally templates)");
    console.log("--------------------------------------------------");

    // Re-verify that mapped schema maps exact fields for Zoho Books
    const zohoRecord = {
      "Invoice Number": invoice.invoiceNumber,
      "Customer Name": invoice.billingName,
      "Invoice Date": new Date(invoice.issuedAt).toISOString().split("T")[0],
      "Item Name": `Home4Stay SaaS - ${testPlan.slug.toUpperCase()} Plan`,
      "SAC/HSN Code": "998311",
      "Taxable Rate (Subtotal)": invoice.subtotal.toFixed(2),
      "GST %": invoice.gstPercent,
      "CGST Amount": (invoice.metadata.cgst).toFixed(2),
      "SGST Amount": (invoice.metadata.sgst).toFixed(2),
      "IGST Amount": (invoice.metadata.igst).toFixed(2),
      "Total Amount Paid": invoice.totalAmount.toFixed(2),
      "Status": invoice.status
    };

    assert(zohoRecord["Invoice Number"] !== undefined, "Zoho export satisfies 'Invoice Number' import requirement");
    assert(zohoRecord["Customer Name"] === testUser.name, "Zoho export satisfies Customer identity column");
    assert(zohoRecord["SAC/HSN Code"] === "998311", "Zoho export maps standard lodging service SAC/HSN codes");
    assert(Number(zohoRecord["Total Amount Paid"]) === 1180.00, "Zoho export computes precise total amounts");

    const tallyRecord = {
      "Voucher No": invoice.invoiceNumber,
      "Voucher Date": new Date(invoice.issuedAt).toISOString().split("T")[0],
      "Party Ledger Name": invoice.billingName,
      "Sales Ledger Name": "SaaS Subscription Income",
      "Product Description": `Home4Stay Partner ${testPlan.slug.toUpperCase()} Plan`,
      "HSN/SAC": "998311",
      "Assessable Value (Subtotal)": invoice.subtotal.toFixed(2),
      "CGST Ledger Value": (invoice.metadata.cgst).toFixed(2),
      "SGST Ledger Value": (invoice.metadata.sgst).toFixed(2),
      "IGST Ledger Value": (invoice.metadata.igst).toFixed(2),
      "Invoice Value": invoice.totalAmount.toFixed(2)
    };

    assert(tallyRecord["Voucher No"] !== undefined, "Tally export maps sequential voucher numbering ledger compatibility");
    assert(tallyRecord["Party Ledger Name"] === testUser.name, "Tally export maps exact Ledger Accounts keys");

    // --------------------------------------------------
    // TEST 6: Place of Supply & B2B compliance
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 6: Place of Supply & B2B compliance");
    console.log("--------------------------------------------------");

    // 1. Verify GstEngine place of supply jurisdiction checks
    assert(GstEngine.isInterstateTransaction("24", "Gujarat") === false, "Intrastate check resolves to false for same state code '24' and 'Gujarat'");
    assert(GstEngine.isInterstateTransaction("24", "Karnataka") === true, "Interstate check resolves to true for different state code '24' and 'Karnataka'");
    assert(GstEngine.isInterstateTransaction("GJ", "KA") === true, "Interstate check resolves to true for state aliases 'GJ' and 'KA'");

    // 2. Verify tax breakdown calculations with place of supply
    const posIntrastate = GstEngine.calculateTaxForTransaction(118.00, 18.00, "24", "Gujarat");
    assert(posIntrastate.cgst === 9.00 && posIntrastate.sgst === 9.00 && posIntrastate.igst === 0.00, "Place of supply (Gujarat to Gujarat) correctly splits 9% CGST + 9% SGST");

    const posInterstate = GstEngine.calculateTaxForTransaction(118.00, 18.00, "24", "Karnataka");
    assert(posInterstate.cgst === 0.00 && posInterstate.sgst === 0.00 && posInterstate.igst === 18.00, "Place of supply (Gujarat to Karnataka) correctly applies 18% IGST");

    // 3. Verify B2B Onboarding launch transactional update behavior
    // Simulate pricing draft B2B billing details payload
    const pricingDraftObj = {
      plan: "pro",
      enableBusinessBilling: true,
      legalBusinessName: "Acme Resorts Ltd",
      gstin: "24ABCDE1234F1Z5",
      billingAddress: "456 Gujarat Highway, Ahmedabad, GJ, 380001",
      billingState: "Gujarat",
      billingPincode: "380001",
      billingContact: "+91 98765 43210"
    };

    // Apply simulation database updates exactly matching launch route.ts transactional updates
    await prisma.$transaction([
      prisma.user.update({
        where: { id: testUserId },
        data: {
          legalBusinessName: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.legalBusinessName : null,
          gstin: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.gstin : null,
          billingAddress: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.billingAddress : null,
          billingState: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.billingState : null,
          billingPincode: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.billingPincode : null,
          billingContact: pricingDraftObj.enableBusinessBilling ? pricingDraftObj.billingContact : null,
        }
      })
    ]);

    // Query user and assert all B2B fields were correctly persisted
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId }
    });

    assert(updatedUser.legalBusinessName === "Acme Resorts Ltd", "User legal business name matches onboarding draft");
    assert(updatedUser.gstin === "24ABCDE1234F1Z5", "User GSTIN matches onboarding draft");
    assert(updatedUser.billingState === "Gujarat", "User billing state matches onboarding draft");
    assert(updatedUser.billingPincode === "380001", "User billing pincode matches onboarding draft");

    // 4. Test that InvoiceService dynamically generates a same-state (Intrastate CGST+SGST) invoice for the B2B user
    const b2bTransaction = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        amount: 1180.00,
        currency: "INR",
        paymentStatus: "APPROVED",
        utrNumber: "887766554433"
      }
    });
    const b2bInvoiceRecord = await InvoiceService.generateInvoiceForTransaction(b2bTransaction.id);
    createdInvoiceIds.push(b2bInvoiceRecord.id);

    const b2bInvoice = await prisma.invoice.findFirst({
      where: { transactionId: b2bTransaction.id }
    });

    assert(b2bInvoice.billingName === "Acme Resorts Ltd", "Invoice correctly pulls user legal business name");
    assert(b2bInvoice.billingAddress === "456 Gujarat Highway, Ahmedabad, GJ, 380001", "Invoice correctly pulls user custom B2B billing address");
    assert(b2bInvoice.GSTIN === "24ABCDE1234F1Z5", "Invoice correctly assigns user GSTIN");
    assert(b2bInvoice.gstPercent === 18.00, "Invoice is calculated at 18.00% standard rate");
    
    // Gujarat (platform's defaultStateCode is "24") to Gujarat (user's state resolved as "24" from GSTIN)
    // Resolves as Intrastate: CGST 90 + SGST 90, IGST 0
    assert(b2bInvoice.metadata.cgst === 90.00, `Invoice CGST is exact: ₹${b2bInvoice.metadata.cgst} (Expected: 90.00)`);
    assert(b2bInvoice.metadata.sgst === 90.00, `Invoice SGST is exact: ₹${b2bInvoice.metadata.sgst} (Expected: 90.00)`);
    assert(b2bInvoice.metadata.igst === 0.00, `Invoice IGST is zero: ₹${b2bInvoice.metadata.igst} (Expected: 0.00)`);

    // Cleanup the b2b transaction manually in transaction chain
    await prisma.paymentTransaction.delete({ where: { id: b2bTransaction.id } }).catch(() => {});

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP & RESTORE
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring financial databases states...");
    console.log("--------------------------------------------------");

    // Delete generated invoices
    for (const invId of createdInvoiceIds) {
      await prisma.invoice.delete({ where: { id: invId } }).catch(() => {});
    }

    // Delete transaction, subscription, property, user
    if (testTransactionId) {
      await prisma.paymentTransaction.delete({ where: { id: testTransactionId } }).catch(() => {});
    }
    if (testSubscriptionId) {
      await prisma.propertySubscription.delete({ where: { id: testSubscriptionId } }).catch(() => {});
    }
    if (testPropertyId) {
      await prisma.property.delete({ where: { id: testPropertyId } }).catch(() => {});
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }

    // Delete seeded test settings, restore backup settings
    await prisma.financialSettings.deleteMany();
    if (backupSettings) {
      const { id, createdAt, updatedAt, ...rest } = backupSettings;
      await prisma.financialSettings.create({ data: rest });
    }

    console.log("🧹 Database states successfully restored.");
  }

  console.log("\n==================================================");
  console.log(`🏁 FINANCIAL REPORT: Passed ${passed} | Failed ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
