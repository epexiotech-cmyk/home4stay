import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { AdminService } from "@/lib/services/adminService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["super_admin"]);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const result = await AdminService.getFinanceDashboardStats();
  return successResponse(result);
});
