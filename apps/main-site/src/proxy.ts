import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "@/lib/utils/domains";
import { verifyToken } from "@/lib/auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  // --- AUTHENTICATION LOGIC (from middleware.ts.bak) ---
  // 1. Define login paths
  const loginPaths = ["/auth/login", "/partner/login", "/admin/login"];
  
  // Only apply auth checks if accessing /admin or /partner routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
    if (!loginPaths.includes(pathname)) {
      const token = request.cookies.get("token")?.value;

      if (!token) {
        const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/partner/login";
        return NextResponse.redirect(new URL(loginUrl, request.url));
      }

      const payload = await verifyToken(token);
      if (!payload) {
        const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/partner/login";
        const response = NextResponse.redirect(new URL(loginUrl, request.url));
        response.cookies.delete("token");
        return response;
      }

      const userRole = payload.role as string;
      
      if (pathname.startsWith("/admin")) {
        const allowedRoles = ["admin", "super_admin"];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      }

      if (pathname.startsWith("/partner")) {
        const allowedRoles = ["owner", "manager"];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/partner/login", request.url));
        }
      }
    }
    // Return early if it's an admin/partner route so it doesn't get rewritten by subdomain logic
    return NextResponse.next();
  }

  // --- SUBDOMAIN ROUTING LOGIC (from proxy.ts) ---
  const host = request.headers.get("host");
  const subdomain = getSubdomain(host);

  if (subdomain && subdomain !== "www") {
    // Prevent rewriting if already in /property/[slug]
    if (url.pathname.startsWith("/property/")) {
      return NextResponse.next();
    }
    
    // Rewrite the request to the property slug route
    url.pathname = `/property/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
