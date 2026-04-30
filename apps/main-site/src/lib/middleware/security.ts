import { NextRequest, NextResponse } from 'next/server'
import { adaptiveRateLimit } from './rateLimit'
import { validateCSRF } from '../security/csrf'
import { CSRF_EXCLUDED } from '../security/config'

/**
 * getClientIp
 * Helper to extract client IP safely in Edge Runtime.
 */
function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

/**
 * handleSecurity
 * Manages rate limiting, CSRF validation, and initial security checks.
 * Returns a NextResponse if the request should be blocked, otherwise null.
 */
export async function handleSecurity(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const ip = getClientIp(request)
  const requestId = crypto.randomUUID()

  // API Security Gate
  if (pathname.startsWith('/api')) {
    
    // 1. Adaptive Rate Limiting
    const { success, limit, remaining, reset } = await adaptiveRateLimit({
      ip,
      route: pathname
    })

    if (!success) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded", requestId } 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          } 
        }
      )
    }

    // 2. CSRF Validation
    const isProtectedMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    const isExcludedRoute = CSRF_EXCLUDED.some(excluded => pathname.startsWith(excluded))

    if (isProtectedMethod && !isExcludedRoute) {
      if (!validateCSRF(request)) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: { code: "CSRF_ERROR", message: "Invalid or missing CSRF token", requestId } 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  return null
}
