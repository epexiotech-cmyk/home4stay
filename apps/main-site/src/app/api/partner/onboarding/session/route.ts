import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PartnerService } from "@/lib/services/partnerService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized: Missing active session", 401, "UNAUTHORIZED");
  }

  if (auth.role !== "owner") {
    throw new AppError("Forbidden: Only property owners can access onboarding", 403, "FORBIDDEN");
  }

  const propertyId = auth.propertyId;
  if (!propertyId) {
    throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
  }

  const session = await PartnerService.getOnboardingSession(propertyId);
  return successResponse({ session });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized: Missing active session", 401, "UNAUTHORIZED");
  }

  if (auth.role !== "owner") {
    throw new AppError("Forbidden: Only property owners can save onboarding states", 403, "FORBIDDEN");
  }

  const propertyId = auth.propertyId;
  if (!propertyId) {
    throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
  }

  const body = await request.json();
  const { stepId, data, status, currentStep } = body;

  await PartnerService.updateOnboardingSession(propertyId, { stepId, data, status, currentStep });
  
  const session = await PartnerService.getOnboardingSession(propertyId);
  return successResponse({ session });
});
