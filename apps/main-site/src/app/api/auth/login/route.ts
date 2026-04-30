import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/models/user";
import { signToken } from "@/lib/auth/jwt";
import { checkLockout, recordFailure, resetLockout } from "@/lib/auth/lockout";
import { logger } from "@/lib/observability/logger";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
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

    const { email, password, loginType } = validation.data;

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

    // 5. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password!);

    // 6. If password incorrect
    if (!isPasswordCorrect) {
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

    // 8. Generate JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
    });

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

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
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
