import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "../database/prisma";
import { isJtiRevoked } from "./blacklist";

export interface AuthResult {
  authorized: boolean;
  response?: NextResponse;
  userId?: string;
  role?: string;
  propertyId?: string;
  propertySlug?: string;
  subdomain?: string;
  sessionToken?: string;
}

/**
 * requireAuth
 * Centralized session and credential validation: Checks token signature, expiration, JTI blacklist,
 * and verifies that the cryptographically linked sessionToken resides in PostgreSQL and is active.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("access-token")?.value || request.cookies.get("token")?.value;

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Missing authentication token" }, { status: 401 })
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Invalid or expired session signature" }, { status: 401 })
    };
  }

  // Check JTI Blacklist (Redis)
  const jti = payload.jti as string;
  if (jti && await isJtiRevoked(jti)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Session has been logged out or revoked" }, { status: 401 })
    };
  }

  const userId = payload.userId as string;
  const sessionToken = payload.sessionToken as string;

  if (!sessionToken) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Session configuration invalid" }, { status: 401 })
    };
  }

  // STRICT SESSION ENFORCEMENT: Only active DB sessions are permitted to query protected APIs
  const session = await prisma.session.findUnique({
    where: { sessionToken }
  });

  if (!session || !session.isActive) {
    console.warn(`[SECURITY] Suspicious token access: Token with session ${sessionToken} is active but has no active DB session.`);
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Session is inactive or revoked" }, { status: 401 })
    };
  }

  if (new Date(session.expiresAt) < new Date()) {
    console.warn(`[SECURITY] Expired session access attempt: Session ${sessionToken} expired in DB.`);
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Session expired" }, { status: 401 })
    };
  }

  return {
    authorized: true,
    userId,
    role: payload.role as string,
    propertyId: payload.propertyId as string,
    propertySlug: payload.propertySlug as string,
    subdomain: payload.subdomain as string,
    sessionToken
  };
}

/**
 * requireRole
 * Standardized RBAC role checks. Decodes active session and checks role bounds.
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth;

  const userRole = auth.role as string;
  if (!allowedRoles.includes(userRole)) {
    console.warn(`[SECURITY] RBAC Forbidden: User ${auth.userId} with role ${userRole} attempted to access allowedRoles: ${allowedRoles.join(",")}`);
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    };
  }

  return auth;
}

/**
 * requirePropertyAccess
 * Strict tenant isolation check. Validates that the active user possesses a valid PropertyUserAccess mapping
 * for the requested property. Admins and Super Admins bypass this check globally.
 */
export async function requirePropertyAccess(request: NextRequest, targetPropertyId: string): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth;

  // Global administrative access override
  if (["admin", "super_admin"].includes(auth.role || "")) {
    return auth;
  }

  // Strict property query: user must be explicitly assigned to the target property in the junction table
  const access = await prisma.propertyUserAccess.findFirst({
    where: {
      userId: auth.userId,
      propertyId: targetPropertyId
    }
  });

  if (!access) {
    console.warn(`[SECURITY ALERT] Tenant isolation violation: User ${auth.userId} (${auth.role}) attempted unauthorized access to property ${targetPropertyId}`);
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden: You do not have access to this property" }, { status: 403 })
    };
  }

  return auth;
}

/**
 * requireOwnership
 * Ownership verification: Ensures that the user is mapped to the property via PropertyUserAccess with the 'owner' role.
 * Automatically falls back to the database property.ownerId field for complete legacy compatibility.
 * Admins and Super Admins bypass this check globally.
 */
export async function requireOwnership(request: NextRequest, targetPropertyId: string): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth;

  // Global administrative access override
  if (["admin", "super_admin"].includes(auth.role || "")) {
    return auth;
  }

  // Primary Check: PropertyUserAccess table with role === 'owner'
  const access = await prisma.propertyUserAccess.findFirst({
    where: {
      userId: auth.userId,
      propertyId: targetPropertyId,
      role: "owner"
    }
  });

  if (access) {
    return auth;
  }

  // Backup/Fallback Check: property.owner_id column for complete backward compatibility
  const property = await prisma.property.findUnique({
    where: { id: targetPropertyId }
  });

  if (property && property.ownerId === auth.userId) {
    return auth;
  }

  console.warn(`[SECURITY ALERT] Ownership validation failed: User ${auth.userId} (${auth.role}) attempted unauthorized owner action on property ${targetPropertyId}`);
  return {
    authorized: false,
    response: NextResponse.json({ error: "Forbidden: Property ownership required" }, { status: 403 })
  };
}
