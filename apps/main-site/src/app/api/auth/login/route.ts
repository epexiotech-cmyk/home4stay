import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail } from "@/lib/models/user";
import { signToken } from "@/lib/auth/jwt";
import { checkLockout, recordFailure, resetLockout } from "@/lib/auth/lockout";
import { logger } from "@/lib/observability/logger";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["customer", "partner", "admin"]),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  try {
    const body = await request.json();

    // 1. Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password, loginType } = validation.data;
    const email = validation.data.email.toLowerCase();

    // 2. CHECK LOCKOUT
    const { locked, remainingSeconds } = await checkLockout(email, ip, requestId);
    if (locked) {
      const minutes = Math.ceil(remainingSeconds / 60);
      return NextResponse.json(
        { error: `Account locked. Please try again in ${minutes} minutes.` },
        { status: 423 } // Locked
      );
    }

    // 3. Find user
    const user = await findUserByEmail(email);

    // 4. If user not found
    if (!user) {
      await recordFailure(email, ip, requestId);
      await logger({
        level: 'warn',
        event: 'AUTH_LOGIN_FAILURE',
        message: `User not found: ${email}`,
        requestId,
        ip,
        userId: email,
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Compare password with intelligent migration
    const { comparePasswords, hashPassword } = await import("@/lib/server/password");
    const { isValid, needsUpgrade } = await comparePasswords(password, user.password!);

    // 6. If password incorrect
    if (!isValid) {
      await recordFailure(email, ip, requestId);
      await logger({
        level: 'warn',
        event: 'AUTH_LOGIN_FAILURE',
        message: `Incorrect password for: ${email}`,
        requestId,
        ip,
        userId: email,
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6.1 Automatic Hash Upgrade (bcrypt -> Argon2)
    if (needsUpgrade) {
      const { updateUserPassword } = await import("@/lib/models/user");
      const newHash = await hashPassword(password);
      await updateUserPassword(user.id, newHash);
      console.log(`[SECURITY] Upgraded password hash for user ${user.id} to Argon2`);
    }

    // 7. ROLE VALIDATION
    const role = user.role;
    let isAuthorized = false;

    if (loginType === "customer") {
      isAuthorized = role === "customer";
    } else if (loginType === "partner") {
      isAuthorized = ["owner", "manager"].includes(role);
    } else if (loginType === "admin") {
      isAuthorized = ["admin", "super_admin"].includes(role);
    }

    if (!isAuthorized) {
      await logger({
        level: 'error',
        event: 'AUTH_UNAUTHORIZED_ROLE',
        message: `User ${email} with role ${role} attempted ${loginType} login`,
        requestId,
        ip,
        userId: email,
      });
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // 8. Generate JWTs (Dual-Token System)
    const accessToken = await signToken({
      userId: user.id,
      role: user.role,
      type: "access"
    }, "15m");

    const refreshToken = await signToken({
      userId: user.id,
      role: user.role,
      type: "refresh"
    }, "7d");

    // 9. Success response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set Access Token
    response.cookies.set("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set Refresh Token
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // For backward compatibility, also set "token"
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    // 10. Reset lockout & log success
    await resetLockout(email, ip);
    await logger({
      level: 'info',
      event: 'AUTH_LOGIN_SUCCESS',
      message: `User ${email} logged in as ${loginType}`,
      requestId,
      ip,
      userId: user.id,
    });

    return response;
  } catch (error) {
    await logger({
      level: 'error',
      event: 'AUTH_LOGIN_CRITICAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      ip,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
