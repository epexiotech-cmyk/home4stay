import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

/**
 * requireRole
 * Standardized RBAC helper for API routes.
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const token = request.cookies.get("access-token")?.value || request.cookies.get("token")?.value;

  if (!token) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }) 
    };
  }

  // 3. CHECK BLACKLIST (JTI-based revocation)
  const jti = payload.jti as string;
  if (jti) {
    const { isJtiRevoked } = await import("./blacklist");
    if (await isJtiRevoked(jti)) {
      return { 
        authorized: false, 
        response: NextResponse.json({ error: "Session revoked" }, { status: 401 }) 
      };
    }
  }

  const userRole = payload.role as string;
  if (!allowedRoles.includes(userRole)) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 }) 
    };
  }

  return { 
    authorized: true, 
    userId: payload.userId as string, 
    role: userRole 
  };
}
