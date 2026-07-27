import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId || !auth.propertyId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const media = await PartnerMediaService.getMedia(auth.propertyId);
  return successResponse({ media });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId || !auth.propertyId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const assetType = (formData.get("assetType") as string) || "GALLERY";

  const asset = await PartnerMediaService.uploadMedia({
    propertyId: auth.propertyId,
    propertySlug: auth.propertySlug,
    userId: auth.userId,
    file,
    assetType
  });

  return successResponse({ asset });
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId || !auth.propertyId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { ids } = await request.json();

  const result = await PartnerMediaService.reorderMedia(auth.propertyId, ids);
  return successResponse(result);
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId || !auth.propertyId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const id = request.nextUrl.searchParams.get("id");
  const result = await PartnerMediaService.deletePartnerMedia(auth.propertyId, id as string);
  
  return successResponse(result);
});
