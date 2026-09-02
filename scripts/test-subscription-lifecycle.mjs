import { PrismaClient, SubscriptionStatus, BillingCycle, PaymentStatus } from "@prisma/client";
import { SubscriptionLifecycleService } from "../apps/main-site/src/modules/payments/services/subscriptionLifecycle.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 6: SUBSCRIPTION LIFECYCLE & LIFE CYCLE AUTOMATION TEST SUITE ===\n");

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

  // Track created records to delete at the end
  const createdPlans = [];
  const createdSubscriptions = [];
  const createdTransactions = [];
  const createdAuditLogs = [];
  let originalPropertyStatus = null;
  let targetPropertyId = null;

  try {
    // --------------------------------------------------
    // BASE SETUP: Fetch or Create Required Seed Data
    // --------------------------------------------------
    const property = await prisma.property.findFirst({
      include: { owner: true }
    });

    if (!property) {
      throw new Error("No properties found in database. Please run the database seed first.");
    }
    
    targetPropertyId = property.id;
    originalPropertyStatus = property.status;
    
    console.log(`Using property: "${property.title}" (ID: ${targetPropertyId})`);
    console.log(`Property Owner: "${property.owner?.name || "Unknown"}" (Email: ${property.owner?.email || "N/A"})\n`);

    // Let's find or create a test subscription plan
    let plan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true }
    });

    if (!plan) {
      console.log("No active subscription plans found. Creating temporary test plan...");
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: "Test Gold Tier",
          slug: `test-gold-tier-${Date.now()}`,
          description: "Temporary plan for automation tests",
          isActive: true,
          displayOrder: 1,
          monthlyPrice: 999.00,
          quarterlyPrice: 2499.00,
          yearlyPrice: 8999.00,
          lifetimePrice: 19999.00
        }
      });
      createdPlans.push(plan.id);
    }

    // --------------------------------------------------
    // TEST 1: scanForRenewalDues (Expires in 5 days)
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Scan for Upcoming Renewal Dues (LTE 7 Days)");
    console.log("--------------------------------------------------");

    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const sub1 = await prisma.propertySubscription.create({
      data: {
        propertyId: targetPropertyId,
        selectedPlanId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        amount: 999.00,
        startsAt: now,
        expiresAt: fiveDaysFromNow
      }
    });
    createdSubscriptions.push(sub1.id);

    // Create a transaction to associate audit logs
    const tx1 = await prisma.paymentTransaction.create({
      data: {
        propertyId: targetPropertyId,
        subscriptionId: sub1.id,
        paymentStatus: PaymentStatus.APPROVED,
        amount: 999.00
      }
    });
    createdTransactions.push(tx1.id);

    const res1 = await SubscriptionLifecycleService.scanForRenewalDues();
    console.log(`Scan result: processed ${res1.processed} subscriptions.`);
    res1.logs.forEach(log => console.log(`  > ${log}`));

    // Assert transitions
    const updatedSub1 = await prisma.propertySubscription.findUnique({
      where: { id: sub1.id }
    });
    assert(updatedSub1.status === SubscriptionStatus.RENEWAL_DUE, "Subscription status transitioned to RENEWAL_DUE");

    const audit1 = await prisma.paymentAuditLog.findFirst({
      where: { transactionId: tx1.id, action: "RENEWAL_DUE_TRIGGERED" }
    });
    assert(audit1 !== null, "Audit log for RENEWAL_DUE_TRIGGERED created successfully");
    if (audit1) createdAuditLogs.push(audit1.id);

    // --------------------------------------------------
    // TEST 2: scanAndProcessExpiries (Expired 1 hour ago)
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Scan and Process Expired Subscriptions (Grace Period Entrance)");
    console.log("--------------------------------------------------");

    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    const sub2 = await prisma.propertySubscription.create({
      data: {
        propertyId: targetPropertyId,
        selectedPlanId: plan.id,
        status: SubscriptionStatus.RENEWAL_DUE,
        billingCycle: BillingCycle.MONTHLY,
        amount: 999.00,
        startsAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: oneHourAgo
      }
    });
    createdSubscriptions.push(sub2.id);

    const tx2 = await prisma.paymentTransaction.create({
      data: {
        propertyId: targetPropertyId,
        subscriptionId: sub2.id,
        paymentStatus: PaymentStatus.APPROVED,
        amount: 999.00
      }
    });
    createdTransactions.push(tx2.id);

    const res2 = await SubscriptionLifecycleService.scanAndProcessExpiries();
    console.log(`Scan result: processed ${res2.processed} subscriptions.`);
    res2.logs.forEach(log => console.log(`  > ${log}`));

    const updatedSub2 = await prisma.propertySubscription.findUnique({
      where: { id: sub2.id }
    });
    assert(updatedSub2.status === SubscriptionStatus.IN_GRACE_PERIOD, "Subscription status transitioned to IN_GRACE_PERIOD");

    const audit2 = await prisma.paymentAuditLog.findFirst({
      where: { transactionId: tx2.id, action: "GRACE_PERIOD_ENTERED" }
    });
    assert(audit2 !== null, "Audit log for GRACE_PERIOD_ENTERED created successfully");
    if (audit2) createdAuditLogs.push(audit2.id);

    // --------------------------------------------------
    // TEST 3: scanAndProcessGraceExpiries (Expired 8 days ago)
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Scan Grace Period Expiries (Complete Suspension Overdue)");
    console.log("--------------------------------------------------");

    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const sub3 = await prisma.propertySubscription.create({
      data: {
        propertyId: targetPropertyId,
        selectedPlanId: plan.id,
        status: SubscriptionStatus.IN_GRACE_PERIOD,
        billingCycle: BillingCycle.MONTHLY,
        amount: 999.00,
        startsAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        expiresAt: eightDaysAgo
      }
    });
    createdSubscriptions.push(sub3.id);

    const tx3 = await prisma.paymentTransaction.create({
      data: {
        propertyId: targetPropertyId,
        subscriptionId: sub3.id,
        paymentStatus: PaymentStatus.APPROVED,
        amount: 999.00
      }
    });
    createdTransactions.push(tx3.id);

    const res3 = await SubscriptionLifecycleService.scanAndProcessGraceExpiries();
    console.log(`Scan result: processed ${res3.processed} subscriptions.`);
    res3.logs.forEach(log => console.log(`  > ${log}`));

    const updatedSub3 = await prisma.propertySubscription.findUnique({
      where: { id: sub3.id }
    });
    assert(updatedSub3.status === SubscriptionStatus.SUSPENDED_OVERDUE, "Subscription status transitioned to SUSPENDED_OVERDUE");

    const updatedProp = await prisma.property.findUnique({
      where: { id: targetPropertyId }
    });
    assert(updatedProp.status === "SUSPENDED", "Associated property status changed to SUSPENDED online check");

    const audit3 = await prisma.paymentAuditLog.findFirst({
      where: { transactionId: tx3.id, action: "SUBSCRIPTION_EXPIRED_SUSPENDED" }
    });
    assert(audit3 !== null, "Audit log for SUBSCRIPTION_EXPIRED_SUSPENDED created successfully");
    if (audit3) createdAuditLogs.push(audit3.id);

    // Restore property status for subsequent runs
    await prisma.property.update({
      where: { id: targetPropertyId },
      data: { status: originalPropertyStatus }
    });

    // --------------------------------------------------
    // TEST 4: dispatchRenewalReminders & Deduplication Check
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Dispatch Renewal Reminders & Deduplication Guard");
    console.log("--------------------------------------------------");

    const sub4 = await prisma.propertySubscription.create({
      data: {
        propertyId: targetPropertyId,
        selectedPlanId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        amount: 999.00,
        startsAt: now,
        expiresAt: fiveDaysFromNow // 5 days remaining triggers "7_DAY" notice since it is <= 7 days
      }
    });
    createdSubscriptions.push(sub4.id);

    const tx4 = await prisma.paymentTransaction.create({
      data: {
        propertyId: targetPropertyId,
        subscriptionId: sub4.id,
        paymentStatus: PaymentStatus.APPROVED,
        amount: 999.00
      }
    });
    createdTransactions.push(tx4.id);

    // Initial Reminder Scan
    console.log("Running primary reminder dispatch scan...");
    const res4_1 = await SubscriptionLifecycleService.dispatchRenewalReminders();
    console.log(`Scan result: processed ${res4_1.processed} notifications.`);
    res4_1.logs.forEach(log => console.log(`  > ${log}`));

    // Assert that the reminder was sent
    const audit4_1 = await prisma.paymentAuditLog.findFirst({
      where: { transactionId: tx4.id, action: "RENEWAL_REMINDER_SENT" }
    });
    assert(audit4_1 !== null, "First renewal reminder log successfully stored");
    const meta = audit4_1?.metadata;
    assert(meta?.reminderType === "7_DAY", "Reminder category parsed as '7_DAY' matches daysRemaining <= 7 threshold");

    // Second Reminder Scan (Deduplication Check)
    console.log("\nRunning secondary reminder dispatch scan (expecting deduplication block)...");
    const res4_2 = await SubscriptionLifecycleService.dispatchRenewalReminders();
    console.log(`Scan result: processed ${res4_2.processed} notifications.`);
    
    const countReminders = await prisma.paymentAuditLog.count({
      where: { transactionId: tx4.id, action: "RENEWAL_REMINDER_SENT" }
    });
    assert(countReminders === 1, "Duplicate reminder block verified: exactly 1 audit log remains");

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP & STATE RESTORATION
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring original settings...");
    console.log("--------------------------------------------------");

    // Restore property status
    if (targetPropertyId && originalPropertyStatus) {
      await prisma.property.update({
        where: { id: targetPropertyId },
        data: { status: originalPropertyStatus }
      }).catch(() => {});
    }

    // Delete created audit logs
    for (const logId of createdAuditLogs) {
      await prisma.paymentAuditLog.delete({ where: { id: logId } }).catch(() => {});
    }

    // Delete created transactions
    for (const txId of createdTransactions) {
      await prisma.paymentAuditLog.deleteMany({ where: { transactionId: txId } }).catch(() => {});
      await prisma.paymentTransaction.delete({ where: { id: txId } }).catch(() => {});
    }

    // Delete created subscriptions
    for (const subId of createdSubscriptions) {
      await prisma.propertySubscription.delete({ where: { id: subId } }).catch(() => {});
    }

    // Delete created plans
    for (const planId of createdPlans) {
      await prisma.subscriptionPlan.delete({ where: { id: planId } }).catch(() => {});
    }

    console.log("🧹 Database sandbox states clean and restored.");
  }

  console.log("\n==================================================");
  console.log(`🏁 TEST REPORT: Passed ${passed} | Failed ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
