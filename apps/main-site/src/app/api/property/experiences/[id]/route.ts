import { NextRequest } from "next/server";
import { propertyExperienceService } from "@/lib/services/propertyExperienceService";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const updateExperienceSchema = z.object({
  title: z.string().min(1, "title is required").optional(),
  description: z.string().min(1, "description is required").optional(),
  price: z.number().nonnegative().optional(),
  duration: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const existing = await propertyExperienceService.getExperienceById(id);

  if (!existing) {
    throw new AppError("Experience not found", 404, "NOT_FOUND");
  }

  const access = await requirePropertyAccess(request, existing.propertyId);
  if (!access.authorized) return access.response!;

  const body = await request.json();
  const validationData = updateExperienceSchema.parse(body);

  const updated = await propertyExperienceService.updateExperience(id, validationData);
  return successResponse(updated);
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const existing = await propertyExperienceService.getExperienceById(id);

  if (!existing) {
    throw new AppError("Experience not found", 404, "NOT_FOUND");
  }

  const access = await requirePropertyAccess(request, existing.propertyId);
  if (!access.authorized) return access.response!;

  await propertyExperienceService.deleteExperience(id);
  return successResponse({ success: true, deleted: id });
});
