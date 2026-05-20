import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth.service";

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const cookies = request.cookies;
    const accessToken = cookies.get("access-token")?.value || cookies.get("token")?.value;
    const refreshToken = cookies.get("refresh-token")?.value;

    // Call centralized AuthService to perform complete session & blacklist deactivation
    await authService.logout(accessToken, refreshToken, ip, userAgent);

    const response = NextResponse.json({ message: "Logged out successfully" });
    const tokenNames = ["token", "access-token", "refresh-token"];
    
    // Clear cookies in browser client
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
  } catch (error) {
    console.error("[Logout API Route] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
