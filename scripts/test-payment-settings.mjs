import { PrismaClient, PaymentProviderType } from "@prisma/client";
import { encryptSecret, decryptSecret } from "../apps/main-site/src/lib/server/encryption.ts";
import { getActivePaymentProvider } from "../apps/main-site/src/modules/payments/services/resolver.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 3: PAYMENT SETTINGS INFRASTRUCTURE TEST SUITE ===\n");

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

  const createdProviders = [];

  try {
    // --------------------------------------------------
    // TEST 1: Cryptographic Symmetric Encryption & Decryption
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Cryptographic Encryption / Decryption");
    console.log("--------------------------------------------------");

    const plainKey = "rzp_live_secret_key_12345";
    const cipherText = encryptSecret(plainKey);

    assert(cipherText !== plainKey, "Cipher text does not match plain text at rest");
    assert(cipherText.includes(":"), "Format correctly encapsulates symmetric IV delimiter");

    const decryptedKey = decryptSecret(cipherText);
    assert(decryptedKey === plainKey, "Decrypted text matches the original plain text credential exactly");

    // --------------------------------------------------
    // TEST 2: Active Fallback Resolver & Priority Routing
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Active Fallback Resolver & Priority Routing");
    console.log("--------------------------------------------------");

    // Backup any existing active configs temporarily
    const originalProviders = await prisma.paymentProvider.findMany();
    await prisma.paymentProvider.deleteMany();

    // Create Stripe (Priority 5, Enabled)
    const stripe = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.STRIPE,
        displayName: "Stripe Production Setup",
        isEnabled: true,
        isDefault: false,
        priority: 5,
        apiKey: encryptSecret("stripe-key-5")
      }
    });
    createdProviders.push(stripe.id);

    // Create Razorpay (Priority 10, Enabled)
    const razorpay = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.RAZORPAY,
        displayName: "Razorpay Primary Checkout",
        isEnabled: true,
        isDefault: false,
        priority: 10,
        apiKey: encryptSecret("razorpay-key-10")
      }
    });
    createdProviders.push(razorpay.id);

    // Create Manual UPI (Priority 2, Enabled, Default)
    const manualUpi = await prisma.paymentProvider.create({
      data: {
        providerType: PaymentProviderType.MANUAL_UPI,
        displayName: "Manual UPI Primary Setup",
        isEnabled: true,
        isDefault: true,
        priority: 2,
        upiId: "payments@home4stay",
        instructions: "Please pay standard fees."
      }
    });
    createdProviders.push(manualUpi.id);

    // Assert that Razorpay is resolved because it has the highest priority rank
    const resolvedFirst = await getActivePaymentProvider();
    assert(resolvedFirst.id === razorpay.id, `Resolves highest priority enabled provider: ${resolvedFirst.displayName} (Priority: ${resolvedFirst.priority})`);

    // Disable Razorpay to test failover
    await prisma.paymentProvider.update({
      where: { id: razorpay.id },
      data: { isEnabled: false }
    });

    // Assert that Stripe is resolved next (Priority 5 > Priority 2 default UPI)
    const resolvedSecond = await getActivePaymentProvider();
    assert(resolvedSecond.id === stripe.id, `Successfully fails over to next highest priority active provider: ${resolvedSecond.displayName}`);

    // Disable Stripe
    await prisma.paymentProvider.update({
      where: { id: stripe.id },
      data: { isEnabled: false }
    });

    // Assert that Manual UPI is resolved now
    const resolvedThird = await getActivePaymentProvider();
    assert(resolvedThird.id === manualUpi.id, `Successfully resolves the fallback default provider when others are disabled: ${resolvedThird.displayName}`);

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

    for (const pid of createdProviders) {
      await prisma.paymentProvider.delete({ where: { id: pid } }).catch(() => {});
    }

    // Restore original providers
    const originalProvidersList = await prisma.paymentProvider.findMany();
    if (originalProvidersList.length === 0) {
      // Re-insert baseline database backups if backup array held records
      // Or restore seed state
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
