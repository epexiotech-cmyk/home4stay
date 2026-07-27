import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/server/cache";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { propertyCmsUpdateSchema } from "@/lib/validators/property.validators";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

export const GET = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  // Secure multi-tenant identity verification
  const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const activeUserId = auth.userId;
  if (!activeUserId) throw new AppError("Missing user context.", 401, "UNAUTHORIZED");

  // STRICT OWNER VALIDATION CHECK
  const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mapping breach intercepted.", 403, "FORBIDDEN");
  }

  // 1. Check Redis Cache first
  const cacheKey = `cms:${propertyId}`;
  const cachedCms = await cacheGet<unknown>(cacheKey);
  if (cachedCms) {
    return successResponse(cachedCms, { meta: { source: "cache" } });
  }

  // 2. Fall back to PostgreSQL DB fetch via Service
  const cmsData = await propertyCmsService.getCmsPageContent(propertyId);

  // 3. Cache the result for 5 minutes (300 seconds)
  await cacheSet(cacheKey, cmsData, 300);

  return successResponse(cmsData, { meta: { source: "database" } });
});

export const PUT = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const activeUserId = auth.userId;
  if (!activeUserId) throw new AppError("Missing user context.", 401, "UNAUTHORIZED");

  // Intercept target ownership verification record
  const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mutation attempt restricted.", 403, "FORBIDDEN");
  }

  const body = await request.json();
  const { themePreset, sections } = propertyCmsUpdateSchema.omit({ propertyId: true }).parse(body);

  await propertyCmsService.upsertCmsContent(propertyId, themePreset || "Mountain Luxury", sections || []);

  // 4. Invalidate Redis CMS cache instantly upon modification
  const cacheKey = `cms:${propertyId}`;
  await cacheInvalidate(cacheKey);

  return successResponse({ timestamp: new Date().toISOString() });
});
