import { getRedis } from "../redis/client"
const redis = getRedis()

import { RATE_LIMIT_CONFIG } from "../security/config"

/**
 * Sliding Window Rate Limiter (Self-hosted Redis implementation)
 */
async function slidingWindowLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const minTime = now - windowMs

  const pipeline = redis.pipeline()
  
  // 1. Remove old entries
  pipeline.zremrangebyscore(key, 0, minTime)
  // 2. Add current request
  pipeline.zadd(key, now, `${now}-${Math.random()}`)
  // 3. Count entries in window
  pipeline.zcard(key)
  // 4. Set expiry to clean up idle keys
  pipeline.expire(key, windowSeconds + 1)

  const results = await pipeline.exec()
  if (!results) return { success: false, limit, remaining: 0, reset: now + windowMs }

  const count = results[2][1] as number
  const success = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = now + windowMs

  return { success, limit, remaining, reset }
}

/**
 * Adaptive Rate Limiter.
 * Migrated from @upstash/ratelimit to native ioredis implementation.
 */
export async function adaptiveRateLimit(req: { ip: string; route: string; userId?: string }) {
  const config = RATE_LIMIT_CONFIG[req.route] || RATE_LIMIT_CONFIG["default"]
  const identifier = `rate:${req.ip}:${req.userId || "guest"}:${req.route}`
  
  const result = await slidingWindowLimit(
    `@home4stay:limit:${identifier}`,
    config.limit,
    config.window
  )
  
  return result
}
