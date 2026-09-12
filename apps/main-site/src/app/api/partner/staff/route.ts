import { NextRequest } from "next/server";
import { requirePropertyAccess, requireOwnership } from "@/lib/auth/rbac";
import { StaffService } from "@/lib/services/staffService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name is too short"),
  role: z.enum(["Manager", "Receptionist", "Accountant", "Housekeeping", "Support Staff", "Owner"])
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const staffList = await StaffService.getStaffList(propertyId);
  return successResponse({ staff: staffList });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

  const auth = await requireOwnership(request, propertyId);
  if (!auth.authorized) {
    if (auth.response) return auth.response;
    throw new AppError("Only the property owner can invite staff.", 403, "FORBIDDEN");
  }

  const body = await request.json();
  const parsed = inviteSchema.parse(body);

  const newStaff = await StaffService.inviteStaff(propertyId, parsed.email, parsed.name, parsed.role, auth.userId!);
  return successResponse(newStaff, { status: 201 });
});
