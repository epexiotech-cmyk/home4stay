import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear all auth cookies
  response.cookies.set('access-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })

  response.cookies.set('refresh-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })

  return response
}
