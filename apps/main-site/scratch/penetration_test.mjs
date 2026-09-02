import { AuthService } from "../src/lib/auth/auth.service.js";
import { prisma } from "../src/lib/database/prisma.js";

async function runPenetrationSuite() {
  console.log("===============================================================================");
  console.log("            HOME4STAY ENTERPRISE MULTI-TENANT SECURITY PENETRATION SUITE       ");
  console.log("===============================================================================");
  
  const authService = new AuthService();
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Authentic Database Login for Royal Villa Owner
    // ---------------------------------------------------------
    console.log("\n[TEST 1] Authenticating with real database-seeded credentials...");
    try {
      const result = await authService.login(
        "owner@royalvilla.com",
        "Home@4971",
        "partner",
        "127.0.0.1",
        "Mozilla/5.0"
      );
      assert(result && result.accessToken && result.sessionToken, "Successfully authenticated real database owner");
      assert(result.user.role === "owner", "Correctly resolved role: 'owner'");
      assert(result.user.propertySlug === "royal-villa", "Correctly resolved propertySlug: 'royal-villa'");
      
      // Keep for subsequent tests
      var royalVillaSession = result;
    } catch (err) {
      console.error("Test 1 error:", err);
      assert(false, "Failed to authenticate real database owner");
    }

    // ---------------------------------------------------------
    // TEST 2: Strict Block of Mock Fallback Logins
    // ---------------------------------------------------------
    console.log("\n[TEST 2] Verifying complete elimination of MOCK_USERS and fallback partner logins...");
    try {
      await authService.login(
        "mock_only_partner@home4stay.com",
        "Home@4971",
        "partner",
        "127.0.0.1",
        "Mozilla/5.0"
      );
      assert(false, "Security failure: Legacy mock login succeeded!");
    } catch (err) {
      assert(err.message === "Invalid credentials", `Successfully blocked mock login attempt: ${err.message}`);
    }

    // ---------------------------------------------------------
    // TEST 3: Strict Tenant Isolation on PropertyUserAccess Junctions
    // ---------------------------------------------------------
    console.log("\n[TEST 3] Testing tenant isolation boundaries on PropertyUserAccess junctions...");
    if (royalVillaSession) {
      const userId = royalVillaSession.user.id;

      // Check access to own property (Royal Villa)
      const ownAccess = await prisma.propertyUserAccess.findFirst({
        where: { userId, propertyId: "royal-villa-102" }
      });
      assert(ownAccess !== null && ownAccess.role === "owner", "Verified authorized access exists for assigned property (royal-villa-102)");

      // Check cross-tenant access to different property (Shivay Resort)
      const crossAccess = await prisma.propertyUserAccess.findFirst({
        where: { userId, propertyId: "shivay-resort-101" }
      });
      assert(crossAccess === null, "Verified cross-tenant access is STRICTLY blocked (returned null for unauthorized shivay-resort-101)");
    } else {
      assert(false, "Skipping Test 3: Royal Villa session unavailable");
    }

    // ---------------------------------------------------------
    // TEST 4: Verification of Active Token Refreshing
    // ---------------------------------------------------------
    console.log("\n[TEST 4] Verifying token refresh flow for active database session...");
    if (royalVillaSession) {
      try {
        const refreshResult = await authService.refresh(
          royalVillaSession.refreshToken,
          "127.0.0.1",
          "Mozilla/5.0"
        );
        assert(refreshResult && refreshResult.accessToken, "Successfully refreshed access token using active database session");
      } catch (err) {
        console.error("Test 4 error:", err);
        assert(false, "Failed to refresh token with active session");
      }
    } else {
      assert(false, "Skipping Test 4: Royal Villa session unavailable");
    }

    // ---------------------------------------------------------
    // TEST 5: Immediate Enforcement of Revoked Session Block
    // ---------------------------------------------------------
    console.log("\n[TEST 5] Testing real-time enforcement of session deactivation/revocation...");
    if (royalVillaSession) {
      try {
        // Deactivate session in PostgreSQL
        await prisma.session.update({
          where: { sessionToken: royalVillaSession.sessionToken },
          data: { isActive: false }
        });
        console.log(`[SYSTEM] Deactivated sessionToken ${royalVillaSession.sessionToken} in PostgreSQL`);

        // Attempt to refresh access token using the revoked session's refresh token
        await authService.refresh(
          royalVillaSession.refreshToken,
          "127.0.0.1",
          "Mozilla/5.0"
        );
        assert(false, "Security failure: Refreshed access token using a revoked session!");
      } catch (err) {
        assert(err.message === "Session revoked", `Successfully blocked revoked session refresh attempt: ${err.message}`);
      }
    } else {
      assert(false, "Skipping Test 5: Royal Villa session unavailable");
    }

  } catch (globalErr) {
    console.error("Penetration suite critical exception:", globalErr);
  } finally {
    console.log("\n===============================================================================");
    console.log(`    PENETRATION SUITE COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED    `);
    console.log("===============================================================================");
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runPenetrationSuite();
