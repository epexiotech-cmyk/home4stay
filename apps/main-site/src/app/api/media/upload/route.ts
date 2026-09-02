import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { MediaService } from "@/lib/services/mediaService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
  const activeUserId = auth.authorized ? auth.userId : "partner_admin_owner";

  const body = await request.json();
  const { propertyId, fileBase64, fileName, tags } = body;

  const newMedia = await MediaService.uploadMedia({
    propertyId,
    fileBase64,
    fileName,
    tags,
    activeUserId: activeUserId as string
  });

  return successResponse({ asset: newMedia }, { status: 201 });
});
