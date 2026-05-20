import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized) return auth.response!;

    // 1. Fetch failed logins
    const loginFailures = await prisma.auditLog.findMany({
      where: {
        action: "USER_LOGIN_FAILURE"
      },
      take: 50,
      orderBy: { createdAt: "desc" }
    });

    // 2. Fetch session revocations or administrative actions
    const administrativeAudits = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ["ADMIN_SESSION_REVOCATION", "TOKEN_REFRESH_REVOKED_REUSE_ATTEMPT"]
        }
      },
      take: 50,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalLoginFailures: loginFailures.length,
        totalSuspiciousActions: administrativeAudits.length
      },
      activities: {
        loginFailures,
        administrativeAudits
      }
    });
  } catch (error) {
    console.error("GET Admin Suspicious Activity Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
