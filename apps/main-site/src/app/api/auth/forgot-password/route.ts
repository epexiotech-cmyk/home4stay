import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

const authService = new AuthService();

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

async function forgotPasswordHandler(request: NextRequest) {
  const body = await request.json();
  
  const validation = forgotPasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Always returns 200 to prevent email enumeration
  await authService.forgotPassword(validation.data.email.toLowerCase(), ip, userAgent);

  return successResponse(
    null,
    { message: "If that email exists in our system, a reset link has been sent." }
  );
}

export const POST = withErrorHandler(forgotPasswordHandler);
