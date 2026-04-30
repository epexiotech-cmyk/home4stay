/**
 * Idempotency Layer with Distributed Locking (Ownership-Safe)
 * Prevents duplicate processing and race conditions.
 * 
 * PHILOSOPHY:
 * - Idempotency cache is ADVISORY, not authoritative.
 * - System correctness must NEVER depend solely on Redis availability.
 * - Database transactions are the final source of truth.
 * - Cache corruption or Redis failure triggers safe recovery/re-processing.
 */
import crypto from "crypto"
import { redis } from "../redis/client"
import { logger } from "../observability/logger"
import { AppError } from "../errors/handler"

const PREFIX = {
  LOCK: "lock:idempotency",
  CACHE: "idempotency",
}

const TTL = {
  LOCK_DEFAULT: 30,
  RESPONSE: 86400, // 24 hours
}

const ROUTE_LOCK_TTL: Record<string, number> = {
  "/api/bookings": 60,
  "/api/payment": 90,
  "/api/login": 15,
}

/**
 * SAFE REDIS WRAPPER
 * Standardizes error handling and ensures critical paths fail fast.
 */
async function safeRedis<T>(
  fn: () => Promise<T>,
  { critical, requestId }: { critical: boolean; requestId?: string }
): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    await logger({
      level: "error",
      event: "REDIS_FAILURE",
      message: err instanceof Error ? err.message : "Unknown Redis error",
      requestId: requestId || "unknown",
    })

    if (critical) {
      throw new AppError("Infrastructure service temporarily unavailable", 503, "INFRA_FAILURE")
    }

    return null
  }
}

export async function getIdempotencyResponse<T>(userId: string, key: string, requestId?: string): Promise<T | null> {
  const fullKey = `${PREFIX.CACHE}:${userId}:${key}`
  const raw = await safeRedis(() => redis.get(fullKey), { critical: false, requestId })
  
  if (!raw) return null

  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T
  } catch (err) {
    await logger({
      level: "error",
      event: "CACHE_PARSE_ERROR",
      message: `Failed to parse idempotency cache for ${fullKey}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      requestId: requestId || "unknown",
    })
    
    // Purge corrupted key to prevent repeated failures
    await safeRedis(() => redis.del(fullKey), { critical: false, requestId })
    
    return null
  }
}

export async function setIdempotencyResponse(userId: string, key: string, response: unknown, requestId?: string) {
  const fullKey = `${PREFIX.CACHE}:${userId}:${key}`
  await safeRedis(
    () => redis.set(fullKey, JSON.stringify(response), { ex: TTL.RESPONSE }),
    { critical: false, requestId }
  )
}

/**
 * Acquires a distributed lock with ownership safety.
 * Returns { acquired: boolean, lockValue?: string }
 */
export async function acquireIdempotencyLock(userId: string, key: string, route: string = "default", requestId?: string) {
  const lockKey = `${PREFIX.LOCK}:${userId}:${key}`
  const lockValue = crypto.randomUUID()
  const ttl = ROUTE_LOCK_TTL[route] || TTL.LOCK_DEFAULT

  const acquired = await safeRedis(
    () => redis.set(lockKey, lockValue, { nx: true, ex: ttl }),
    { critical: true, requestId } // Locking is CRITICAL for data consistency
  )
  
  return {
    acquired: !!acquired,
    lockValue: acquired ? lockValue : undefined
  }
}

/**
 * Releases the distributed lock only if the caller owns it.
 */
export async function releaseIdempotencyLock(userId: string, key: string, lockValue: string, requestId?: string) {
  const lockKey = `${PREFIX.LOCK}:${userId}:${key}`
  
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `

  await safeRedis(
    () => redis.eval(luaScript, [lockKey], [lockValue]),
    { critical: false, requestId } // Failure to release lock will eventually expire anyway
  )
}
