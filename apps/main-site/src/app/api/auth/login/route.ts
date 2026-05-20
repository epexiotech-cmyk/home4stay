import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { checkLockout, recordFailure, resetLockout } from "@/lib/auth/lockout";
import { rateLimit } from "@/lib/security/rateLimiter";

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["customer", "partner", "admin"]),
});

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();

    // 1. Validate Input Payload
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, loginType } = validation.data;

    // 1.5. Apply Rate Limiting
    const rlKey = `login:${email}:${ip}`;
    const rlResult = await rateLimit({ key: rlKey, limit: 5, windowSeconds: 60 });
    if (!rlResult.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rlResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    // 2. CHECK BRUTE FORCE LOCKOUTS
    const { locked, remainingSeconds } = await checkLockout(email, ip, requestId);
    if (locked) {
      const minutes = Math.ceil(remainingSeconds / 60);
      return NextResponse.json(
        { error: `Account locked. Please try again in ${minutes} minutes.` },
        { status: 423 } // Locked
      );
    }

    // 3. Authenticate user via AuthService
    let authResult: Awaited<ReturnType<typeof authService.login>>;
    try {
      authResult = await authService.login(email, password, loginType, ip, userAgent, requestId);
    } catch (err) {
      // Record lockout failure
      await recordFailure(email, ip, requestId);
      
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      const isUnauthorized = errorMessage === "Unauthorized access";
      return NextResponse.json(
        { error: errorMessage },
        { status: isUnauthorized ? 403 : 401 }
      );
    }

    const { accessToken, refreshToken, user } = authResult;

    // 4. Construct response & Set cookies
    const response = NextResponse.json(
      {
        message: "Login successful",
        user
      },
      { status: 200 }
    );

    // Set Access Token HttpOnly cookie
    response.cookies.set("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set Refresh Token HttpOnly cookie
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Set duplicate backward-compatible "token" cookie
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    // 5. Reset lockout counter on success
    await resetLockout(email, ip);

    return response;
  } catch (error) {
    console.error("[Login API Route] Critical Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
