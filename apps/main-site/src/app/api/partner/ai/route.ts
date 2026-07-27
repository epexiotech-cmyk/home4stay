import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PartnerService } from "@/lib/services/partnerService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId || !auth.propertyId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const body = await request.json();
  const { action, context = {} } = body;

  const result = await PartnerService.handleAiAction(auth.propertyId, action, context);

  return successResponse(result);
});
