import 'server-only'
import { getRedis } from "@/lib/server/redis"
import { Pool } from "pg"

/**
 * Validates availability of primary infrastructure services.
 */
export async function checkServices() {
  try {
    const redis = getRedis()
    await redis.ping()
    console.log("✅ Redis ready")

    const db = new Pool({ connectionString: process.env.DATABASE_URL })
    await db.query("SELECT 1")
    await db.end() // Clean up startup check pool

    console.log("✅ Database ready")
    console.log("🚀 All services ready")
  } catch (err) {
    console.error("❌ Service check failed:", err)
  }
}
