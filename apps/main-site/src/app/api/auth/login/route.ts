import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/models/user";
import { signToken } from "@/lib/auth/jwt";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["customer", "partner", "admin"]),
});

export async function POST(request: NextRequest) {
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

    // 2. Find user
    const user = await findUserByEmail(email);

    // 3. If user not found
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password!);

    // 5. If password incorrect
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6. ROLE VALIDATION (CRITICAL)
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
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // 7. Generate JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
    });

    // 8. Success response with secure cookie
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

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
