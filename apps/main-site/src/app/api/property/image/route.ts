import { NextRequest } from "next/server";
import { propertyMediaService } from "@/lib/services/propertyMediaService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const imageUploadSchema = z.object({
  slug: z.string().min(1, "Missing slug"),
  imageUrl: z.string().url("Invalid imageUrl"),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 0. AUTHENTICATION & SECURITY BOUNDARY
  const auth = await requireRole(request, ["admin"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { slug, imageUrl } = imageUploadSchema.parse(body);

  const result = await propertyMediaService.uploadAndOptimizeImage(slug, imageUrl);
  return successResponse(result, { status: 201 });
});
