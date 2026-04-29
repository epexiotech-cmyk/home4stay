import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const encodedSecret = new TextEncoder().encode(JWT_SECRET)

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    // 1. Verify Refresh Token
    const { payload } = await jwtVerify(refreshToken, encodedSecret, {
      issuer: 'home4stay',
      audience: 'web'
    })
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    // 2. Issue new Access Token
    const accessToken = await new SignJWT({ 
      role: payload.role as string, 
      username: payload.username as string 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('home4stay')
      .setAudience('web')
      .setExpirationTime('15m')
      .sign(encodedSecret)

    // 3. Set Cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn("Refresh API Error:", err);
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }
}
