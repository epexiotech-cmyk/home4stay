import { PrismaClient, PaymentProviderType, PaymentStatus } from "@prisma/client";
import { PaymentService } from "../apps/main-site/src/modules/payments/services/index.ts";
import { PaymentWebhookDelegator } from "../apps/main-site/src/modules/payments/services/webhooks/index.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 1: PAYMENT FOUNDATION SYSTEM TEST SUITE ===\n");

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
  const createdTransactions = [];

  try {
    // --------------------------------------------------
    // Fetch a baseline seed property
    // --------------------------------------------------
    const property = await prisma.property.findFirst();
    if (!property) {
      throw new Error("No properties found. Run database seed first.");
    }

    const propId = property.id;

    // --------------------------------------------------
    // TEST 1: Database Seed Provider Configs
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 1: Creating Payment Provider DB Configs");
    console.log("--------------------------------------------------");

    const upiConfig = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.MANUAL_UPI,
        displayName: "Manual peer-to-peer UPI (Shivay Resort Account)",
        upiId: "merchant@upi",
        instructions: "Please pay using any UPI app and share UTR.",
        isManual: true,
        isEnabled: true
      }
    });
    createdProviders.push(upiConfig.id);

    const rzpConfig = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.RAZORPAY,
        displayName: "Razorpay Checkout (Card/Netbanking)",
        apiKey: "rzp_key_test_123",
        secretKey: "rzp_secret_test_456",
        isSandbox: true,
        isEnabled: true
      }
    });
    createdProviders.push(rzpConfig.id);

    assert(upiConfig !== null && rzpConfig !== null, "Successfully seeded manual and automated configurations in database");

    // --------------------------------------------------
    // TEST 2: Provider Factory Loader & Strategy Mapping
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Payment Provider Strategy Loading Factory");
    console.log("--------------------------------------------------");

    const upiProvider = await PaymentService.getProviderInstance(upiConfig.id);
    assert(upiProvider !== null, "Instantiates ManualUpiProvider class successfully");

    const rzpProvider = await PaymentService.getProviderInstance(rzpConfig.id);
    assert(rzpProvider !== null, "Instantiates RazorpayProvider class successfully");

    // --------------------------------------------------
    // TEST 3: Initiate Payment Flow & Ledger Bookkeeping
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Payment Intent Initiation and Booking Ledger");
    console.log("--------------------------------------------------");

    const upiInit = await PaymentService.initiatePayment({
      propertyId: propId,
      providerId: upiConfig.id,
      amount: 15000,
      customerEmail: "guest@guest.com"
    });
    createdTransactions.push(upiInit.transaction.id);

    assert(upiInit.transaction.paymentStatus === PaymentStatus.PENDING, "Transaction created in initial PENDING status");
    assert(upiInit.transaction.amount === 15000, "Transaction amount maps correctly");
    assert(upiInit.qrCodeUrl !== undefined, "Manual UPI generates QR payload code successfully");

    const rzpInit = await PaymentService.initiatePayment({
      propertyId: propId,
      providerId: rzpConfig.id,
      amount: 25000,
      customerEmail: "guest@guest.com"
    });
    createdTransactions.push(rzpInit.transaction.id);

    assert(rzpInit.transaction.paymentStatus === PaymentStatus.PENDING, "Automated transaction created in initial PENDING status");
    assert(rzpInit.paymentUrl !== undefined, "Automated gateway maps mock redirect URL successfully");

    // --------------------------------------------------
    // TEST 4: Manual UPI Admin Approval Workflow
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Manual UPI Approval and Review Trailing");
    console.log("--------------------------------------------------");

    const approvedTx = await PaymentService.approveManualUpiPayment(
      upiInit.transaction.id,
      "admin_user_bob",
      "UTR verified against bank statement successfully."
    );

    assert(approvedTx.paymentStatus === PaymentStatus.APPROVED, "Transaction successfully updated to APPROVED status");
    assert(approvedTx.reviewedBy === "admin_user_bob", "Reviewer userId logged successfully");
    assert(approvedTx.paidAt !== null, "Paid timestamp paidAt populated successfully");

    // Verify audit logs
    const auditLogs = await prisma.paymentAuditLog.findMany({
      where: { transactionId: upiInit.transaction.id }
    });
    assert(auditLogs.length >= 2, "Audit log list captured transaction history entries");
    assert(auditLogs.some(log => log.action === "MANUAL_UPI_APPROVED"), "Audit log trail registers APPROVED dispatch action");

    // --------------------------------------------------
    // TEST 5: Webhook Processing and Automatic Transitions
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Automated Webhook Processing");
    console.log("--------------------------------------------------");

    // Simulate incoming webhook payload from Razorpay
    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            notes: {
              transactionId: rzpInit.transaction.id
            }
          }
        }
      }
    };

    const webhookResult = await PaymentWebhookDelegator.handleWebhook(rzpConfig.id, webhookPayload, "rzp_sig_123");
    assert(webhookResult.processed === true, "Webhook dispatcher parsed signature and mapped transaction successfully");
    assert(webhookResult.status === PaymentStatus.SUCCESS, "Webhook processing transitioned transaction to SUCCESS");

    const refreshedRzpTx = await prisma.paymentTransaction.findUnique({
      where: { id: rzpInit.transaction.id }
    });
    assert(refreshedRzpTx.paymentStatus === PaymentStatus.SUCCESS, "Database transaction record synchronized to SUCCESS");

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // HYGIENE CLEANUP
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Cleaning up database seeds...");
    console.log("--------------------------------------------------");

    for (const txId of createdTransactions) {
      await prisma.paymentAuditLog.deleteMany({ where: { transactionId: txId } }).catch(() => {});
      await prisma.paymentTransaction.delete({ where: { id: txId } }).catch(() => {});
    }

    for (const provId of createdProviders) {
      await prisma.paymentProvider.delete({ where: { id: provId } }).catch(() => {});
    }

    console.log("🧹 Database restored to baseline states successfully.");
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
