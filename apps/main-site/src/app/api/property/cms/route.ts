import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { propertyCmsUpdateSchema } from "@/lib/validators/property.validators";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  
  if (!auth.authorized) {
    return auth.response!;
  }

  const body = await request.json();
  const validation = propertyCmsUpdateSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError("Invalid data", 400, "VALIDATION_ERROR");
  }

  const data = validation.data;

  // RBAC: Owners can only edit their own property
  if (auth.role !== "admin" && auth.role !== "super_admin") {
    if (data.propertyId !== auth.propertyId) {
      throw new AppError("Forbidden: You can only manage CMS for your assigned property", 403, "FORBIDDEN");
    }
  }

  // Update the property in the database
  const updatedProperty = await propertyCmsService.updateCmsData(data.propertyId, data);

  return successResponse({
    success: true,
    message: "CMS content published successfully",
    property: updatedProperty
  });
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    throw new AppError("Missing propertyId", 400, "BAD_REQUEST");
  }

  const property = await propertyCmsService.getCmsData(propertyId);

  if (!property) {
    throw new AppError("Property not found", 404, "NOT_FOUND");
  }

  return successResponse(property);
});
