import 'server-only';
import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";

interface AuditParams {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status: "SUCCESS" | "FAILURE";
  metadata?: Record<string, unknown>;
  request?: NextRequest | Request;
}

/**
 * Service to record immutable operational audit logs to PostgreSQL database.
 */
export class AuditLogService {
  /**
   * Logs a security or operations activity to the central AuditLog system.
   */
  static async logAction(params: AuditParams): Promise<void> {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (params.request) {
      const headers = params.request.headers;
      
      // Extract IP address safely from forwarded headers
      ipAddress = 
        ("ip" in params.request ? (params.request as { ip?: string }).ip : null) || 
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
        headers.get("x-real-ip") || 
        "127.0.0.1";

      // Extract User Agent
      userAgent = headers.get("user-agent") || "unknown-agent";
    }

    try {
      const record = await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          resourceType: params.resourceType || null,
          resourceId: params.resourceId || null,
          ipAddress,
          userAgent,
          status: params.status,
          metadata: (params.metadata || {}) as import("@prisma/client").Prisma.InputJsonValue
        }
      });

      logger({
        level: "info",
        event: "AUDIT_LOG_RECORDED",
        message: `Audit recorded: ${params.action} on ${params.resourceType || "system"} (${params.status}) (Log ID: ${record.id})`,
        requestId: "audit-system"
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger({
        level: "error",
        event: "AUDIT_LOG_WRITE_FAILED",
        message: `Failed to write audit action "${params.action}": ${msg}`,
        requestId: "audit-system"
      });
    }
  }
}
