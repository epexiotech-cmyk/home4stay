import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Skip middleware for login page and non-admin routes
  if (pathname === '/admin/login' || !pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 2. Check for auth cookie
  const authCookie = request.cookies.get('admin-auth')

  // 3. Redirect to login if not authenticated
  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/:path*',
}
