import { NextRequest } from "next/server";
import { propertyCmsService } from "@/lib/services/propertyCmsService";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

interface ContextProps {
  params: Promise<{ propertyId: string }>;
}

const createSectionSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
  type: z.string().min(1, "Section type is required"),
  initialData: z.any().optional(),
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const body = await request.json();
  const { propertyId, type, initialData } = createSectionSchema.parse({ ...body, propertyId: resolvedParams.propertyId });

  // 1. STRICT AUTH & TENANT ISOLATION CHECK
  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) return auth.response!;

  // 2. Additional Role boundary: Only managers and up can add CMS blocks
  if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
    throw new AppError("Forbidden: Insufficient privileges", 403, "FORBIDDEN");
  }

  // 3. Orchestrate Creation Flow
  const newSection = await propertyCmsService.createCmsSection(propertyId, type, initialData);

  return successResponse(newSection, { status: 201 });
});
