import { NextRequest } from "next/server";
import { resolvePropertyContext } from "@/lib/tenant/contextResolver";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { propertyExperienceService } from "@/lib/services/propertyExperienceService";
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

  const propertyId = property.id || id;
  const experiences = await propertyExperienceService.getExperiences(propertyId);
  const activeExperiences = experiences.filter(e => e.isActive);

  return successResponse(activeExperiences);
});
