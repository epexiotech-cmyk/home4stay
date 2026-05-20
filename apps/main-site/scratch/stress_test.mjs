import Module from 'module';

// Hijack CommonJS require globally inside the ESM execution context
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'server-only') {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

// Dynamically import modules at runtime to prevent static import hoisting
const { checkServices } = await import("../src/lib/startup/checkServices.js");
const { isJtiRevoked } = await import("../src/lib/auth/blacklist.js");
const { cacheGet, cacheSet, cacheInvalidate } = await import("../src/lib/server/cache.js");
const { rateLimit } = await import("../src/lib/security/rateLimiter.js");
const { withErrorHandler } = await import("../src/lib/errors/handler.js");
const { NextRequest } = await import("next/server");

async function executeStressSuite() {
  console.log("===============================================================================");
  console.log("             HOME4STAY ENTERPRISE OBSERVABILITY & OUTAGE RESILIENCE SUITE      ");
  console.log("===============================================================================");

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

  // -----------------------------------------------------------------
  // TEST 1: Invalid Env Startup Fail-Safe Checks
  // -----------------------------------------------------------------
  console.log("\n[TEST 1] Testing env validation controls under misconfigured settings...");
  const originalEnv = { ...process.env };
  try {
    process.env.DATABASE_URL = "short";
    process.env.REDIS_URL = "short";
    process.env.JWT_SECRET = "short";
    process.env.NODE_ENV = "development"; // Prevents calling process.exit(1) in test run
    
    await checkServices();
    assert(true, "Successfully executed startup env validations under warning thresholds (didn't crash)");
  } catch (err) {
    assert(false, "Env startup checks threw an unhandled exception: " + err.message);
  } finally {
    process.env = { ...originalEnv };
  }

  // Get live Redis client and back up its methods to simulate physical outage
  const { getRedis } = await import("../src/lib/server/redis.js");
  const redis = getRedis();
  const originalGet = redis.get;
  const originalSet = redis.set;
  const originalDel = redis.del;
  const originalKeys = redis.keys;
  const originalExists = redis.exists;

  try {
    // -----------------------------------------------------------------
    // SIMULATED REDIS OUTAGE: Force Redis methods to throw connection errors
    // -----------------------------------------------------------------
    redis.get = () => Promise.reject(new Error("Connection timeout"));
    redis.set = () => Promise.reject(new Error("Connection timeout"));
    redis.del = () => Promise.reject(new Error("Connection timeout"));
    redis.keys = () => Promise.reject(new Error("Connection timeout"));
    redis.exists = () => Promise.reject(new Error("Connection timeout"));

    // -----------------------------------------------------------------
    // TEST 2: High-Resilience Redis Outage Blacklist Check (Fail-Open)
    // -----------------------------------------------------------------
    console.log("\n[TEST 2] Testing blacklist verification under simulated Redis offline status...");
    try {
      const isRevoked = await isJtiRevoked("hijacked-token-jti");
      assert(isRevoked === false, "Survived Redis offline outage: blacklist checking fail-opened gracefully (returned false)");
    } catch (err) {
      assert(false, "Blacklist checking crashed under Redis outage: " + err.message);
    }

    // -----------------------------------------------------------------
    // TEST 3: High-Resilience Redis Outage Caching Helper (Fail-Safe)
    // -----------------------------------------------------------------
    console.log("\n[TEST 3] Testing cache helper methods under simulated Redis outage...");
    try {
      const setSuccess = await cacheSet("temp-key", { test: 1 }, 10);
      assert(setSuccess === false, "Survived Redis outage: cacheSet failed safe silently (returned false)");

      const getVal = await cacheGet("temp-key");
      assert(getVal === null, "Survived Redis outage: cacheGet failed safe returning null (triggered DB fallback)");

      const invalidateSuccess = await cacheInvalidate("temp-key");
      assert(invalidateSuccess === false, "Survived Redis outage: cacheInvalidate failed safe silently (returned false)");
    } catch (err) {
      assert(false, "Caching helper crashed under Redis offline status: " + err.message);
    }

    // -----------------------------------------------------------------
    // TEST 4: High-Resilience Redis Outage Rate Limiter (Local Fallback)
    // -----------------------------------------------------------------
    console.log("\n[TEST 4] Testing rate limiter fallback under simulated Redis outage...");
    try {
      const rl1 = await rateLimit({ key: "offline-ip-127.0.0.1", limit: 2, windowSeconds: 5 });
      assert(rl1.success === true && rl1.remaining === 1, "Survived Redis outage: rate limiter fallback permitted first request");

      const rl2 = await rateLimit({ key: "offline-ip-127.0.0.1", limit: 2, windowSeconds: 5 });
      assert(rl2.success === true && rl2.remaining === 0, "Rate limiter fallback permitted second request");

      const rl3 = await rateLimit({ key: "offline-ip-127.0.0.1", limit: 2, windowSeconds: 5 });
      assert(rl3.success === false, "Rate limiter fallback successfully BLOCKED third request (rate exceeded)");
    } catch (err) {
      assert(false, "Rate limiting crashed under Redis offline status: " + err.message);
    }

  } finally {
    // Restore original Redis client methods
    redis.get = originalGet;
    redis.set = originalSet;
    redis.del = originalDel;
    redis.keys = originalKeys;
    redis.exists = originalExists;
  }

  // -----------------------------------------------------------------
  // TEST 5: Standardized Masked Error Wrappers (DB Outage Mitigation)
  // -----------------------------------------------------------------
  console.log("\n[TEST 5] Testing error wrapper masking under simulated database connection failures...");
  try {
    process.env.NODE_ENV = "production"; // Put into production to force error masking

    const rawApiHandler = async () => {
      // Simulate raw database connection loss / PostgreSQL query engine crash
      throw new Error("FATAL: database connection lost on socket 5432");
    };

    const wrappedHandler = withErrorHandler(rawApiHandler);
    const mockRequest = new NextRequest("http://localhost/api/bookings", {
      headers: { "x-request-id": "stress-request-999" }
    });

    const response = await wrappedHandler(mockRequest);
    const body = await response.json();

    assert(response.status === 500, "Wrapped handler correctly returned HTTP 500 error status");
    assert(body.success === false, "Payload has success: false");
    assert(body.error.code === "INTERNAL_SERVER_ERROR", "Exposed error code is masked as INTERNAL_SERVER_ERROR");
    assert(body.error.message === "An unexpected error occurred. Please contact support.", "Exposed message is masked (no DB socket connection details leaked!)");
    assert(body.error.requestId === "stress-request-999", "Successfully propagated correlation requestId stress-request-999");
  } catch (err) {
    assert(false, "Error handling wrapper crashed under mock DB loss: " + err.message);
  } finally {
    process.env.NODE_ENV = "development";
  }

  console.log("\n===============================================================================");
  console.log(`    STRESS & RESILIENCE SUITE COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED    `);
  console.log("===============================================================================");
  process.exit(failedTests > 0 ? 1 : 0);
}

executeStressSuite().catch(console.error);
