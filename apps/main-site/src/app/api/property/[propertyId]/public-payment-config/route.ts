import { NextRequest } from "next/server";
import { propertyPaymentConfigService } from "@/lib/services/propertyPaymentConfigService";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const propertyIdParamSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
});

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) => {
  const resolvedParams = await params;
  const { propertyId } = propertyIdParamSchema.parse(resolvedParams);

  const activeConfig = await propertyPaymentConfigService.getPublicPaymentConfig(propertyId);
  return successResponse(activeConfig);
});
