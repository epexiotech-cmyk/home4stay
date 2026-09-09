import { NextRequest } from "next/server";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { AppError } from "@/lib/errors/handler";
import { revalidatePath } from "next/cache";

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ roomId: string, imageId: string }> | { roomId: string, imageId: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { roomId, imageId } = await params;
  if (!roomId || !imageId) throw new AppError("Missing roomId or imageId parameter", 400, "BAD_REQUEST");

  const propertyId = auth.propertyId!;

  await PartnerMediaService.deleteRoomImage({ propertyId, roomId, mediaId: imageId });

  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}

  return successResponse({ success: true, message: "Image deleted successfully" });
});
