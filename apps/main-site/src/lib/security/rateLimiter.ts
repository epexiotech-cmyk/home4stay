import { getRedis } from "../server/redis";
import { logger } from "../observability/logger";

interface RateLimitConfig {
  key: string;
  limit: number;      // max requests
  windowSeconds: number; // timeframe
}

// Memory fallback store for localized in-memory rate limiting during Redis outages
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

/**
 * rateLimit
 * Verifies if an action is within allowed rate limit thresholds.
 * Resilient to Redis outages, falling back automatically to in-memory counters.
 */
export async function rateLimit(config: RateLimitConfig): Promise<{ success: boolean; limit: number; remaining: number; resetSeconds: number }> {
  const { key, limit, windowSeconds } = config;
  const redisKey = `rl:${key}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const redis = getRedis();
    if (!redis) {
      throw new Error("Redis client unavailable");
    }

    // Use a transaction atomic pipeline for sliding-window or simple fixed-window rate limiting
    const current = await redis.get(redisKey);
    if (!current) {
      await redis.set(redisKey, "1", "EX", windowSeconds);
      return { success: true, limit, remaining: limit - 1, resetSeconds: windowSeconds };
    }

    const count = parseInt(current, 10);
    if (count >= limit) {
      const ttl = await redis.ttl(redisKey);
      return { success: false, limit, remaining: 0, resetSeconds: Math.max(ttl, 1) };
    }

    const newCount = await redis.incr(redisKey);
    const ttl = await redis.ttl(redisKey);
    return { 
      success: newCount <= limit, 
      limit, 
      remaining: Math.max(limit - newCount, 0), 
      resetSeconds: Math.max(ttl, 1) 
    };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // -------------------------------------------------------------
    // HIGH-RESILIENCE IN-MEMORY FALLBACK GATEWAY
    // -------------------------------------------------------------
    logger({
      level: "warn",
      event: "RATE_LIMIT_REDIS_FAILURE",
      message: `Redis rate limiting failed, falling back to local memory store: ${errorMessage}`,
      requestId: "system",
    });

    const memoryEntry = memoryStore.get(key);
    
    // Clean up expired entry
    if (memoryEntry && now > memoryEntry.expiresAt) {
      memoryStore.delete(key);
    }

    const entry = memoryStore.get(key) || { count: 0, expiresAt: now + windowSeconds };
    
    if (entry.count >= limit) {
      return { 
        success: false, 
        limit, 
        remaining: 0, 
        resetSeconds: Math.max(entry.expiresAt - now, 1) 
      };
    }

    entry.count += 1;
    memoryStore.set(key, entry);

    return { 
      success: true, 
      limit, 
      remaining: Math.max(limit - entry.count, 0), 
      resetSeconds: Math.max(entry.expiresAt - now, 1) 
    };
  }
}
