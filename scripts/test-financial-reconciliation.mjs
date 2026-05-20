import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  exports: {},
  loaded: true
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  const { SettlementTracker, ReconciliationEngine } = await import("../apps/main-site/src/lib/financial/financeService.ts");
  const { AccountingExportEngine } = await import("../apps/main-site/src/lib/financial/accountingExportService.ts");

  console.log("=== 🚀 RUNNING PHASE 10C: FINANCE RECONCILIATION & ACCOUNTING EXPORT TEST SUITE ===\n");

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

  // Entities tracker for complete cleanup
  let testUserId = null;
  let testPropertyId = null;
  let testPlanSlug = null;
  let testSubscriptionId = null;
  let testTransactionIds = [];
  let testSettlementIds = [];
  let testInvoiceIds = [];
  let testReconLogIds = [];

  try {
    // Setup test records
    console.log("Setting up mock database parameters...");

    // 1. User
    const user = await prisma.user.create({
      data: {
        email: `recon-test-${Date.now()}@example.com`,
        name: "Reconciliation Test User",
        password: "TesterPassword1!",
        role: "partner"
      }
    });
    testUserId = user.id;

    // 2. Property
    const property = await prisma.property.create({
      data: {
        title: "Test Reconciliation Luxury Villa",
        slug: `recon-test-villa-${Date.now()}`,
        ownerId: testUserId,
        status: "APPROVED"
      }
    });
    testPropertyId = property.id;

    // 3. Subscription Plan
    let plan = await prisma.subscriptionPlan.findFirst({
      where: { slug: "test-reconcile-plan" }
    });
    if (!plan) {
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: "Test Reconcile Gold Plan",
          slug: "test-reconcile-plan",
          description: "Test gold plan for reconciliation verification",
          monthlyPrice: 9999,
          quarterlyPrice: 28000,
          yearlyPrice: 99999,
          lifetimePrice: 499999,
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
    testPlanSlug = plan.slug;

    // 4. Subscription
    const subscription = await prisma.propertySubscription.create({
      data: {
        propertyId: testPropertyId,
        selectedPlanId: testPlanSlug,
        amount: 9999.00,
        billingCycle: "MONTHLY",
        status: "ACTIVE"
      }
    });
    testSubscriptionId = subscription.id;

    // 5. Invoices
    const invoice1 = await prisma.invoice.create({
      data: {
        invoiceNumber: `RECON-INV-1-${Date.now()}`,
        userId: testUserId,
        subscriptionId: testSubscriptionId,
        invoiceType: "SUBSCRIPTION",
        status: "ISSUED",
        subtotal: 8473.73,
        gstPercent: 18.0,
        gstAmount: 1525.27,
        totalAmount: 9999.00,
        billingName: "Reconciliation Test Corp",
        billingAddress: "456 Gateway Boulevard, Goa",
        issuedAt: new Date(),
        paidAt: new Date(),
        metadata: {
          cgst: 762.64,
          sgst: 762.63,
          igst: 0.00,
          planName: "Reconciliation Premium Plan"
        }
      }
    });
    testInvoiceIds.push(invoice1.id);

    // 6. Payment Transaction for invoice1
    const tx1 = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        paymentStatus: "APPROVED",
        amount: 9999.00,
        utrNumber: `RECONUTR123_${Date.now()}`,
        gatewayTransactionId: `PG_TX_123_${Date.now()}`,
        gatewayOrderId: `PG_ORDER_123_${Date.now()}`,
        paidAt: new Date()
      }
    });
    testTransactionIds.push(tx1.id);

    // Relate transaction1 to invoice1
    await prisma.invoice.update({
      where: { id: invoice1.id },
      data: { transactionId: tx1.id }
    });

    console.log("Database mock environment successfully seeded.\n");

    // --------------------------------------------------
    // TEST 1: Settlement record creation & idempotency
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Dynamic Gateway Settlement Tracking");
    console.log("--------------------------------------------------");

    const settlementRef = `SETTLE_REF_${Date.now()}`;
    const dateStr = new Date().toISOString();

    const settlement1 = await SettlementTracker.recordSettlement({
      providerType: "PHONEPE",
      settlementReference: settlementRef,
      settlementDate: dateStr,
      settlementAmount: 9999.00,
      currency: "INR",
      metadata: { gatewayBatchId: "BATCH-100" }
    });
    testSettlementIds.push(settlement1.id);

    assert(settlement1.id !== undefined, "Recorded settlement record successfully.");
    assert(settlement1.settlementAmount === 9999.00, `Amount correct: ₹${settlement1.settlementAmount}`);
    assert(settlement1.status === "PENDING", "Default status is correctly set to 'PENDING'.");

    // Verify Idempotency - updating same reference shouldn't create new rows, just update existing details
    const settlement2 = await SettlementTracker.recordSettlement({
      providerType: "PHONEPE",
      settlementReference: settlementRef,
      settlementDate: dateStr,
      settlementAmount: 9999.00,
      currency: "INR",
      metadata: { gatewayBatchId: "BATCH-100", updated: true }
    });

    assert(settlement2.id === settlement1.id, "Resolves duplicate reference writes idempotently by updating existing row.");
    assert(settlement2.metadata.updated === true, "Successfully updated existing settlement metadata.");


    // --------------------------------------------------
    // TEST 2: Exact Match Reconciliation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Exact Transaction Matching Engine");
    console.log("--------------------------------------------------");

    const recon1 = await ReconciliationEngine.reconcilePaymentWithSettlement(
      tx1.id,
      9999.00, // exact match
      settlement1.id
    );
    testReconLogIds.push(recon1.log.id);

    assert(recon1.status === "MATCHED", `Reconciliation resolves exact match: Status = ${recon1.status}`);
    assert(recon1.mismatchAmount === 0.00, "Mismatch amount is calculated as exact 0.00");
    assert(recon1.log.invoiceId === invoice1.id, "Successfully linked reconciliation log to associated Invoice ID.");

    // Verify settlement status was updated to MATCHED
    const updatedSettle = await prisma.settlementRecord.findUnique({ where: { id: settlement1.id } });
    assert(updatedSettle.status === "MATCHED", `Settlement record status updated to: ${updatedSettle.status}`);

    // Verify Idempotency: Running reconciliation on MATCHED transaction again returns same log
    const recon1Retry = await ReconciliationEngine.reconcilePaymentWithSettlement(tx1.id, 9999.00, settlement1.id);
    assert(recon1Retry.log.id === recon1.log.id, "Idempotently resolves retried matches without logging double entries.");


    // --------------------------------------------------
    // TEST 3: Discrepancy Mismatch Reconciliation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: High-Precision Discrepancy Flagging");
    console.log("--------------------------------------------------");

    // Seed transaction 2 for discrepancy
    const tx2 = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        paymentStatus: "APPROVED",
        amount: 9999.00,
        utrNumber: `RECONUTR456_${Date.now()}`,
        gatewayTransactionId: `PG_TX_456_${Date.now()}`,
        gatewayOrderId: `PG_ORDER_456_${Date.now()}`,
        paidAt: new Date()
      }
    });
    testTransactionIds.push(tx2.id);

    const recon2 = await ReconciliationEngine.reconcilePaymentWithSettlement(
      tx2.id,
      9950.00 // Underpaid by 49.00
    );
    testReconLogIds.push(recon2.log.id);

    assert(recon2.status === "MISMATCH", `Underpayment correctly triggers status MISMATCH: Status = ${recon2.status}`);
    assert(recon2.mismatchAmount === 49.00, `Successfully calculated mismatch discrepancy: ₹${recon2.mismatchAmount} (Expected: 49.00)`);
    assert(recon2.log.metadata.mismatchDirection === "UNDERPAID", `Identified discrepancy direction as: ${recon2.log.metadata.mismatchDirection}`);


    // --------------------------------------------------
    // TEST 4: Duplicate UTR Replay Risk Detection
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: UTR Replay Attack Risk Identification");
    console.log("--------------------------------------------------");

    const sharedUTR = `DUP_UTR_${Date.now()}`;

    // Seed Tx A
    const txA = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        paymentStatus: "APPROVED",
        amount: 1000.00,
        utrNumber: sharedUTR,
        paidAt: new Date()
      }
    });
    testTransactionIds.push(txA.id);

    // Seed Tx B with identical UTR representing replay risk
    const txB = await prisma.paymentTransaction.create({
      data: {
        propertyId: testPropertyId,
        subscriptionId: testSubscriptionId,
        paymentStatus: "APPROVED",
        amount: 1000.00,
        utrNumber: sharedUTR,
        paidAt: new Date()
      }
    });
    testTransactionIds.push(txB.id);

    // Reconcile Tx B (which should check for duplicate UTR of Tx A)
    const reconB = await ReconciliationEngine.reconcilePaymentWithSettlement(txB.id, 1000.00);
    testReconLogIds.push(reconB.log.id);

    assert(reconB.status === "MISMATCH", "Flagged duplicate UTR payment transaction as MISMATCH.");
    assert(reconB.log.metadata.hasDuplicateRisk === true, "Correctly set duplicate UTR risk flag in metadata.");
    assert(reconB.log.notes.includes("[CRITICAL WARNING]: Duplicate UTR detected"), "Successfully logged detailed security replay warnings into reconciliation audit trail.");


    // --------------------------------------------------
    // TEST 5: CSV Compilation & Standardized Exports
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Accountant CSV Format Integration Builders");
    console.log("--------------------------------------------------");

    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Zoho Books Export Check
    const zohoCsv = await AccountingExportEngine.exportInvoicesToZoho(start, end);
    assert(zohoCsv.includes('"Invoice Number","Customer Name"'), "Generated Zoho Books CSV headers accurately.");
    assert(zohoCsv.includes('"998311"'), "Emitted lodging Services SAC Code (998311) inside Zoho records.");

    // Tally ERP Export Check
    const tallyCsv = await AccountingExportEngine.exportInvoicesToTally(start, end);
    assert(tallyCsv.includes('"Voucher No","Voucher Date"'), "Generated Tally ERP Voucher CSV headers accurately.");
    assert(tallyCsv.includes('"SaaS Subscription Income"'), "Mapped SaaS Income target ledger correct in Tally voucher.");

    // General Invoice Export Check
    const invoiceCsv = await AccountingExportEngine.exportInvoicesToCSV(start, end);
    assert(invoiceCsv.includes('"Invoice ID","Invoice Number"'), "Generated General Invoice CSV headers accurately.");

    // Reconciliation Audit Logs Export Check
    const reconCsv = await AccountingExportEngine.exportReconciliationLogsToCSV(start, end);
    assert(reconCsv.includes('"Reconciliation Log ID","Transaction ID"'), "Generated Reconciliation Logs Auditor spreadsheet successfully.");

    // Dynamic Monthly GST aggregates summary check
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const gstSummary = await AccountingExportEngine.getMonthGstSummary(currentYear, currentMonth);

    assert(gstSummary.invoiceCount >= 1, `Calculated monthly invoices correct: Count = ${gstSummary.invoiceCount}`);
    assert(gstSummary.totalCGST > 0, `Aggregated CGST liabilities successfully: ₹${gstSummary.totalCGST}`);
    assert(gstSummary.totalSGST > 0, `Aggregated SGST liabilities successfully: ₹${gstSummary.totalSGST}`);
    assert(gstSummary.totalGross > 0, `Aggregated total collection gross successfully: ₹${gstSummary.totalGross}`);

  } catch (error) {
    console.error(" ❌ TEST SUITE RUNTIME FATAL ERROR:", error);
    failed++;
  } finally {
    // Complete cascading cleanup to leave PostgreSQL pristine
    console.log("\n--------------------------------------------------");
    console.log("CLEANUP: Cleaning up database mock allocations...");
    console.log("--------------------------------------------------");

    try {
      if (testReconLogIds.length > 0) {
        await prisma.reconciliationLog.deleteMany({ where: { id: { in: testReconLogIds } } });
        console.log(`Deleted ${testReconLogIds.length} ReconciliationLogs.`);
      }
      if (testInvoiceIds.length > 0) {
        await prisma.invoice.deleteMany({ where: { id: { in: testInvoiceIds } } });
        console.log(`Deleted ${testInvoiceIds.length} Invoices.`);
      }
      if (testTransactionIds.length > 0) {
        await prisma.paymentTransaction.deleteMany({ where: { id: { in: testTransactionIds } } });
        console.log(`Deleted ${testTransactionIds.length} PaymentTransactions.`);
      }
      if (testSettlementIds.length > 0) {
        await prisma.settlementRecord.deleteMany({ where: { id: { in: testSettlementIds } } });
        console.log(`Deleted ${testSettlementIds.length} SettlementRecords.`);
      }
      if (testSubscriptionId) {
        await prisma.propertySubscription.delete({ where: { id: testSubscriptionId } });
        console.log("Deleted PropertySubscription.");
      }
      if (testPropertyId) {
        await prisma.property.delete({ where: { id: testPropertyId } });
        console.log("Deleted Property.");
      }
      if (testUserId) {
        await prisma.user.delete({ where: { id: testUserId } });
        console.log("Deleted User.");
      }
      console.log("Database pristine restoration complete.");
    } catch (cleanErr) {
      console.error("Warning: Failed to clean up seeded parameters cleanly:", cleanErr);
    }

    console.log("\n==================================================");
    console.log(`📊 EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
