import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { checkLockout, recordFailure, resetLockout } from "@/lib/auth/lockout";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(1, "Password is required"),
});

async function loginHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const body = await request.json();
  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const { email, password } = validation.data;

  const { locked, remainingSeconds } = await checkLockout(email, ip, requestId);
  if (locked) {
    throw new Error(`Account locked. Please try again in ${Math.ceil(remainingSeconds / 60)} minutes.`);
  }

  let authResult;
  try {
    authResult = await authService.login(email, password, ip, userAgent, requestId);
  } catch (err) {
    await recordFailure(email, ip, requestId);
    throw err;
  }

  const { accessToken, refreshToken, user } = authResult;
  await resetLockout(email, ip);

  const response = successResponse({ user }, { message: "Login successful" });

  response.cookies.set("access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set("refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  response.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  return response;
}

export const POST = withErrorHandler(loginHandler);
