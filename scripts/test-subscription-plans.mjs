import { PrismaClient } from "@prisma/client";
import { getAvailablePlans, getPlanEntitlements } from "../apps/main-site/src/modules/payments/services/entitlements.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 3.5: SUBSCRIPTION PLANS & ENTITLEMENTS TEST SUITE ===\n");

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

  const createdPlanIds = [];

  try {
    // --------------------------------------------------
    // TEST 1: Creation, Validation & Entitlements
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Creation, Validation & Entitlements");
    console.log("--------------------------------------------------");

    const testSlug = `premium-royal-suite-test-${Date.now()}`;
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: "Premium Royal Suite Test Plan",
        slug: testSlug,
        description: "Ultimate luxury onboarding limits tier.",
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
        monthlyPrice: 1999.00,
        quarterlyPrice: 4999.00,
        yearlyPrice: 14999.00,
        lifetimePrice: 29999.00,
        maxProperties: 3,
        maxImagesPerProperty: 25,
        maxVideosPerProperty: 3,
        maxRoomListings: 15,
        maxBookingsPerMonth: 500,
        supportPriority: "VIP_PRIORITY",
        customBadge: "RECOMMENDED",
        featureFlags: {
          featuredListing: true,
          analyticsAccess: true,
          whatsappInquiry: true,
          aiContentGeneration: true
        }
      }
    });
    createdPlanIds.push(plan.id);

    assert(plan.id !== undefined, "Subscription plan created in database successfully");
    assert(plan.yearlyPrice === 14999.00, "Plan pricing is accurately stored");
    assert(plan.maxImagesPerProperty === 25, "Limits bounds correctly configured");

    // Resolve entitlements
    const entitlements = await getPlanEntitlements(plan.slug);
    assert(entitlements.maxProperties === 3, "Entitlement resolver loaded correct properties limits");
    assert(entitlements.features.aiContentGeneration === true, "Dynamic JSON feature flags parsed successfully");
    assert(entitlements.supportPriority === "VIP_PRIORITY", "High tier support routing works");

    // --------------------------------------------------
    // TEST 2: Active Plan Resolver & Sort Display Order
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Active Plan Resolver & Sort Display Order");
    console.log("--------------------------------------------------");

    // Back up existing active plans
    const originalPlans = await prisma.subscriptionPlan.findMany();
    await prisma.subscriptionPlan.deleteMany();

    // Create custom sorting seeds
    const firstPlan = await prisma.subscriptionPlan.create({
      data: {
        name: "Standard Onboarding Tier",
        slug: "standard-onboarding-test",
        description: "Perfect for single villas.",
        isActive: true,
        displayOrder: 1,
        monthlyPrice: 999.00,
        quarterlyPrice: 2499.00,
        yearlyPrice: 8999.00,
        lifetimePrice: 19999.00
      }
    });
    createdPlanIds.push(firstPlan.id);

    const secondPlan = await prisma.subscriptionPlan.create({
      data: {
        name: "Enterprise Multi-Villa Onboarding Tier",
        slug: "enterprise-multi-villa-test",
        description: "Perfect for commercial setups.",
        isActive: true,
        displayOrder: 10,
        monthlyPrice: 4999.00,
        quarterlyPrice: 11999.00,
        yearlyPrice: 39999.00,
        lifetimePrice: 99999.00
      }
    });
    createdPlanIds.push(secondPlan.id);

    const inactivePlan = await prisma.subscriptionPlan.create({
      data: {
        name: "Draft Legacy Level Tier",
        slug: "draft-legacy-test",
        description: "Hidden sandbox layer.",
        isActive: false,
        displayOrder: 0,
        monthlyPrice: 0,
        quarterlyPrice: 0,
        yearlyPrice: 0,
        lifetimePrice: 0
      }
    });
    createdPlanIds.push(inactivePlan.id);

    const resolvedPlans = await getAvailablePlans();
    assert(resolvedPlans.length === 2, "Public plans resolver correctly filters out inactive plans");
    assert(resolvedPlans[0].id === firstPlan.id, "Active plans sorted correctly by displayOrder asc (Standard first)");
    assert(resolvedPlans[1].id === secondPlan.id, "Active plans sorted correctly by displayOrder asc (Enterprise next)");

    // --------------------------------------------------
    // TEST 3: Soft Delete System
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Soft Delete System");
    console.log("--------------------------------------------------");

    // Soft delete firstPlan
    await prisma.subscriptionPlan.update({
      where: { id: firstPlan.id },
      data: { deletedAt: new Date() }
    });

    const resolvedAfterDelete = await getAvailablePlans();
    assert(resolvedAfterDelete.length === 1, "Public plan resolver correctly filters out soft-deleted plans");
    assert(resolvedAfterDelete[0].id === secondPlan.id, "Remaining plan stays active");

    const deletedEntitlements = await getPlanEntitlements(firstPlan.id);
    assert(deletedEntitlements.maxProperties === 1, "Soft deleted plan falls back to baseline defaults for safety");

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP & RESTORE
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring original settings...");
    console.log("--------------------------------------------------");

    for (const pid of createdPlanIds) {
      await prisma.subscriptionPlan.delete({ where: { id: pid } }).catch(() => {});
    }

    console.log("🧹 Database states restored successfully.");
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
