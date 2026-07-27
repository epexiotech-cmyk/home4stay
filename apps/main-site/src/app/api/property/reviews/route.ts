import { NextRequest } from "next/server";
import { propertyReviewService } from "@/lib/services/propertyReviewService";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const getReviewsQuerySchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  isPublished: z.string().optional().transform(v => v === "true" ? true : v === "false" ? false : undefined),
  isFeatured: z.string().optional().transform(v => v === "true" ? true : v === "false" ? false : undefined),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const { propertyId, isPublished, isFeatured } = getReviewsQuerySchema.parse({
    propertyId: searchParams.get("propertyId"),
    isPublished: searchParams.get("isPublished"),
    isFeatured: searchParams.get("isFeatured"),
  });

  const data = await propertyReviewService.getReviewsAndStats(propertyId, isPublished, isFeatured);
  return successResponse(data);
});

const reviewReplySchema = z.object({
  reviewId: z.string().min(1, "reviewId is required"),
  responseMessage: z.string().min(1, "responseMessage is required"),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { reviewId, responseMessage } = reviewReplySchema.parse(body);

  if (auth.role !== "admin" && auth.role !== "super_admin") {
    const review = (await propertyReviewService.getReviewsAndStats(auth.propertyId!)).reviews.find(r => r.id === reviewId);
    if (!review) throw new AppError("Review not found for this property", 404, "NOT_FOUND");
    const access = await requirePropertyAccess(request, review.propertyId);
    if (!access.authorized) return access.response!;
  }

  const updated = await propertyReviewService.replyToReview(reviewId, responseMessage);
  return successResponse(updated, { status: 201 });
});

const reviewStatusSchema = z.object({
  reviewId: z.string().min(1, "reviewId is required"),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { reviewId, isPublished, isFeatured } = reviewStatusSchema.parse(body);

  if (auth.role !== "admin" && auth.role !== "super_admin") {
    const review = (await propertyReviewService.getReviewsAndStats(auth.propertyId!)).reviews.find(r => r.id === reviewId);
    if (!review) throw new AppError("Review not found for this property", 404, "NOT_FOUND");
    const access = await requirePropertyAccess(request, review.propertyId);
    if (!access.authorized) return access.response!;
  }

  const updated = await propertyReviewService.toggleReviewStatus(reviewId, isPublished, isFeatured);
  return successResponse(updated);
});
