import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export interface LogAuditDto {
  userId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Prisma.InputJsonValue;
}

export class AuditRepository {
  /**
   * Persist a secure compliance audit log entry in the database.
   */
  async log(data: LogAuditDto) {
    try {
      console.log(`[AuditRepository] Logging audit event: ${data.action} | Status: ${data.status}`);
      return await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          resourceType: data.resourceType || null,
          resourceId: data.resourceId || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          status: data.status,
          metadata: data.metadata || undefined
        }
      });
    } catch (error) {
      console.error("[AuditRepository] Failed to write audit log to database:", error);
      // We do not throw this error to prevent audit logging failures from breaking critical login operations,
      // but we log it heavily to stdout/console.
      return null;
    }
  }
}
