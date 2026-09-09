export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { propertyExperienceService } from "@/lib/services/propertyExperienceService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";
import { propertyExperienceSchema, updatePropertyExperienceSchema } from "@/lib/validators/property.validators";
import { revalidatePath } from "next/cache";

const getExperiencesQuerySchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(request.url);
  const { propertyId } = getExperiencesQuerySchema.parse({ propertyId: searchParams.get("propertyId") });

  const access = await requirePropertyAccess(request, propertyId);
  if (!access.authorized) return access.response!;

  const experiences = await propertyExperienceService.getExperiences(propertyId);
  return successResponse(experiences);
});



export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const data = propertyExperienceSchema.parse(body);

  const access = await requirePropertyAccess(request, data.propertyId);
  if (!access.authorized) return access.response!;

  const existing = await propertyExperienceService.getExperiences(data.propertyId);
  if (existing.some(e => e.slug === data.slug)) {
    throw new AppError("Experience already exists for this property", 409, "CONFLICT");
  }

  const experience = await propertyExperienceService.createExperience(data);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse(experience, { status: 201 });
});



export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { id, ...updateData } = updatePropertyExperienceSchema.extend({ id: z.string().min(1) }).parse(body);

  const exp = await propertyExperienceService.getExperienceById(id);
  if (!exp) throw new AppError("Experience not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, exp.propertyId);
  if (!access.authorized) return access.response!;

  const updated = await propertyExperienceService.updateExperience(id, updateData);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse(updated);
});

const deleteExperienceSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(request.url);
  const { id } = deleteExperienceSchema.parse({ id: searchParams.get("id") });

  const exp = await propertyExperienceService.getExperienceById(id);
  if (!exp) throw new AppError("Experience not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, exp.propertyId);
  if (!access.authorized) return access.response!;

  await propertyExperienceService.deleteExperience(id);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse({ success: true, deleted: id });
});


