import { NextResponse, NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { generateCSRF, setCsrfCookie } from '@/lib/security'
import { logger } from '@/lib/observability/logger'
import { withErrorHandler, AppError } from '@/lib/errors/handler'
import { trackAbuse, isBlocked } from '@/lib/abuse/detector'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const encodedSecret = new TextEncoder().encode(JWT_SECRET)

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

/**
 * ENTERPRISE LOGIN HANDLER
 */
async function loginHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  
  // 1. ABUSE CHECK
  if (await isBlocked(ip, 'login')) {
    throw new AppError("Your IP has been temporarily blocked due to multiple failed login attempts.", 429, "IP_BLOCKED")
  }

  const body = await request.json()
  
  // 2. INPUT VALIDATION
  const validation = LoginSchema.safeParse(body)
  if (!validation.success) {
    throw new AppError("Invalid input format", 400, "VALIDATION_ERROR")
  }

  const { username, password } = validation.data

  // 3. CREDENTIAL VALIDATION
  let role: 'admin' | 'partner' | null = null
  if (username === 'admin' && password === '123456') {
    role = 'admin'
  } else if (username === 'partner' && password === 'partner123') {
    role = 'partner'
  }

  if (!role) {
    // 4. TRACK FAILED ATTEMPT
    await trackAbuse(ip, 'login', requestId)
    
    await logger({
      level: 'warn',
      event: 'LOGIN_FAILED',
      message: `Failed login attempt for user: ${username}`,
      ip,
      requestId,
      route: '/api/login',
      statusCode: 401
    })
    
    throw new AppError("Invalid credentials", 401, "AUTH_FAILED")
  }

  // 5. CREATE TOKENS
  const accessToken = await new SignJWT({ role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('home4stay')
    .setAudience('web')
    .setExpirationTime('15m')
    .sign(encodedSecret)

  const refreshToken = await new SignJWT({ role, username, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('home4stay')
    .setAudience('web')
    .setExpirationTime('7d')
    .sign(encodedSecret)

  // 6. SUCCESS RESPONSE
  const response = NextResponse.json({ success: true, role })
  
  response.cookies.set('access-token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict', // Enterprise hardening
    maxAge: 15 * 60,
    path: '/',
  })

  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  // 7. SECURE CSRF
  const csrfToken = generateCSRF()
  setCsrfCookie(response, csrfToken)

  return response
}

export const POST = withErrorHandler(loginHandler)
