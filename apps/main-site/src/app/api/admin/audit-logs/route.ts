import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized) return auth.response!;

    const auditLogs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, auditLogs });
  } catch (error) {
    console.error("GET Admin Audit Logs Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
