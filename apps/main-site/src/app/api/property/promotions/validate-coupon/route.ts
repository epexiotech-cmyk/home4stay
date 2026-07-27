import { NextRequest } from "next/server";
import { propertyPromotionService } from "@/lib/services/propertyPromotionService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const validateCouponSchema = z.object({
  couponCode: z.string().min(1, "couponCode is required"),
  propertyId: z.string().min(1, "propertyId is required"),
  bookingAmount: z.number().positive("bookingAmount is required"),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { couponCode, propertyId, bookingAmount } = validateCouponSchema.parse(body);

  const result = await propertyPromotionService.validateCoupon(couponCode, propertyId, bookingAmount);

  if (!result.valid) {
    throw new AppError(result.message || "Invalid coupon", 400, "BAD_REQUEST");
  }

  return successResponse(result);
});
