import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

const authService = new AuthService();

async function logoutHandler(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const cookies = request.cookies;
  const accessToken = cookies.get("access-token")?.value || cookies.get("token")?.value;
  const refreshToken = cookies.get("refresh-token")?.value;

  await authService.logout(accessToken, refreshToken, ip, userAgent);

  const response = successResponse(null, { message: "Logged out successfully" });
  
  const tokenNames = ["token", "access-token", "refresh-token"];
  for (const name of tokenNames) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/"
    });
  }

  return response;
}

export const POST = withErrorHandler(logoutHandler);
