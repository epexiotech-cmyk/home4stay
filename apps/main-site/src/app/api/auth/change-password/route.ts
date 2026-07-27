import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PASSWORD_REGEX } from "@/lib/server/password";
import { requireAuth } from "@/lib/auth/rbac";

const authService = new AuthService();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
});

async function changePasswordHandler(request: NextRequest) {
  const body = await request.json();
  
  const validation = changePasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  // Auth Guard
  const { authorized, userId } = await requireAuth(request);
  if (!authorized || !userId) {
    throw new Error("Unauthorized");
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await authService.changePassword(
    userId,
    validation.data.currentPassword,
    validation.data.newPassword,
    ip,
    userAgent
  );

  return successResponse(
    null,
    { message: "Password has been successfully changed" }
  );
}

export const POST = withErrorHandler(changePasswordHandler);
