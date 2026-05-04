import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signToken } from '@/lib/auth/jwt'
import { isJtiRevoked } from '@/lib/auth/blacklist'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    // 1. Verify Refresh Token
    const payload = await verifyToken(refreshToken);
    
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    // 2. CHECK BLACKLIST (JTI-based revocation)
    if (payload.jti && await isJtiRevoked(payload.jti as string)) {
      return NextResponse.json({ error: 'Refresh token revoked' }, { status: 401 })
    }

    // 3. Issue new Access Token
    const accessToken = await signToken({ 
      userId: payload.userId as string,
      role: payload.role as string,
      type: "access"
    }, '15m');

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
