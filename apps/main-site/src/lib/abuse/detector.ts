import { getRedis } from "../server/redis"
const redis = getRedis()

import { logger } from "../observability/logger"

const ABUSE_THRESHOLD_BLOCK = 5 
const ABUSE_THRESHOLD_DELAY = 3
const BLOCK_DURATION = 600

/**
 * Tracks activity and applies progressive throttling.
 */
export async function trackAbuse(ip: string, event: string, requestId: string) {
  const key = `abuse:${ip}:${event}`
  
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, BLOCK_DURATION)
  }

  if (count >= ABUSE_THRESHOLD_BLOCK) {
    await logger({
      level: 'warn',
      event: 'ABUSE_BLOCK',
      message: `IP ${ip} blocked.`,
      requestId,
      ip
    })
    return "BLOCK"
  }

  if (count >= ABUSE_THRESHOLD_DELAY) {
    // Add artificial delay (500-1000ms)
    await new Promise(res => setTimeout(res, 500 + Math.random() * 500))
    return "DELAY"
  }

  return "ALLOW"
}

export async function isBlocked(ip: string, event: string) {
  const key = `abuse:${ip}:${event}`
  const raw = await redis.get(key)
  const count = raw ? parseInt(raw, 10) : 0
  return count >= ABUSE_THRESHOLD_BLOCK
}
