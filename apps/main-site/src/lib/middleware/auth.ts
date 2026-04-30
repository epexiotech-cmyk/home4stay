import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

/**
 * handleAuth
 * Manages authentication and RBAC for protected routes.
 * Returns a NextResponse (either a redirect or next()).
 */
export async function handleAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Define login paths and public paths
  const loginPaths = ["/auth/login", "/partner/login", "/admin/login"];
  
  // 2. Skip auth if it's a login page
  if (loginPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Check if the route is protected
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/partner");
  
  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 4. Get token from cookies
  const token = request.cookies.get("token")?.value;

  // 5. Handle redirects for missing tokens
  if (!token) {
    const loginUrl = pathname.startsWith("/admin") 
      ? "/admin/login" 
      : "/partner/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // 6. Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = pathname.startsWith("/admin") 
      ? "/admin/login" 
      : "/partner/login";
    const response = NextResponse.redirect(new URL(loginUrl, request.url));
    response.cookies.delete("token");
    return response;
  }

  // 7. Role-Based Access Control (RBAC)
  const userRole = payload.role as string;
  
  if (pathname.startsWith("/admin")) {
    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(userRole)) {
      // If user is authenticated but doesn't have admin role, redirect to admin login
      // (or potentially an unauthorized page, but following original logic)
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/partner")) {
    const allowedRoles = ["owner", "manager"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }
  }

  return NextResponse.next();
}
