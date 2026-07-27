import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

const authService = new AuthService();

async function meHandler(request: NextRequest) {
  // 1. Authenticate (any role allowed)
  const { authorized, userId, propertyId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
  
  if (!authorized) {
    return NextResponse.json({ user: null }); // Returning 200 with null for unauthenticated guests
  }

  // 2. Fetch user via AuthService
  const user = await authService.getCurrentUser(userId as string);

  return successResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      propertyId: propertyId
    }
  });
}

export const GET = withErrorHandler(meHandler as any);
