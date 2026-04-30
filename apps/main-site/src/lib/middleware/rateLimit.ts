import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "../redis/client"
import { RATE_LIMIT_CONFIG } from "../security/config"

/**
 * Adaptive Rate Limiter.
 * Supports route-specific limits and dynamic key generation.
 */
export async function adaptiveRateLimit(req: { ip: string; route: string; userId?: string }) {
  const config = RATE_LIMIT_CONFIG[req.route] || RATE_LIMIT_CONFIG["default"]
  
  const limiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
    prefix: "@home4stay/adaptive-limit",
  })

  // Enterprise Key: includes IP, optional UserID, and Route
  const identifier = `rate:${req.ip}:${req.userId || "guest"}:${req.route}`
  
  const result = await limiter.limit(identifier)
  
  return result
}
