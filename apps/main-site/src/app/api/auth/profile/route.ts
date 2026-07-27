import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

const authService = new AuthService();

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  image_url: z.string().refine(val => !val || val.startsWith('/') || /^(https?:\/\/)/.test(val), "Invalid image URL").optional().or(z.literal("")),
});

async function profileHandler(request: NextRequest) {
  // 1. Authenticate (any role allowed)
  const { authorized, userId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
  
  if (!authorized) {
    throw new Error("Unauthorized");
  }

  // 2. Parse and validate body
  const body = await request.json();
  const validation = profileSchema.safeParse(body);

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  // 3. Update user profile via AuthService
  const updatedUser = await authService.updateProfile(userId as string, validation.data);

  // 4. Return updated user using centralized utility
  return successResponse({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt
      }
  }, { message: "Profile updated successfully" });
}

export const PUT = withErrorHandler(profileHandler);
