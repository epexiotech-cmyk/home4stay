import { getRedis } from "./redis";
import { logger } from "../observability/logger";

const CACHE_PREFIX = "h4s:";

/**
 * cacheGet
 * Resolves a cached string/JSON object from Redis.
 * If Redis is down, fails safe, returning null to trigger a native database query fallback.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;

    const data = await redis.get(`${CACHE_PREFIX}${key}`);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger({
      level: "warn",
      event: "CACHE_GET_FAILURE",
      message: `Redis cacheGet exception for key ${key}: ${errorMessage}`,
      requestId: "system",
    });
    return null; // Fail-safe (cache miss)
  }
}

/**
 * cacheSet
 * Caches an object in Redis with a TTL.
 * Fails safe and silent if Redis is offline.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis) return false;

    const stringified = JSON.stringify(value);
    await redis.set(`${CACHE_PREFIX}${key}`, stringified, "EX", Math.max(ttlSeconds, 1));
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger({
      level: "warn",
      event: "CACHE_SET_FAILURE",
      message: `Redis cacheSet exception for key ${key}: ${errorMessage}`,
      requestId: "system",
    });
    return false; // Fail-safe
  }
}

/**
 * cacheInvalidate
 * Deletes a cached entry or sweeps cache keys by pattern.
 * Fails safe if Redis is offline.
 */
export async function cacheInvalidate(keyOrPattern: string): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis) return false;

    if (keyOrPattern.includes("*")) {
      // Sweep multiple keys matching a pattern
      const keys = await redis.keys(`${CACHE_PREFIX}${keyOrPattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(`${CACHE_PREFIX}${keyOrPattern}`);
    }
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger({
      level: "warn",
      event: "CACHE_INVALIDATE_FAILURE",
      message: `Redis cacheInvalidate exception for keyOrPattern ${keyOrPattern}: ${errorMessage}`,
      requestId: "system",
    });
    return false; // Fail-safe
  }
}
