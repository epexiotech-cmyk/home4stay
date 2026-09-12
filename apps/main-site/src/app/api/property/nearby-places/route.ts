import { NextRequest } from "next/server";
import { propertyNearbyPlaceService } from "@/lib/services/propertyNearbyPlaceService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { propertyNearbyPlaceSchema } from "@/lib/validators/property.validators";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  if (!auth.propertyId) throw new AppError("Property ID is required in session", 400, "BAD_REQUEST");

  const places = await propertyNearbyPlaceService.listNearbyPlaces(auth.propertyId!);
  return successResponse(places);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  if (!auth.propertyId) throw new AppError("Property ID is required in session", 400, "BAD_REQUEST");

  const body = await request.json();
  // Override propertyId from auth, don't trust body
  const parsedData = propertyNearbyPlaceSchema.parse({ ...body, propertyId: auth.propertyId! });

  const newPlace = await propertyNearbyPlaceService.createNearbyPlace(auth.propertyId!, parsedData);
  return successResponse(newPlace, { status: 201 });
});
