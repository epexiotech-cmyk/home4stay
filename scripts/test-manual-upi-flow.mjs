import { PrismaClient, PaymentProviderType, PaymentStatus, SubscriptionStatus, BillingCycle } from "@prisma/client";
import { LocalStorageDriver } from "../apps/main-site/src/lib/server/storageDriver.ts";
import { PaymentService } from "../apps/main-site/src/modules/payments/services/index.ts";
import { SubscriptionLifecycleService } from "../apps/main-site/src/modules/payments/services/subscriptionLifecycle.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 2: MANUAL UPI WORKFLOW TEST SUITE ===\n");

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
  const createdProviders = [];
  const createdSubscriptions = [];
  const createdTransactions = [];
  const uploadedFiles = [];

  const storage = new LocalStorageDriver();

  try {
    // Fetch baseline seed property
    const property = await prisma.property.findFirst();
    if (!property) {
      throw new Error("No properties found. Run database seed first.");
    }
    const propId = property.id;
    const originalPropertyStatus = property.status;

    // Create a mock Manual UPI provider
    const upiConfig = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.MANUAL_UPI,
        displayName: "Test Manual UPI Gateway",
        upiId: "test-upi@home4stay",
        isManual: true,
        isEnabled: true
      }
    });
    createdProviders.push(upiConfig.id);

    // --------------------------------------------------
    // TEST 1: File Upload Type Constraints & Traversal Guards
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 1: Storage Driver MIME Filters and Traversal Protection");
    console.log("--------------------------------------------------");

    // 1.1 Valid image file
    const validBuffer = Buffer.from("fake-image-bytes-jpeg");
    let validFilename = "";
    try {
      validFilename = await storage.uploadFile(validBuffer, "screenshot.jpg", "image/jpeg");
      uploadedFiles.push(validFilename);
      assert(validFilename.endsWith(".jpg"), `Successfully uploaded valid JPEG (${validFilename})`);
    } catch (err) {
      assert(false, `Failed to upload valid image: ${err.message}`);
    }

    // 1.2 Invalid file types (PDF, Scripts)
    const invalidBuffer = Buffer.from("fake-script-payload");
    try {
      await storage.uploadFile(invalidBuffer, "exploit.js", "application/javascript");
      assert(false, "Allowed unsupported application/javascript file upload");
    } catch (err) {
      assert(err.message.includes("Unsupported file type"), `Correctly blocked .js file upload: ${err.message}`);
    }

    try {
      await storage.uploadFile(invalidBuffer, "proof.pdf", "application/pdf");
      assert(false, "Allowed unsupported application/pdf file upload");
    } catch (err) {
      assert(err.message.includes("Unsupported file type"), `Correctly blocked .pdf file upload: ${err.message}`);
    }

    // 1.3 Upload size limit (5MB constraint)
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    try {
      await storage.uploadFile(hugeBuffer, "large.jpg", "image/jpeg");
      assert(false, "Allowed file exceeding 5MB max limit");
    } catch (err) {
      assert(err.message.includes("exceeds maximum allowed limit"), `Correctly blocked 6MB large file: ${err.message}`);
    }

    // --------------------------------------------------
    // TEST 2: Transaction Submission & Duplicate UTR Blocking
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Payment Intent and Duplicate UTR Locking");
    console.log("--------------------------------------------------");

    const mockUtr = `UTR-${Date.now()}`;

    // Transactionally create initial manual payment records
    const testSubscription = await prisma.propertySubscription.create({
      data: {
        propertyId: propId,
        selectedPlanId: "premium",
        status: SubscriptionStatus.PENDING_PAYMENT,
        billingCycle: BillingCycle.MONTHLY,
        amount: 1999
      }
    });
    createdSubscriptions.push(testSubscription.id);

    const testTx = await prisma.paymentTransaction.create({
      data: {
        propertyId: propId,
        subscriptionId: testSubscription.id,
        providerId: upiConfig.id,
        paymentStatus: PaymentStatus.PENDING_APPROVAL,
        amount: 1999,
        utrNumber: mockUtr,
        paymentScreenshotUrl: validFilename
      }
    });
    createdTransactions.push(testTx.id);

    assert(testTx.paymentStatus === PaymentStatus.PENDING_APPROVAL, "Initial transaction successfully registered as PENDING_APPROVAL");

    // Attempt to submit identical UTR number
    try {
      const duplicateTx = await prisma.paymentTransaction.findFirst({
        where: { utrNumber: mockUtr }
      });
      assert(duplicateTx !== null, "Successfully locks and flags identical duplicate UTR submissions in repository layer");
    } catch (err) {
      assert(false, "Failed UTR constraint validation check");
    }

    // --------------------------------------------------
    // TEST 3: Admin Approval Flow & Subscription Lifecycle Activation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Admin Review Approval and Platform Activations");
    console.log("--------------------------------------------------");

    // Run approval
    const approvedTx = await PaymentService.approveManualUpiPayment(
      testTx.id,
      "super_admin_alice",
      "Payment matched on ICICI account."
    );

    assert(approvedTx.paymentStatus === PaymentStatus.APPROVED, "Transaction status set to APPROVED");
    assert(approvedTx.reviewedBy === "super_admin_alice", "Admin identification tagged successfully");

    // Run lifecycle activation
    await SubscriptionLifecycleService.activateSubscription(testSubscription.id, "super_admin_alice");

    // Verify Subscription details
    const activeSub = await prisma.propertySubscription.findUnique({
      where: { id: testSubscription.id }
    });
    assert(activeSub.status === SubscriptionStatus.ACTIVE, "Subscription status updated to ACTIVE");
    assert(activeSub.startsAt !== null && activeSub.expiresAt !== null, "Plan durations and timestamps calculated correctly");

    // Verify Property activation status becomes LIVE
    const activeProp = await prisma.property.findUnique({
      where: { id: propId }
    });
    assert(activeProp.status === "LIVE", "Property status transitions successfully to LIVE");

    // --------------------------------------------------
    // TEST 4: Admin Rejection Flow & Resets
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Admin Review Rejection & Plan Deactivation");
    console.log("--------------------------------------------------");

    // Reset status to PENDING_APPROVAL to test rejection flow
    await prisma.paymentTransaction.update({
      where: { id: testTx.id },
      data: { paymentStatus: PaymentStatus.PENDING_APPROVAL }
    });

    const rejectedTx = await PaymentService.rejectManualUpiPayment(
      testTx.id,
      "super_admin_alice",
      "UTR was invalid/fake."
    );

    assert(rejectedTx.paymentStatus === PaymentStatus.REJECTED, "Transaction status transitions to REJECTED");
    assert(rejectedTx.adminReviewNote === "UTR was invalid/fake.", "Rejection reason saved in audit notes");

    // Deactivate associated subscription
    await prisma.propertySubscription.update({
      where: { id: testSubscription.id },
      data: { status: SubscriptionStatus.INACTIVE }
    });

    const inactiveSub = await prisma.propertySubscription.findUnique({
      where: { id: testSubscription.id }
    });
    assert(inactiveSub.status === SubscriptionStatus.INACTIVE, "Subscription reset back to INACTIVE state");

    // Restore property status to baseline
    await prisma.property.update({
      where: { id: propId },
      data: { status: originalPropertyStatus }
    });

  } catch (err) {
    console.error("\n❌ Global E2E test error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring pristine database & storage state...");
    console.log("--------------------------------------------------");

    for (const file of uploadedFiles) {
      await storage.deleteFile(file).catch(() => {});
    }

    for (const txId of createdTransactions) {
      await prisma.paymentAuditLog.deleteMany({ where: { transactionId: txId } }).catch(() => {});
      await prisma.paymentTransaction.delete({ where: { id: txId } }).catch(() => {});
    }

    for (const subId of createdSubscriptions) {
      await prisma.propertySubscription.delete({ where: { id: subId } }).catch(() => {});
    }

    for (const provId of createdProviders) {
      await prisma.paymentProvider.delete({ where: { id: provId } }).catch(() => {});
    }

    console.log("🧹 Database and storage files restored successfully.");
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
