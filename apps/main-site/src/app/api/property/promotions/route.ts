import { NextRequest } from "next/server";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { propertyPromotionService } from "@/lib/services/propertyPromotionService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const getOffersQuerySchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  isActive: z.string().optional().transform(v => v === "true" ? true : v === "false" ? false : undefined),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const { propertyId, isActive } = getOffersQuerySchema.parse({
    propertyId: searchParams.get("propertyId"),
    isActive: searchParams.get("isActive"),
  });

  const offers = await propertyPromotionService.getOffers(propertyId, isActive);
  return successResponse(offers);
});

const offerSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().positive(),
  couponCode: z.string().min(3),
  startDate: z.string(),
  endDate: z.string(),
  minimumBookingAmount: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const data = offerSchema.parse(body);

  const access = await requirePropertyAccess(request, data.propertyId);
  if (!access.authorized) return access.response!;

  const newOffer = await propertyPromotionService.createOffer(data);
  return successResponse(newOffer, { status: 201 });
});

const updateOfferSchema = offerSchema.partial().extend({
  id: z.string().min(1, "id is required"),
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { id, ...updateData } = updateOfferSchema.parse(body);

  const offer = await propertyPromotionService.getOfferById(id);
  if (!offer) throw new AppError("Offer not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, offer.propertyId);
  if (!access.authorized) return access.response!;

  const updatedOffer = await propertyPromotionService.updateOffer(id, updateData);
  return successResponse(updatedOffer);
});

const deleteOfferSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(request.url);
  const { id } = deleteOfferSchema.parse({ id: searchParams.get("id") });

  const offer = await propertyPromotionService.getOfferById(id);
  if (!offer) throw new AppError("Offer not found", 404, "NOT_FOUND");

  const access = await requirePropertyAccess(request, offer.propertyId);
  if (!access.authorized) return access.response!;

  await propertyPromotionService.deleteOffer(id);
  return successResponse({ success: true, deleted: id });
});
