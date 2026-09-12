import { NextRequest } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  // Fetch audit logs where resourceType is PropertyUserAccess 
  // In Prisma with PostgreSQL, filtering inside a Json field can be tricky across versions. 
  // We'll fetch all logs for PropertyUserAccess and filter in-memory since the volume per tenant is small.
  const rawLogs = await prisma.auditLog.findMany({
    where: {
      resourceType: "PropertyUserAccess",
    },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const propertyLogs = rawLogs.filter(log => {
    const meta = log.metadata as any;
    return meta?.propertyId === propertyId;
  });

  const formattedLogs = propertyLogs.map(log => ({
    id: log.id,
    staffName: log.user?.name || "System",
    action: log.action.replace("STAFF_", "").replace("_", " "),
    target: (log.metadata as any)?.email || (log.metadata as any)?.removedUserId || "Staff Member",
    time: log.createdAt.toISOString()
  }));

  return successResponse({ logs: formattedLogs });
});
