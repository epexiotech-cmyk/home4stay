import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { validatePropertyAccess } from "@/lib/tenant/tenantUtils";
import { prisma } from "@/lib/database/prisma";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

const restoreSchema = z.object({
  versionId: z.string(),
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId } = resolvedParams;

  const auth = await requireRole(request, ["owner", "manager", "admin", "super_admin"]);
  if (!auth.authorized) return auth.response!;

  const activeUserId = auth.userId;
  if (!activeUserId) throw new AppError("Missing user context.", 401, "UNAUTHORIZED");

  const hasAccess = await validatePropertyAccess(activeUserId, auth.role || "", propertyId);
  if (!hasAccess) {
    throw new AppError("Forbidden access mutation attempt restricted.", 403, "FORBIDDEN");
  }

  const body = await request.json();
  const { versionId } = restoreSchema.parse(body);

  const version = await prisma.cmsVersion.findUnique({
    where: { id: versionId }
  });

  if (!version || version.propertyId !== propertyId) {
    throw new AppError("Version not found or inaccessible.", 404, "NOT_FOUND");
  }

  const snapshotSchema = z.object({
    themeVariant: z.string().optional(),
    sections: z.array(
      z.object({
        id: z.string().optional(),
        type: z.string(),
        sortOrder: z.number().optional(),
        enabled: z.boolean().optional(),
        data: z.record(z.string(), z.unknown()).optional(),
      }).passthrough()
    )
  });

  const parsedSnapshot = snapshotSchema.safeParse(version.snapshot);
  if (!parsedSnapshot.success) {
    throw new AppError("Invalid snapshot structure. Cannot restore.", 400, "BAD_REQUEST");
  }

  const snapshot = parsedSnapshot.data;

  // Restore the snapshot sections back into the draft PropertyPageContent
  await propertyCmsService.upsertCmsContent(propertyId, snapshot.themeVariant || "Mountain Luxury", snapshot.sections);

  return successResponse({
    success: true,
    message: "Version restored to draft successfully.",
  });
});
