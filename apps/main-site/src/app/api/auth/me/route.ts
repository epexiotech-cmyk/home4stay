import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/lib/models/user";
import { requireRole } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate (any role allowed)
    const { authorized, userId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
    
    if (!authorized) {
      return NextResponse.json({ user: null });
    }

    // 2. Find user by ID
    const user = await findUserById(userId!);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Return user data (securely)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        image_url: user.image_url,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
