import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PASSWORD_REGEX } from "@/lib/server/password";

const authService = new AuthService();

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
});

async function resetPasswordHandler(request: NextRequest) {
  const body = await request.json();
  
  const validation = resetPasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await authService.resetPassword(
    validation.data.token,
    validation.data.newPassword,
    ip,
    userAgent
  );

  return successResponse(
    null,
    { message: "Password has been successfully reset" }
  );
}

export const POST = withErrorHandler(resetPasswordHandler);
