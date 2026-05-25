import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from './lib/utils/domains';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (dashboard routes)
     * - partner (partner portal routes)
     * - assets/images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|partner|images).*)',
  ],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Get hostname (e.g., shivay.home4stay.com, shivay.localhost:3000)
  const host = req.headers.get('host');
  const subdomain = getSubdomain(host);

  // If a valid subdomain exists and it's not a reserved keyword
  if (subdomain && subdomain !== 'www') {
    // Prevent rewriting if already in /property/[slug]
    if (url.pathname.startsWith(`/property/`)) {
      return NextResponse.next();
    }
    
    // We rewrite the request to the property slug route
    // e.g. shivay.home4stay.com/ -> home4stay.com/property/shivay
    // e.g. shivay.home4stay.com/about -> home4stay.com/property/shivay/about
    url.pathname = `/property/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
