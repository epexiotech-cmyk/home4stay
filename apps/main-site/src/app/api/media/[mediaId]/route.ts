import { NextRequest } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { MediaService } from "@/lib/services/mediaService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

interface ContextProps {
  params: Promise<{ mediaId: string }>;
}

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { mediaId } = resolvedParams;

  const asset = await MediaService.findById(mediaId);
  if (!asset) {
    throw new AppError("Media asset not found", 404, "NOT_FOUND");
  }

  // 2. STRICT TENANT ISOLATION CHECK against PostgreSQL junction table
  const auth = await requirePropertyAccess(request, asset.propertyId);
  if (!auth.authorized) return auth.response!;

  // 3. Role check: Only partners/owners, managers, or admins can delete media assets
  if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
    throw new AppError("Forbidden: Insufficient privileges", 403, "FORBIDDEN");
  }

  const result = await MediaService.deleteMedia(mediaId);

  return successResponse({ deletedId: result.deletedId });
});
