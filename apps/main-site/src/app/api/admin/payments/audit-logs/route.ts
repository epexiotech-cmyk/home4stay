import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Admin/Super Admin only)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all payment audit logs
    const logs = await prisma.paymentAuditLog.findMany({
      include: {
        transaction: {
          include: {
            property: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const payload = logs.map(log => ({
      id: log.id,
      transactionId: log.transactionId,
      action: log.action,
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      performedBy: log.performedBy,
      metadata: log.metadata,
      createdAt: log.createdAt,
      propertyName: log.transaction?.property?.title || "System-wide",
      utrNumber: log.transaction?.utrNumber || null
    }));

    return NextResponse.json({
      success: true,
      logs: payload
    });

  } catch (error) {
    console.error("[ADMIN_PAYMENTS_AUDIT_LOGS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
