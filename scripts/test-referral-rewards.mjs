import { createRequire } from "module";
const require = createRequire(import.meta.url);
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  exports: {},
  loaded: true
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 11: REFERRAL CREDITS, REWARDS & DISCOUNT ENGINE TEST SUITE ===\n");

  const { ReferralService } = await import("../apps/main-site/src/lib/referral/referralService.ts");
  const { GstEngine } = await import("../apps/main-site/src/lib/financial/gstEngine.ts");
  const { InvoiceService } = await import("../apps/main-site/src/lib/financial/invoiceService.ts");

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

  // Tracking database seeds for absolute cleanup hygiene
  let referrerId = null;
  let referredId = null;
  let fraudReferredId = null;
  let testPlanId = null;
  let subscriptionId = null;
  let transactionId = null;
  let invoiceId = null;
  const createdInvoiceIds = [];

  try {
    // Setup - Create distinct test plans and users
    console.log("Setting up mock database test seeds...");

    // 1. Plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: "Test Referral Plan",
        slug: `referral-test-plan-${Date.now()}`,
        description: "referral pricing integration sandbox",
        monthlyPrice: 1000,
        quarterlyPrice: 2800,
        yearlyPrice: 10000,
        lifetimePrice: 40000,
        maxProperties: 5,
        isActive: true,
      }
    });
    testPlanId = plan.id;

    // 2. Referrer Host
    const referrerUser = await prisma.user.create({
      data: {
        name: "Referrer Test Host",
        email: `referrer-${Date.now()}@home4stay.com`,
        phone: `9199990001`,
        gstin: "24AAAAA0000A1Z0", // Gujarat state code (24)
        role: "owner",
        password: "hashed_dummy_password"
      }
    });
    referrerId = referrerUser.id;

    // Initialize Referral Profile for referrer
    const referrerProfile = await ReferralService.getOrCreateProfile(referrerId);
    assert(referrerProfile !== null, "Referral profile bootstrapped and generated successfully");
    assert(referrerProfile.referralCode.startsWith("H4S-"), `Referral code format starts with H4S prefix: ${referrerProfile.referralCode}`);

    // 3. Referred Host (Valid conversion target)
    const referredUser = await prisma.user.create({
      data: {
        name: "Referred Test Host",
        email: `referred-valid-${Date.now()}@home4stay.com`,
        phone: `9199990002`,
        gstin: "24BBBBB1111B1Z1",
        role: "owner",
        password: "hashed_dummy_password"
      }
    });
    referredId = referredUser.id;

    // 4. Fraud Candidate Host (Duplicate Phone & GSTIN)
    const fraudUser = await prisma.user.create({
      data: {
        name: "Fraud Suspect Host",
        email: `referred-fraud-${Date.now()}@home4stay.com`,
        phone: `9199990001`, // Same phone as Referrer
        gstin: "24AAAAA0000A1Z0", // Same GSTIN as Referrer
        role: "owner",
        password: "hashed_dummy_password"
      }
    });
    fraudReferredId = fraudUser.id;


    // ==================================================
    // TEST 1: Self-Referral Block
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 1: Self-Referral Prevention Logic");
    console.log("--------------------------------------------------");

    const selfReferral = await ReferralService.bindReferral({
      referredUserId: referrerId,
      referralCode: referrerProfile.referralCode
    });

    assert(selfReferral.success === false, "Self-referral attempt is successfully blocked");
    assert(selfReferral.message.includes("You cannot refer yourself"), "Correct failure error message returned");


    // ==================================================
    // TEST 2: Onboarding Bind & Fraud/Abuse Detection
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Onboarding Bind & Fraud Detection");
    console.log("--------------------------------------------------");

    // Fraud Bind
    const fraudBind = await ReferralService.bindReferral({
      referredUserId: fraudReferredId,
      referralCode: referrerProfile.referralCode
    });

    assert(fraudBind.success === true, "Onboarding bind executed with warning status");
    assert(fraudBind.isFraudFlagged === true, "Fraud binding triggers isFraudFlagged state successfully");
    assert(fraudBind.referralEvent.status === "FRAUD_FLAGGED", "Database stores fraud binding with FRAUD_FLAGGED status");
    assert(fraudBind.referralEvent.metadata.fraudReasons.includes("Matching phone numbers"), "Audit reasons detail matching phone numbers");
    assert(fraudBind.referralEvent.metadata.fraudReasons.includes("Matching GSTINs"), "Audit reasons detail matching GSTINs");

    // Valid Bind
    const validBind = await ReferralService.bindReferral({
      referredUserId: referredId,
      referralCode: referrerProfile.referralCode,
      registrationIp: "192.168.1.50"
    });

    assert(validBind.success === true, "Valid onboarding bind executed successfully");
    assert(validBind.isFraudFlagged === false, "Valid binding is not flagged for abuse");
    assert(validBind.referralEvent.status === "PENDING", "Database stores valid binding with PENDING status");

    // Check Referrer profile pending credits increments
    const referrerProfileAfterBind = await prisma.referralProfile.findUnique({
      where: { userId: referrerId }
    });
    assert(referrerProfileAfterBind.pendingCredits === 1, "Referrer pending credits balance incremented by 1");


    // ==================================================
    // TEST 3: Super-Admin Fraud Override Review
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Super-Admin Fraud Override Reviews");
    console.log("--------------------------------------------------");

    // Admin approves the fraud candidate
    const adminApproval = await ReferralService.reviewFraudFlag({
      eventId: fraudBind.referralEvent.id,
      action: "APPROVE",
      adminUserId: referrerId, // Mocking admin using referrerId for simplicity
      notes: "Valid team setup verified via calls."
    });

    assert(adminApproval.status === "PENDING", "Fraud-flagged referral event status transitioned to PENDING on approval");
    
    const referrerProfileAfterApproval = await prisma.referralProfile.findUnique({
      where: { userId: referrerId }
    });
    assert(referrerProfileAfterApproval.pendingCredits === 2, "Referrer pending credits incremented upon admin approval of flagged event");


    // ==================================================
    // TEST 4: Credit Awarding on Subscription Activation
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Credit Awarding on Subscription Activation");
    console.log("--------------------------------------------------");

    // Setup Mock property, subscription, and transaction for valid referred user
    const property = await prisma.property.create({
      data: {
        title: "Referred Property Mock",
        ownerId: referredId,
        slug: `referred-mock-${Date.now()}`
      }
    });

    const subscription = await prisma.propertySubscription.create({
      data: {
        propertyId: property.id,
        selectedPlanId: testPlanId,
        billingCycle: "YEARLY",
        status: "PENDING_PAYMENT",
        amount: 10000
      }
    });
    subscriptionId = subscription.id;

    // Trigger credit awarding
    const awardResult = await ReferralService.awardReferralCredit(referredId, subscriptionId);
    assert(awardResult.success === true, "Active credit successfully awarded on subscription activation");
    assert(awardResult.updatedEvent.status === "QUALIFIED", "ReferralEvent transitioned to QUALIFIED");
    
    // Check balances
    const referrerProfileAfterAward = await prisma.referralProfile.findUnique({
      where: { userId: referrerId }
    });
    assert(referrerProfileAfterAward.pendingCredits === 1, "Referrer pending credits decremented to 1");
    assert(referrerProfileAfterAward.totalCredits === 1, "Referrer active balance incremented to 1");
    assert(referrerProfileAfterAward.lifetimeCredits === 1, "Referrer lifetime balance incremented to 1");

    // Verify ledger
    const ledgerLogs = await prisma.referralCreditLedger.findFirst({
      where: { userId: referrerId, eventType: "REFERRAL_CONVERSION" }
    });
    assert(ledgerLogs !== null, "Immutable ledger conversion entry logged");
    assert(ledgerLogs.credits === 1, "Ledger logs positive balance adjustment (+1)");
    assert(ledgerLogs.balanceAfter === 1, "Ledger records correct audited balanceAfter (1)");


    // ==================================================
    // TEST 5: Reward Tiers & Discount Resolution
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Reward Milestone Resolution Calculations");
    console.log("--------------------------------------------------");

    // Sub-test 5.1: Insufficient Credits
    const checkLow = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "YEARLY",
      baseAmount: 10000
    });
    assert(checkLow.discountAmount === 0 && checkLow.creditsToUse === 0, "No discount applied when active credits are below yearly plan tiers (requires >= 6)");

    // Manually increment referrer's credits to 10 for testing different tiers
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 10 }
    });

    // Sub-test 5.2: Yearly Tiers
    const checkYearly6 = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "YEARLY",
      baseAmount: 10000
    });
    // With 10 credits, they qualify for 100% off (10 credits) rather than 50% (6 credits)
    assert(checkYearly6.discountPercentage === 1.0, "Yearly: 10 credits awards 100% discount (Free Year)");
    assert(checkYearly6.creditsToUse === 10, "Yearly: 10 credits are consumed");

    // Set credits to exactly 6 for 50% test
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 6 }
    });

    const checkYearly50 = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "YEARLY",
      baseAmount: 10000
    });
    assert(checkYearly50.discountPercentage === 0.5, "Yearly: Exactly 6 credits awards 50% discount");
    assert(checkYearly50.creditsToUse === 6, "Yearly: Exactly 6 credits are consumed");

    // Sub-test 5.3: Half-Yearly Tiers
    // Set credits back to 10
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 10 }
    });

    const checkHalf10 = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "HALF_YEARLY",
      baseAmount: 5000
    });
    assert(checkHalf10.discountPercentage === 1.0, "Half-Yearly: 10 credits awards 100% discount");
    assert(checkHalf10.creditsToUse === 10, "Half-Yearly: 10 credits are consumed");

    // Set credits to 6
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 6 }
    });
    const checkHalf6 = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "HALF_YEARLY",
      baseAmount: 5000
    });
    assert(checkHalf6.discountPercentage === 1.0, "Half-Yearly: 6 credits awards 100% discount");
    assert(checkHalf6.creditsToUse === 6, "Half-Yearly: 6 credits are consumed");

    // Set credits to 4
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 4 }
    });
    const checkHalf4 = await ReferralService.calculateDiscount({
      userId: referrerId,
      billingCycle: "HALF_YEARLY",
      baseAmount: 5000
    });
    assert(checkHalf4.discountPercentage === 0.5, "Half-Yearly: 4 credits awards 50% discount");
    assert(checkHalf4.creditsToUse === 4, "Half-Yearly: 4 credits are consumed");


    // ==================================================
    // TEST 6: Transactional Reward Redemptions
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 6: Transactional Reward Redemptions & Ledgers");
    console.log("--------------------------------------------------");

    // Set credits to exactly 12 (to verify carry-forward)
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 12 }
    });

    // Create a dummy subscription for Referrer to renew
    const referrerProperty = await prisma.property.create({
      data: {
        title: "Referrer Property Mock",
        ownerId: referrerId,
        slug: `referrer-mock-${Date.now()}`
      }
    });

    const referrerSubscription = await prisma.propertySubscription.create({
      data: {
        propertyId: referrerProperty.id,
        selectedPlanId: testPlanId,
        billingCycle: "YEARLY",
        status: "PENDING_PAYMENT",
        amount: 10000
      }
    });

    // Execute transactional redemption for 100% off Yearly plan (requires 10 credits)
    const redeemResult = await ReferralService.redeemCreditsForSubscription({
      userId: referrerId,
      subscriptionId: referrerSubscription.id,
      billingCycle: "YEARLY",
      baseAmount: 10000
    });

    assert(redeemResult.success === true, "Transactional redemption executed successfully");
    assert(redeemResult.creditsUsed === 10, "Correct credits consumed from profile");
    assert(redeemResult.discountAmount === 10000, "100% discount applied to the Yearly plan");

    // Check balance and carry forward credits
    const referrerProfileAfterRedeem = await prisma.referralProfile.findUnique({
      where: { userId: referrerId }
    });
    assert(referrerProfileAfterRedeem.totalCredits === 2, "Referrer active balance properly decreased by 10 (Remaining: 2 credits carried forward)");
    assert(referrerProfileAfterRedeem.redeemedCredits === 10, "Referrer redeemed credits properly incremented by 10");

    // Check ledger log
    const redeemLedgerLog = await prisma.referralCreditLedger.findFirst({
      where: { userId: referrerId, eventType: "REWARD_REDEMPTION" }
    });
    assert(redeemLedgerLog !== null, "Immutable ledger redemption log created");
    assert(redeemLedgerLog.credits === -10, "Ledger logs correct negative balance deduction (-10)");
    assert(redeemLedgerLog.balanceAfter === 2, "Ledger reflects correct remaining balance of 2");

    // Check Redemption table record
    const redemptionRecord = await prisma.referralRewardRedemption.findFirst({
      where: { subscriptionId: referrerSubscription.id }
    });
    assert(redemptionRecord !== null, "ReferralRewardRedemption audit log record captured in DB");
    assert(redemptionRecord.creditsUsed === 10, "Redemption records correct creditsUsed");
    assert(redemptionRecord.discountAmount === 10000, "Redemption records correct discountAmount");


    // ==================================================
    // TEST 7: GST-Aware Calculations & Invoice Integration
    // ==================================================
    console.log("\n--------------------------------------------------");
    console.log("TEST 7: GST-Aware Calculations & Invoice Integration");
    console.log("--------------------------------------------------");

    // Set Referrer's active credits to exactly 6
    await prisma.referralProfile.update({
      where: { userId: referrerId },
      data: { totalCredits: 6 }
    });

    // Create a new subscription for Referrer
    const newSubscription = await prisma.propertySubscription.create({
      data: {
        propertyId: referrerProperty.id,
        selectedPlanId: testPlanId,
        billingCycle: "YEARLY",
        status: "PENDING_PAYMENT",
        amount: 10000
      }
    });

    // Calculate discount for 6 credits on a ₹10,000 yearly plan (50% off = ₹5,000 subtotal reduction)
    const newRedemptionResult = await ReferralService.redeemCreditsForSubscription({
      userId: referrerId,
      subscriptionId: newSubscription.id,
      billingCycle: "YEARLY",
      baseAmount: 10000 // Original subtotal prior to GST
    });

    // Original yearly subscription base price is ₹8,474.58 with GST ₹1,525.42 totaling ₹10,000.
    // If we apply 50% discount, the net paid total is ₹5,000.
    // From this net paid total, the invoice engine must back-calculate the new taxable subtotal and GST.
    // Net Paid = ₹5,000
    // Taxable Subtotal = Net Paid / 1.18 = ₹4,237.29
    // GST = ₹762.71
    // Original Subtotal = Taxable Subtotal + Discount = ₹4,237.29 + ₹5,000.00 = ₹9,237.29.
    
    const transaction = await prisma.paymentTransaction.create({
      data: {
        propertyId: referrerProperty.id,
        subscriptionId: newSubscription.id,
        amount: 5000.00, // Net amount paid (discounted by 50% from ₹10,000)
        currency: "INR",
        paymentStatus: "SUCCESS",
        utrNumber: `UTR-${Date.now()}`,
        paidAt: new Date(),
      },
      include: {
        subscription: true
      }
    });
    transactionId = transaction.id;

    // Generate GST-compliant invoice
    const invoice = await InvoiceService.generateInvoiceForTransaction(transaction.id);
    invoiceId = invoice.id;
    createdInvoiceIds.push(invoice.id);

    assert(invoice !== null, "GST-compliant invoice generated successfully for discounted transaction");
    
    // Validate calculations
    // Net Amount Paid = 5000
    // 18% GST back-calculated: Subtotal = ₹4,237.29, GST Amount = ₹762.71
    assert(invoice.totalAmount === 5000.00, "Invoice total matches the net paid amount (₹5,000.00)");
    assert(invoice.subtotal === 4237.29, `Invoice subtotal is back-calculated correctly from net amount: ₹${invoice.subtotal} (Expected: 4237.29)`);
    assert(invoice.gstAmount === 762.71, `Invoice GST amount is back-calculated correctly: ₹${invoice.gstAmount} (Expected: 762.71)`);

    // Verify metadata logging for auditing
    const meta = invoice.metadata;
    assert(meta.referralDiscount === 5000.00, `Invoice metadata correctly records subtotal referral discount of ₹${meta.referralDiscount}`);
    assert(meta.referralCreditsUsed === 6, `Invoice metadata correctly records ${meta.referralCreditsUsed} referral credits used`);
    assert(meta.originalSubtotal === 9237.29, `Invoice metadata correctly logs pre-discount original subtotal: ₹${meta.originalSubtotal} (Expected: 9237.29)`);

    // Verify CGST & SGST Split for intrastate (supplier registered in Gujarat, customer in Gujarat)
    assert(meta.cgst === 381.36 && meta.sgst === 381.36, `Intrastate GST split accurately calculated: CGST=₹${meta.cgst}, SGST=₹${meta.sgst}`);
    assert(meta.igst === 0, "IGST is zero for intrastate transaction");

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP & RESTORE DATABASE HYGIENE
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring original settings & cleaning up...");
    console.log("--------------------------------------------------");

    // Clean up created entities in reverse dependency order
    for (const invId of createdInvoiceIds) {
      await prisma.invoice.delete({ where: { id: invId } }).catch(() => {});
    }

    if (transactionId) {
      await prisma.paymentTransaction.delete({ where: { id: transactionId } }).catch(() => {});
    }

    // Delete redemptions
    await prisma.referralRewardRedemption.deleteMany({
      where: { userId: { in: [referrerId, referredId, fraudReferredId].filter(Boolean) } }
    }).catch(() => {});

    // Delete ledgers
    await prisma.referralCreditLedger.deleteMany({
      where: { userId: { in: [referrerId, referredId, fraudReferredId].filter(Boolean) } }
    }).catch(() => {});

    // Delete referral events
    await prisma.referralEvent.deleteMany({
      where: { referrerUserId: referrerId }
    }).catch(() => {});

    // Delete profiles
    await prisma.referralProfile.deleteMany({
      where: { userId: { in: [referrerId, referredId, fraudReferredId].filter(Boolean) } }
    }).catch(() => {});

    // Delete subscriptions
    await prisma.propertySubscription.deleteMany({
      where: { property: { ownerId: { in: [referrerId, referredId, fraudReferredId].filter(Boolean) } } }
    }).catch(() => {});

    // Delete properties
    await prisma.property.deleteMany({
      where: { ownerId: { in: [referrerId, referredId, fraudReferredId].filter(Boolean) } }
    }).catch(() => {});

    // Delete users
    if (referredId) await prisma.user.delete({ where: { id: referredId } }).catch(() => {});
    if (fraudReferredId) await prisma.user.delete({ where: { id: fraudReferredId } }).catch(() => {});
    if (referrerId) await prisma.user.delete({ where: { id: referrerId } }).catch(() => {});

    // Delete plan
    if (testPlanId) await prisma.subscriptionPlan.delete({ where: { id: testPlanId } }).catch(() => {});

    console.log("🧹 Database states cleaned up and restored successfully.");
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
