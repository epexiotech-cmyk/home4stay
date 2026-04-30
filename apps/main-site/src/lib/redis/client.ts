import { Redis } from '@upstash/redis'

const isProd = process.env.NODE_ENV === 'production'

if (isProd && (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
  throw new Error("MANDATORY: Upstash Redis environment variables are missing in production.")
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})
