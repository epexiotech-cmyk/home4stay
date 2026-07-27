import { NextRequest } from "next/server";
import { propertyMediaService } from "@/lib/services/propertyMediaService";
import { requirePropertyAccess } from "@/lib/auth/rbac";
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

  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) return auth.response!;

  const assets = await propertyMediaService.getMediaAssets(propertyId);
  return successResponse({ success: true, assets });
});
