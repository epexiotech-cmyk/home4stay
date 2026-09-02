import { NextRequest } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { PartnerDashboardService } from "@/lib/services/partnerDashboardService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const propertyId = request.nextUrl.searchParams.get("propertyId") || "";
  if (!propertyId) {
    throw new AppError("Missing propertyId parameter", 400, "BAD_REQUEST");
  }

  // 1. STRICT TENANT ISOLATION CHECK against PostgreSQL
  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const financials = await PartnerDashboardService.getFinancials(propertyId);

  return successResponse(financials);
});
