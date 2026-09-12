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
  const parsed = propertyExperienceSchema.omit({ propertyId: true }).parse(body);
  const data = { ...parsed, propertyId: auth.propertyId! };

  const existing = await propertyExperienceService.getExperiences(data.propertyId);
  if (existing.some(e => e.slug === data.slug)) {
    throw new AppError("Experience already exists for this property", 409, "CONFLICT");
  }

  const experience = await propertyExperienceService.createExperience(data as any);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse(experience, { status: 201 });
});



export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager", "partner"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { id, ...updateData } = updatePropertyExperienceSchema.extend({ id: z.string().min(1) }).parse(body);

  // If this is a full form update and maxGuests is omitted, clear it in DB
  if ('title' in body && updateData.maxGuests === undefined) {
    (updateData as any).maxGuests = null;
  }

  const exp = await propertyExperienceService.getExperienceById(id);
  if (!exp) throw new AppError("Experience not found", 404, "NOT_FOUND");

  if (exp.propertyId !== auth.propertyId) {
    throw new AppError("Forbidden: Unauthorized modification", 403, "FORBIDDEN");
  }

  const updated = await propertyExperienceService.updateExperience(id, updateData as any);
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

  if (exp.propertyId !== auth.propertyId) {
    throw new AppError("Forbidden: Unauthorized modification", 403, "FORBIDDEN");
  }

  await propertyExperienceService.deleteExperience(id);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse({ success: true, deleted: id });
});


