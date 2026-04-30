import { NextRequest, NextResponse } from 'next/server'

const isProd = process.env.NODE_ENV === 'production'

/**
 * Generates a cryptographically secure random CSRF token.
 */
export function generateCSRF(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validates the CSRF token from headers against the cookie.
 */
export function validateCSRF(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token')
  const csrfCookie = request.cookies.get('csrf-token')?.value

  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
    return false
  }

  return true
}

/**
 * Attaches the CSRF token to a response via an HTTP-only cookie.
 */
export function setCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set('csrf-token', token, {
    httpOnly: true, // Secure: script cannot access cookie
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  })
}
