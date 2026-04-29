import { NextResponse, NextRequest } from 'next/server'
import { decodeJwt } from 'jose'

const isDev = process.env.NODE_ENV !== 'production'
const CLOCK_SKEW = 60 // 60 seconds

interface JWTPayload {
  role?: string
  exp?: number
  iss?: string
  aud?: string | string[]
}

/**
 * softValidate
 * Structural and sanity check for JWT payload without crypto
 */
function softValidate(payload: JWTPayload | null, requiredRole: string): boolean {
  if (!payload) return false

  // 1. Role Check
  if (!payload.role || !['admin', 'partner'].includes(payload.role)) return false
  if (payload.role !== requiredRole) return false

  // 2. Issuer & Audience Check
  if (payload.iss !== 'home4stay' || payload.aud !== 'web') return false

  // 3. Expiry with Clock Skew Tolerance
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now - CLOCK_SKEW) return false

  return true
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. PERFORMANCE: Immediate bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. DEFINE GUARDS
  const isAdminPath = pathname.startsWith('/admin')
  const isPartnerPath = pathname.startsWith('/partner')

  if (isAdminPath || isPartnerPath) {
    if (pathname === '/admin/login' || pathname === '/partner/login') {
      return NextResponse.next()
    }

    const accessToken = request.cookies.get('access-token')?.value
    const refreshToken = request.cookies.get('refresh-token')?.value
    const requiredRole = isAdminPath ? 'admin' : 'partner'
    const loginPath = isAdminPath ? '/admin/login' : '/partner/login'

    // Try to decode and validate
    let payload: JWTPayload | null = null
    try {
      if (accessToken) payload = decodeJwt(accessToken) as JWTPayload
    } catch (err) {
      if (isDev) console.warn('⚠️ Proxy: Failed to decode access token', err)
    }

    // 3. AUTH DECISION
    const isValid = softValidate(payload, requiredRole)

    if (isValid) {
      return NextResponse.next()
    }

    // If invalid but has refresh token -> allow for silent refresh in API
    if (refreshToken) {
      if (isDev) console.log('🕒 Proxy: Access token missing/expired, but refresh token exists.')
      return NextResponse.next()
    }

    // Completely unauthorized
    if (isDev) console.warn(`🚫 Proxy: Unauthorized access attempt to ${pathname}`)
    const response = NextResponse.redirect(new URL(loginPath, request.url))
    response.cookies.delete('access-token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
}
