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
    throw new AppError("Forbidden: Only property owners can check launch status", 403, "FORBIDDEN");
  }

  const result = await PartnerService.getLaunchReadiness(auth.propertyId!);
  
  // Generate secure preview token
  const crypto = await import("crypto");
  const draftToken = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "secret")
    .update(result.slug)
    .digest("hex")
    .slice(0, 16);

  return successResponse({ 
    report: result.report,
    draftToken,
    slug: result.slug
  });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized: Missing active session", 401, "UNAUTHORIZED");
  }

  if (auth.role !== "owner") {
    throw new AppError("Forbidden: Only property owners can activate a property", 403, "FORBIDDEN");
  }

  const result = await PartnerService.launchProperty(auth.propertyId!, auth.userId);
  return successResponse({
    success: true,
    message: "Congratulations! Your property has been activated and published successfully.",
    activatedAt: new Date().toISOString()
  });
});
