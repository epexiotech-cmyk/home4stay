import 'server-only';
import { getRedis } from "@/lib/server/redis";
import { Pool } from "pg";

let hasValidated = false;

/**
 * Validates availability of primary infrastructure services and validates environment variables.
 * In production, triggers a strict fail-fast startup crash if configurations are invalid.
 */
export async function checkServices() {
  if (hasValidated) return;

  console.log("🔍 Running production startup environment validations...");

  const isProd = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL;
  const jwtSecret = process.env.JWT_SECRET;

  // 1. STRICT ENVIRONMENT VALIDATION
  const errors: string[] = [];

  if (!databaseUrl || databaseUrl.length < 15) {
    errors.push("DATABASE_URL is missing or critically brief.");
  }
  if (!redisUrl || redisUrl.length < 10) {
    errors.push("REDIS_URL is missing or critically brief.");
  }
  if (!jwtSecret || jwtSecret.length < 16) {
    errors.push("JWT_SECRET is missing or lacks standard length for security compliance (minimum 16 chars).");
  }

  if (errors.length > 0) {
    console.error("❌ CRITICAL STARTUP CONFIGURATION ERRORS DETECTED:");
    errors.forEach(err => console.error(`  - ${err}`));
    
    if (isProd) {
      console.error("🚨 Fail-fast startup triggered: Crashing production process for safety.");
      process.exit(1);
    }
    return;
  }

  // 2. CONNECTIVITY PROBES
  try {
    // Redis ping check
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      console.log("✅ Startup check: Redis is reachable");
    } else {
      throw new Error("Redis client failed instantiation");
    }

    // Database connection check
    const db = new Pool({ connectionString: databaseUrl });
    await db.query("SELECT 1");
    await db.end(); // Clean up startup check pool
    console.log("✅ Startup check: Database is reachable");

    hasValidated = true;
    console.log("🚀 All startup validation checks passed successfully!");

    // Boot background transactional email queue polling worker loop
    const { bootEmailQueueWorker } = await import("@/modules/payments/services/emailQueue");
    bootEmailQueueWorker();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("⚠️ Infrastructure connectivity check failed:", errorMessage);
    if (isProd) {
      console.error("🚨 Fail-fast startup connectivity check failed: Crashing process.");
      process.exit(1);
    }
  }
}
