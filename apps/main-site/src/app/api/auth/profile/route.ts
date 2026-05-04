import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateUser } from "@/lib/models/user";
import { requireRole } from "@/lib/auth/rbac";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  image_url: z.string().refine(val => !val || val.startsWith('/') || /^(https?:\/\/)/.test(val), "Invalid image URL").optional().or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate (any role allowed)
    const { authorized, userId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
    
    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // 3. Update user profile
    const updatedUser = await updateUser(userId!, validation.data);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // 4. Return updated user
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        city: updatedUser.city,
        image_url: updatedUser.image_url,
        created_at: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
