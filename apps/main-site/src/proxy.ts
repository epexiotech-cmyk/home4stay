import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from './lib/utils/domains';
import { rateLimit } from "@/lib/security/rateLimiter";

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function proxy(request: NextRequest) {
  console.log(`\n[PROXY] ---> Incoming Request: ${request.nextUrl.pathname}`);
  console.log(`[PROXY] Header 'cookie':`, request.headers.get("cookie"));
  console.log(`[PROXY] request.cookies.getAll():`, JSON.stringify(request.cookies.getAll()));

  // 1. Generate Request Context (Correlation ID, Request ID)
  const requestId = crypto.randomUUID();
  const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();

  // 2. IP Extraction & Trusted Proxy Handling
  let clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                 request.headers.get("x-real-ip") || 
                 "127.0.0.1";
  
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.substring(7);
  }

  // 3. Global Rate Limiting Integration
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rlKey = `global_${clientIp}`;
    const rlResult = await rateLimit({ key: rlKey, limit: 100, windowSeconds: 60 });
    
    if (!rlResult.success) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests, please try again later." }),
        { 
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rlResult.limit.toString(),
            "X-RateLimit-Remaining": rlResult.remaining.toString(),
            "X-RateLimit-Reset": rlResult.resetSeconds.toString(),
            "X-Request-Id": requestId,
          }
        }
      );
    }
  }

  // 4. Subdomain Routing
  let response = NextResponse.next();
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const subdomain = getSubdomain(host);

  if (subdomain && subdomain !== 'www' && !url.pathname.startsWith(`/api/`) && !url.pathname.startsWith(`/admin`) && !url.pathname.startsWith(`/partner`) && !url.pathname.startsWith(`/images`) && !url.pathname.startsWith(`/property/`)) {
    url.pathname = `/property/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    response = NextResponse.rewrite(url);
  }

  // Request Context Headers
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Correlation-Id", correlationId);
  response.headers.set("X-Client-IP", clientIp);
  
  // Security Headers
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  // CORS Policy
  const origin = request.headers.get("origin");
  if (origin && (origin.endsWith("home4stay.com") || origin.includes("localhost"))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Correlation-Id");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers
    });
  }

  response.headers.set("x-middleware-request-x-request-id", requestId);
  response.headers.set("x-middleware-request-x-correlation-id", correlationId);
  response.headers.set("x-middleware-request-x-client-ip", clientIp);

  return response;
}
