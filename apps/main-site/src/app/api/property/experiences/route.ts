import { NextRequest } from "next/server";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { propertyExperienceService } from "@/lib/services/propertyExperienceService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const getExperiencesQuerySchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const { propertyId } = getExperiencesQuerySchema.parse({ propertyId: searchParams.get("propertyId") });

  const experiences = await propertyExperienceService.getExperiences(propertyId);
  return successResponse(experiences);
});

const experienceSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  price: z.number().nonnegative(),
  duration: z.string(),
  images: z.array(z.string()).default([]),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const data = experienceSchema.parse(body);

  const access = await requirePropertyAccess(request, data.propertyId);
  if (!access.authorized) return access.response!;

  const experience = await propertyExperienceService.createExperience(data);
  return successResponse(experience, { status: 201 });
});

const updateExperienceSchema = experienceSchema.partial().extend({
  id: z.string().min(1, "id is required"),
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { id, ...updateData } = updateExperienceSchema.parse(body);

  const exp = await propertyExperienceService.getExperienceById(id);
  if (!exp) throw new AppError("Experience not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, exp.propertyId);
  if (!access.authorized) return access.response!;

  const updated = await propertyExperienceService.updateExperience(id, updateData);
  return successResponse(updated);
});

const deleteExperienceSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(request.url);
  const { id } = deleteExperienceSchema.parse({ id: searchParams.get("id") });

  const exp = await propertyExperienceService.getExperienceById(id);
  if (!exp) throw new AppError("Experience not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, exp.propertyId);
  if (!access.authorized) return access.response!;

  await propertyExperienceService.deleteExperience(id);
  return successResponse({ success: true, deleted: id });
});
