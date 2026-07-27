import { NextRequest } from "next/server";
import { resolvePropertyContext, getPropertyBranding } from "@/lib/tenant/contextResolver";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params;
  const { id } = idParamSchema.parse(resolvedParams);

  const property = await resolvePropertyContext(id);

  if (!property) {
    throw new AppError("Property not found", 404, "NOT_FOUND");
  }

  const branding = getPropertyBranding(property);

  return successResponse({
    id: property.id || id,
    name: property.name,
    location: property.location,
    branding,
  });
});
