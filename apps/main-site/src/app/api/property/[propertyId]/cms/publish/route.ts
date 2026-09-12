import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { cacheInvalidate } from "@/lib/server/cache";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

const publishCmsSchema = z.object({
  versionName: z.string().optional(),
  snapshotPayload: z.any().optional(),
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  const auth = await requireRole(request, ["owner", "partner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const activeUserId = auth.userId;
  if (!activeUserId) throw new AppError("Missing user context.", 401, "UNAUTHORIZED");

  const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mutation attempt restricted.", 403, "FORBIDDEN");
  }

  const body = await request.json();
  const { versionName, snapshotPayload } = publishCmsSchema.parse(body);

  const targetRelease = await propertyCmsService.publishCmsVersion(
    propertyId,
    versionName || `Release Build — ${new Date().toLocaleDateString()}`,
    snapshotPayload,
    activeUserId
  );

  const cacheKey = `cms:${propertyId}`;
  await cacheInvalidate(cacheKey);

  return successResponse(targetRelease, { status: 201 });
});

export const GET = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  const auth = await requireRole(request, ["owner", "partner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const hasAccess = await validatePropertyAccess(auth.userId!, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mapping breach intercepted.", 403, "FORBIDDEN");
  }

  const history = await propertyCmsService.getCmsVersions(propertyId);
  return successResponse({ versions: history }, { status: 200 });
});
