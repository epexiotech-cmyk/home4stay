import { NextRequest } from "next/server";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

interface ContextProps {
  params: Promise<{ propertyId: string; sectionId: string }>;
}

const deleteSectionSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  sectionId: z.string().min(1, "sectionId is required"),
});

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const { propertyId, sectionId } = deleteSectionSchema.parse(resolvedParams);

  // 1. STRICT AUTH & TENANT ISOLATION CHECK against PostgreSQL junction table
  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) return auth.response!;

  // 2. Role permission check (Only partners/owners, managers, or admins can delete CMS sections)
  if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
    throw new AppError("Forbidden: Insufficient privileges", 403, "FORBIDDEN");
  }

  // 3. Eliminate target block array entry
  await propertyCmsService.deleteCmsSection(sectionId);

  return successResponse({ success: true, deletedId: sectionId });
});
