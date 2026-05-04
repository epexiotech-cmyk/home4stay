import 'server-only';
import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on("connect", () => {
      const globalForRedis = global as unknown as { __redis_logged?: boolean };
      if (!globalForRedis.__redis_logged) {
        console.log("✅ Redis connected");
        globalForRedis.__redis_logged = true;
      }
    });

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
    });
  }

  return redis;
}
