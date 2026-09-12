import { NextRequest } from "next/server";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { id: nearbyPlaceId } = await params;
  if (!nearbyPlaceId) throw new AppError("Missing id parameter", 400, "BAD_REQUEST");

  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    throw new AppError("No image provided", 400, "BAD_REQUEST");
  }
  
  const file = files[0]; // Only accept first image for cover

  const asset = await PartnerMediaService.uploadNearbyPlaceImage({
    propertyId: auth.propertyId!,
    nearbyPlaceId,
    userId: auth.userId!,
    file
  });

  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}

  return successResponse({ uploaded: [asset] }, { status: 201 });
});

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { id: nearbyPlaceId } = await params;
  if (!nearbyPlaceId) throw new AppError("Missing id parameter", 400, "BAD_REQUEST");

  const urlObj = new URL(request.url);
  const mediaId = urlObj.searchParams.get("mediaId") || undefined;

  await PartnerMediaService.deleteNearbyPlaceImage({
    propertyId: auth.propertyId!,
    nearbyPlaceId,
    mediaId
  });

  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}

  return successResponse({ success: true });
});
