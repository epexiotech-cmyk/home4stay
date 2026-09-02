import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { revokeJti } from "@/lib/auth/blacklist";

/**
 * GET
 * List all active sessions across all users.
 * Accessible only by administrators.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized) return auth.response!;

    const sessions = await prisma.session.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("GET Admin Sessions Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST
 * Revoke a specific active session.
 * Accessible only by administrators.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json({ error: "sessionToken is required" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 1. Deactivate session in PostgreSQL
    await prisma.session.update({
      where: { sessionToken },
      data: { isActive: false }
    });

    // 2. Blacklist session JTI in Redis (if mapped)
    const expirySeconds = Math.max(
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      1
    );
    await revokeJti(sessionToken, expirySeconds, auth.userId);

    // 3. Log security audit event
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "ADMIN_SESSION_REVOCATION",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "unknown",
        metadata: { revokedSessionToken: sessionToken, adminUserId: auth.userId }
      }
    });

    return NextResponse.json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    console.error("POST Revoke Session Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
