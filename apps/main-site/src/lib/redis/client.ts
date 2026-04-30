import Redis from "ioredis"

// NOTE:
// Redis runs inside WSL Ubuntu.
// Always ensure Redis is started before running the app:
// sudo service redis-server start

let redis: Redis | null = null

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })

    redis.on("connect", () => {
      console.log("✅ Redis connected")
    })

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message)
    })
  }

  return redis
}
