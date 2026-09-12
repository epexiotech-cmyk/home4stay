import { NextRequest } from "next/server";
import { requireOwnership } from "@/lib/auth/rbac";
import { StaffService } from "@/lib/services/staffService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { z } from "zod";

interface ContextProps {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  role: z.enum(["Manager", "Receptionist", "Accountant", "Housekeeping", "Support Staff", "Owner"])
});

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const accessId = resolvedParams.id;
  const propertyId = request.nextUrl.searchParams.get("propertyId");
  
  if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

  const auth = await requireOwnership(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Only the property owner can modify staff.", 403, "FORBIDDEN");
  }

  const body = await request.json();
  const parsed = updateSchema.parse(body);

  const updatedStaff = await StaffService.updateStaffRole(accessId, propertyId, parsed.role, auth.userId!);
  return successResponse(updatedStaff);
});

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: ContextProps) => {
  const resolvedParams = await params;
  const accessId = resolvedParams.id;
  const propertyId = request.nextUrl.searchParams.get("propertyId");
  
  if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

  const auth = await requireOwnership(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Only the property owner can modify staff.", 403, "FORBIDDEN");
  }

  await StaffService.removeStaffAccess(accessId, propertyId, auth.userId!);
  return successResponse({ success: true, message: "Staff access revoked" });
});
