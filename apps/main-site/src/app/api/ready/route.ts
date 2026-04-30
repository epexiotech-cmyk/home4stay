import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis/client'
import { pool } from '@/lib/database/transactions'

export async function GET() {
  try {
    // 1. Check Redis
    await redis.ping()
    
    // 2. Check Database
    await pool.query('SELECT 1')
    
    // 3. Check Critical Env Vars
    const criticalVars = ['JWT_SECRET', 'UPSTASH_REDIS_REST_URL', 'DATABASE_URL']
    const missing = criticalVars.filter(v => !process.env[v])
    
    if (missing.length > 0) {
      return NextResponse.json({ 
        status: "degraded", 
        message: `Missing env vars: ${missing.join(', ')}` 
      }, { status: 503 })
    }

    return NextResponse.json({ 
      status: "ready",
      db: "ok",
      redis: "ok"
    }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ 
      status: "degraded", 
      message: err instanceof Error ? err.message : "Connection failed" 
    }, { status: 503 })
  }
}
