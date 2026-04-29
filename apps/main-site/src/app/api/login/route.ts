import { NextResponse, NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { rateLimit, setCsrfToken, auditLog } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const encodedSecret = new TextEncoder().encode(JWT_SECRET)

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  
  // 1. Rate Limiting
  if (!rateLimit(ip, 5)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    
    // 2. Input Validation
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 })
    }

    const { username, password } = validation.data

    // 3. Credential Validation
    let role: 'admin' | 'partner' | null = null
    if (username === 'admin' && password === '123456') {
      role = 'admin'
    } else if (username === 'partner' && password === 'partner123') {
      role = 'partner'
    }

    if (!role) {
      auditLog(username, 'unknown', 'LOGIN_FAILED', { ip })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // 4. Create Tokens
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

    // 5. Success Response
    const response = NextResponse.json({ success: true, role })
    
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Set CSRF token for future requests
    setCsrfToken(response)

    auditLog(username, role, 'LOGIN_SUCCESS', { ip })

    return response
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn("Login API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
