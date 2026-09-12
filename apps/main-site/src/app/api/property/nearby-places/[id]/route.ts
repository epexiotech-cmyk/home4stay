import { NextRequest } from "next/server";
import { propertyNearbyPlaceService } from "@/lib/services/propertyNearbyPlaceService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { updatePropertyNearbyPlaceSchema } from "@/lib/validators/property.validators";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  if (!auth.propertyId) throw new AppError("Property ID is required in session", 400, "BAD_REQUEST");

  const { id } = await params;
  if (!id) throw new AppError("Missing ID parameter", 400, "BAD_REQUEST");

  const body = await request.json();
  const updateData = updatePropertyNearbyPlaceSchema.parse(body);

  const updated = await propertyNearbyPlaceService.updateNearbyPlace(auth.propertyId!, id, updateData);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  
  return successResponse(updated);
});

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  if (!auth.propertyId) throw new AppError("Property ID is required in session", 400, "BAD_REQUEST");

  const { id } = await params;
  if (!id) throw new AppError("Missing ID parameter", 400, "BAD_REQUEST");

  const deleted = await propertyNearbyPlaceService.deleteNearbyPlace(auth.propertyId!, id);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}

  return successResponse(deleted);
});
