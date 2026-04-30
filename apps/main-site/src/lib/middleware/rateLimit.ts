import { getRedis } from "../redis/client"
import { RATE_LIMIT_CONFIG } from "../security/config"
import { logger } from "../observability/logger";

const redis = getRedis()

/**
 * Sliding Window Rate Limiter (Self-hosted Redis implementation)
 */
async function slidingWindowLimit(
  key: string, 
  limit: number, 
  windowSeconds: number, 
  isCritical: boolean,
  requestId: string,
  ip: string
) {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const minTime = now - windowMs

  const pipeline = redis.pipeline()
  
  pipeline.zremrangebyscore(key, 0, minTime)
  pipeline.zadd(key, now, `${now}-${Math.random()}`)
  pipeline.zcard(key)
  pipeline.expire(key, windowSeconds + 1)

  try {
    const results = await pipeline.exec()
    if (!results) throw new Error("Pipeline execution failed")

    const count = (results[2][1] as number) || 0
    const success = count <= limit
    const remaining = Math.max(0, limit - count)
    const reset = now + windowMs

    if (!success) {
      await logger({
        level: 'warn',
        event: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit hit for ${key}: ${count}/${limit}`,
        requestId,
        ip,
      });
    }

    return { success, limit, remaining, reset }
  } catch (error) {
    await logger({
      level: 'error',
      event: 'REDIS_RATE_LIMIT_FAILURE',
      message: `Rate limiter error: ${error instanceof Error ? error.message : error}. Critical: ${isCritical}`,
      requestId,
      ip,
    });

    if (isCritical) {
      // STRICT MODE: If Redis is down, we block critical paths
      return { success: false, limit, remaining: 0, reset: now + windowMs }
    } else {
      // FAIL-OPEN: Allow non-critical paths if infrastructure is down
      return { success: true, limit, remaining: 1, reset: now + windowMs }
    }
  }
}

/**
 * Adaptive Rate Limiter.
 */
export async function adaptiveRateLimit(req: { 
  ip: string; 
  route: string; 
  userId?: string; 
  isCritical?: boolean;
  requestId?: string;
}) {
  const config = RATE_LIMIT_CONFIG[req.route] || RATE_LIMIT_CONFIG["default"]
  const identifier = `rate:${req.ip}:${req.userId || "guest"}:${req.route}`
  const requestId = req.requestId || crypto.randomUUID();
  
  const result = await slidingWindowLimit(
    `@home4stay:limit:${identifier}`,
    config.limit,
    config.window,
    req.isCritical ?? false,
    requestId,
    req.ip
  )
  
  return result
}
