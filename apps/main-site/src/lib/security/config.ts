/**
 * Enterprise Security Configuration
 */

export const RATE_LIMIT_CONFIG: Record<string, { limit: number; window: number }> = {
  "/api/auth/login": { limit: 5, window: 60 },
  "/api/auth/register": { limit: 3, window: 3600 }, // 3 attempts per hour
  "/api/login": { limit: 5, window: 60 },
  "/api/contact": { limit: 10, window: 60 },
  "/api/property": { limit: 50, window: 60 },
  "default": { limit: 100, window: 60 }
}

export const CSRF_EXCLUDED = [
  "/api/auth/login",
  "/api/login",
  "/api/auth/register",
  "/api/webhook"
]

export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
