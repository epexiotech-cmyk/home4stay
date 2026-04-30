import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt } from 'jose'

const isDev = process.env.NODE_ENV !== 'production'
const CLOCK_SKEW = 60 // 60 seconds

interface JWTPayload {
  role?: string
  exp?: number
  iss?: string
  aud?: string | string[]
}

function softValidate(payload: JWTPayload | null, requiredRole: string): boolean {
  if (!payload) return false
  if (!payload.role || !['admin', 'partner'].includes(payload.role)) return false
  if (payload.role !== requiredRole) return false
  if (payload.iss !== 'home4stay' || payload.aud !== 'web') return false
  
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now - CLOCK_SKEW) return false

  return true
}

/**
 * handleAuth
 * Manages role-based route protection for admin and partner paths.
 */
export async function handleAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

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

    let payload: JWTPayload | null = null
    try {
      if (accessToken) payload = decodeJwt(accessToken) as JWTPayload
    } catch (err) {
      if (isDev) console.warn('⚠️ Auth: Failed to decode access token', err)
    }

    const isValid = softValidate(payload, requiredRole)

    if (isValid) {
      return NextResponse.next()
    }

    if (refreshToken) {
      if (isDev) console.log('🕒 Auth: Access token missing/expired, but refresh token exists.')
      return NextResponse.next()
    }

    if (isDev) console.warn(`🚫 Auth: Unauthorized access attempt to ${pathname}`)
    const response = NextResponse.redirect(new URL(loginPath, request.url))
    response.cookies.delete('access-token')
    return response
  }

  return NextResponse.next()
}
