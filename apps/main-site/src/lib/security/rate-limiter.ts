import { getRedis } from "../server/redis";

const redis = getRedis();

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 5, windowSeconds: 600 } // 10 minutes
) {
  const redisKey = `ratelimit:${key}`;
  
  const count = await redis.incr(redisKey);
  
  if (count === 1) {
    await redis.expire(redisKey, config.windowSeconds);
  }
  
  return count <= config.maxRequests;
}
