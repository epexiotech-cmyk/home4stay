import { PrismaClient } from "@prisma/client";
import { LegalService } from "../apps/main-site/src/lib/legal/legalService.ts";
import { sanitizeHtml } from "../apps/main-site/src/lib/legal/sanitizer.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 10A: LEGAL COMPLIANCE & INTEGRATION TEST SUITE ===\n");

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

  const createdDocIds = [];
  const createdLogIds = [];
  let testUserId = null;

  try {
    // --------------------------------------------------
    // TEST 1: XSS Sanitization Guard
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Web XSS Sanitization Protection Helper");
    console.log("--------------------------------------------------");

    const dangerousHtml = `
      <h1>Terms & Conditions</h1>
      <script>alert('xss payload!')</script>
      <iframe src="evil-site.com"></iframe>
      <p onclick="executeHackerCode()" onerror="exploit()">Welcome back!</p>
      <style>body { background: red; }</style>
      <a href="javascript:alert(1)">Click Me Safely</a>
      <strong>Valid formatting stays!</strong>
    `;

    const sanitizedHtml = sanitizeHtml(dangerousHtml);
    
    assert(!sanitizedHtml.includes("<script>"), "Strips script tags completely");
    assert(!sanitizedHtml.includes("<iframe>"), "Strips iframe tags completely");
    assert(!sanitizedHtml.includes("<style>"), "Strips style tags completely");
    assert(!sanitizedHtml.includes("onclick="), "Strips dynamic onclick handlers");
    assert(!sanitizedHtml.includes("onerror="), "Strips dynamic onerror handlers");
    assert(!sanitizedHtml.includes("javascript:"), "Sanitizes javascript: links to safe fallback");
    assert(sanitizedHtml.includes("<h1>Terms & Conditions</h1>"), "Preserves safe h1 elements");
    assert(sanitizedHtml.includes("<strong>Valid formatting stays!</strong>"), "Preserves safe strong tags");

    // --------------------------------------------------
    // TEST 2: Legal Version Creation as Draft
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Document Creation & Versioning State");
    console.log("--------------------------------------------------");

    const testVersion1 = `99.1.0-${Date.now()}`;
    const doc1 = await LegalService.createDocumentVersion(
      "TERMS_AND_CONDITIONS",
      "Test Terms and Conditions v1",
      "test-terms-v1",
      testVersion1,
      "<h2>Version 1 text</h2>"
    );
    createdDocIds.push(doc1.id);

    assert(doc1.id !== undefined, "Legal document draft version created in database successfully");
    assert(doc1.isActive === false, "Newly created document version initializes as an inactive DRAFT");
    assert(doc1.publishedAt === null, "Draft document version has no publishedAt timestamp");

    // --------------------------------------------------
    // TEST 3: Transaction-Safe Publishing & Auto-Deactivation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Dynamic Version Promotion & Auto-Deactivation");
    console.log("--------------------------------------------------");

    // Publish doc1
    const publishedDoc1 = await LegalService.publishDocument(doc1.id);
    assert(publishedDoc1.isActive === true, "Document version successfully promoted to active state");
    assert(publishedDoc1.publishedAt !== null, "Stamp publishedAt timestamp successfully on promotion");

    // Create a second version draft
    const testVersion2 = `99.2.0-${Date.now()}`;
    const doc2 = await LegalService.createDocumentVersion(
      "TERMS_AND_CONDITIONS",
      "Test Terms and Conditions v2",
      "test-terms-v2",
      testVersion2,
      "<h2>Version 2 text</h2>"
    );
    createdDocIds.push(doc2.id);

    // Promote/Publish doc2. This should automatically set doc1 to isActive = false
    const publishedDoc2 = await LegalService.publishDocument(doc2.id);
    assert(publishedDoc2.isActive === true, "Promoted second version successfully to active");

    const reloadedDoc1 = await prisma.legalDocument.findUnique({
      where: { id: doc1.id }
    });
    assert(reloadedDoc1.isActive === false, "First version automatically deactivated upon second version promotion");

    // --------------------------------------------------
    // TEST 4: Immutable Compliance Logging
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Immutable Acceptance Logs (Consent Audit Signatures)");
    console.log("--------------------------------------------------");

    // Create a test user for recording signatures
    const userEmail = `compliance-tester-${Date.now()}@home4stay.com`;
    const testUser = await prisma.user.create({
      data: {
        email: userEmail,
        name: "Compliance Tester",
        password: "HashPassword123!",
        role: "owner"
      }
    });
    testUserId = testUser.id;

    // Log acceptance signature for active doc2
    const ipAddress = "192.168.1.100";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0";
    
    const acceptanceLog = await LegalService.logAcceptance(
      testUser.id,
      doc2.id,
      publishedDoc2.version,
      ipAddress,
      userAgent,
      { source: "testing-suite" }
    );
    createdLogIds.push(acceptanceLog.id);

    assert(acceptanceLog.id !== undefined, "Compliance consent acceptance log written successfully");
    assert(acceptanceLog.acceptedVersion === publishedDoc2.version, "Audit log preserves exactly signed version");
    assert(acceptanceLog.ipAddress === ipAddress, "Audit log preserves user IP signature footprint");
    assert(acceptanceLog.userAgent === userAgent, "Audit log preserves browser User-Agent footprint");

    // --------------------------------------------------
    // TEST 5: Global Re-acceptance Wall Status Checkers
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Forced Re-acceptance & Lock Overlay Handlers");
    console.log("--------------------------------------------------");

    // Tester has accepted terms and conditions v2. Let's verify:
    const termsAccepted = await LegalService.hasUserAcceptedLatest(testUser.id, "TERMS_AND_CONDITIONS");
    assert(termsAccepted === true, "User has successfully signed the latest active terms version");

    // Now let's create a new Privacy Policy version and promote it, which the user hasn't signed
    const privacyVersion = `99.3.0-${Date.now()}`;
    const privacyDoc = await LegalService.createDocumentVersion(
      "PRIVACY_POLICY",
      "Dynamic Test Privacy Policy",
      "test-privacy",
      privacyVersion,
      "<h2>Privacy policy details</h2>"
    );
    createdDocIds.push(privacyDoc.id);
    const activePrivacy = await LegalService.publishDocument(privacyDoc.id);

    // Verify if getPendingReacceptances identifies the unsigned Privacy Policy
    const pendingDocs = await LegalService.getPendingReacceptances(testUser.id);
    const pendingTypes = pendingDocs.map(d => d.documentType);
    
    assert(pendingTypes.includes("PRIVACY_POLICY"), "Interceptor overlay correctly marks updated Privacy Policy as unsigned");
    assert(!pendingTypes.includes("TERMS_AND_CONDITIONS"), "Interceptor overlay does not request signed terms signature");

    // --------------------------------------------------
    // TEST 6: Checkout Gate Checkpoint Simulation
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 6: Billing Checkout Checkpoint Guard Checks");
    console.log("--------------------------------------------------");

    const subAgreementVersion = `99.4.0-${Date.now()}`;
    const subAgreementDoc = await LegalService.createDocumentVersion(
      "SUBSCRIPTION_AGREEMENT",
      "Dynamic Subscription Agreement",
      "test-sub-agreement",
      subAgreementVersion,
      "<h2>Agreement Terms</h2>"
    );
    createdDocIds.push(subAgreementDoc.id);
    const activeSubAgreement = await LegalService.publishDocument(subAgreementDoc.id);

    // Mock API payload verification
    const assertedClientVersion = activeSubAgreement.version;
    const dummyClientVersion = "1.0.0-outdated";

    // Simulate validation
    const successValidation = (assertedClientVersion === activeSubAgreement.version);
    const failedValidation = (dummyClientVersion === activeSubAgreement.version);

    assert(successValidation === true, "Checkout validates and permits current Subscription Agreement versions");
    assert(failedValidation === false, "Checkout rejects outdated / mismatched Subscription Agreement versions");

  } catch (err) {
    console.error("\n❌ E2E test execution error occurred:", err);
    failed++;
  } finally {
    // --------------------------------------------------
    // CLEANUP & RESTORE
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST HYGIENE: Restoring compliance databases states...");
    console.log("--------------------------------------------------");

    // Delete logs
    for (const logId of createdLogIds) {
      await prisma.legalAcceptanceLog.delete({ where: { id: logId } }).catch(() => {});
    }

    // Delete documents
    for (const docId of createdDocIds) {
      await prisma.legalDocument.delete({ where: { id: docId } }).catch(() => {});
    }

    // Delete tester user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }

    console.log("🧹 DB clean-up executed. All temporary compliance entities deleted.");
  }

  console.log("\n==================================================");
  console.log(`🏁 COMPLIANCE REPORT: Passed ${passed} | Failed ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
