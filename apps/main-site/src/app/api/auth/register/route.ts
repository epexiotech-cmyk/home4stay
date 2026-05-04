import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/models/user";
import { PASSWORD_REGEX } from "@/lib/server/password";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number is too short"),
  password: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, password, phone } = validation.data;
    const email = validation.data.email.toLowerCase();

    // 2. Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Create user (role defaults to "customer")
    await createUser({
      name,
      email,
      password,
      phone,
      role: "customer"
    });

    // 4. Return success response (omitting password)
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
