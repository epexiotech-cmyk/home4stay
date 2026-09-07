import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";
import { signToken } from "@/lib/auth/jwt";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export const GET = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const activeUserId = auth.userId;
  if (!activeUserId) throw new AppError("Missing user context.", 401, "UNAUTHORIZED");

  const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mutation attempt restricted.", 403, "FORBIDDEN");
  }

  // Generate a short-lived token (1 hour) for draft preview
  const previewToken = await signToken({ propertyId, preview: true }, "1h");

  return successResponse({ previewToken }, { status: 200 });
});
