import { NextRequest } from "next/server"
import { handleSecurity } from "@/lib/middleware/security"
import { handleAuth } from "@/lib/middleware/auth"
import { SECURITY_HEADERS } from "@/lib/security/config"

export default async function proxy(req: NextRequest) {
  // 1. Run Security Layer
  const securityResponse = await handleSecurity(req)
  if (securityResponse) return securityResponse

  // 2. Run Auth Layer
  const response = await handleAuth(req)
  
  // 3. Apply Global Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Add unique request ID if not present
  if (!response.headers.has('x-request-id')) {
    response.headers.set('x-request-id', crypto.randomUUID())
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
  ],
}
