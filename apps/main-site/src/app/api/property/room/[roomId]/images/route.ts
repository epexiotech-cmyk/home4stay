import { NextRequest } from "next/server";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors/handler";
import { prisma } from "@/lib/database/prisma";

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string }> | { roomId: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { roomId } = await params;
  if (!roomId) throw new AppError("Missing roomId parameter", 400, "BAD_REQUEST");

  // Property ID from Auth
  const propertyId = auth.propertyId!;

  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    throw new AppError("No images provided", 400, "BAD_REQUEST");
  }

  // The limit of 12 total images is checked inside uploadRoomImage concurrently for each,
  // but to avoid partial uploads we can do a preliminary check here.
  // We'll let the service handle the exact count check, but we could fail fast if files.length > 12.
  const room = await prisma.room.findFirst({ where: { id: roomId, propertyId } });
  if (!room) throw new AppError("Room not found or unauthorized", 404, "NOT_FOUND");
  
  const existingImages = Array.isArray(room.images) ? room.images : [];
  if (existingImages.length + files.length > 12) {
    throw new AppError(`Maximum of 12 images per room allowed. You can only upload ${12 - existingImages.length} more.`, 400, "BAD_REQUEST");
  }

  const uploadedAssets = [];
  const errors = [];

  for (const file of files) {
    try {
      const asset = await PartnerMediaService.uploadRoomImage({
        roomId,
        propertyId,
        userId: auth.userId!,
        file
      });
      uploadedAssets.push(asset);
    } catch (err: any) {
      errors.push({ fileName: file.name, error: err.message || "Upload failed" });
    }
  }

  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}

  if (errors.length > 0 && uploadedAssets.length === 0) {
    throw new AppError(`Failed to upload images: ${errors[0].error}`, 400, "BAD_REQUEST");
  }

  return successResponse({
    uploaded: uploadedAssets,
    errors: errors.length > 0 ? errors : undefined
  }, { status: 201 });
});

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string }> | { roomId: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { roomId } = await params;
  if (!roomId) throw new AppError("Missing roomId parameter", 400, "BAD_REQUEST");

  const propertyId = auth.propertyId!;
  
  const images = await PartnerMediaService.getRoomImages(propertyId, roomId);

  return successResponse(images);
});
