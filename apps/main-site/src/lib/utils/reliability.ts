import { AppError } from "../errors/handler"
import { logger } from "../observability/logger"

/**
 * System Reliability Guards
 */

/**
 * Wraps a promise with a timeout.
 * Prevents memory leaks by ensuring timers are always cleared.
 */
export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number = 3000,
  requestId?: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new AppError("Request timeout exceeded", 408, "REQUEST_TIMEOUT", requestId))
        }, ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Retries a promise-based function with Exponential Backoff + Jitter.
 * 
 * ⚠️ CRITICAL RULE: 
 * - Use ONLY for external API calls or network-dependent operations.
 * - NEVER use for database transactions, idempotency locks, or critical writes.
 * - Transactions must handle their own internal consistency.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  baseDelay: number = 100,
  requestId: string = "unknown"
): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      // Final attempt failed
      if (i === attempts - 1) break

      // Exponential Backoff with Jitter
      const exp = baseDelay * Math.pow(2, i)
      const jitter = Math.random() * 100
      // CAP: Max delay is strictly 2 seconds to prevent request starvation
      const delay = Math.min(exp + jitter, 2000)

      await logger({
        level: i === attempts - 2 ? "error" : "warn", // Escalate only on last retry
        event: i === attempts - 2 ? "RETRY_FINAL_ATTEMPT" : "RETRY_ATTEMPT",
        message: `Retry attempt ${i + 1}/${attempts} following failure.`,
        requestId,
        durationMs: delay
      })

      await new Promise(res => setTimeout(res, delay))
    }
  }

  throw lastError
}
