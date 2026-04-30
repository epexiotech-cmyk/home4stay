import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'
import { pool } from '@/lib/database/transactions'

export async function GET() {
  let redisStatus = "ok"
  let dbStatus = "ok"
  let statusCode = 200

  try {
    // 1. Check Redis (Warning if fails, but don't crash)
    try {
      const redis = getRedis()
      await redis.ping()
    } catch (redisErr) {
      console.warn("⚠️ Redis Health Check Failed:", redisErr)
      redisStatus = "error (warning)"
    }
    
    // 2. Check Database (Critical)
    try {
      await pool.query('SELECT 1')
    } catch (dbErr) {
      console.error("❌ DB Health Check Failed:", dbErr)
      dbStatus = "error"
      statusCode = 503
    }
    
    // 3. Check Critical Env Vars
    const criticalVars = ['JWT_SECRET', 'REDIS_URL', 'DATABASE_URL']
    const missing = criticalVars.filter(v => !process.env[v])
    
    if (missing.length > 0) {
      return NextResponse.json({ 
        status: "degraded", 
        message: `Missing env vars: ${missing.join(', ')}` 
      }, { status: 503 })
    }

    if (dbStatus === "error") {
      return NextResponse.json({ 
        status: "down",
        db: dbStatus,
        redis: redisStatus,
        message: "Primary database connection failed"
      }, { status: statusCode })
    }

    return NextResponse.json({ 
      status: redisStatus === "ok" ? "ready" : "ready (with warnings)",
      db: dbStatus,
      redis: redisStatus
    }, { status: statusCode })
  } catch (err) {
    return NextResponse.json({ 
      status: "error", 
      message: err instanceof Error ? err.message : "Unexpected health check failure" 
    }, { status: 500 })
  }
}
