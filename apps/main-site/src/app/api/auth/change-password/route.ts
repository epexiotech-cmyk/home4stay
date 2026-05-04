import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserById, updateUserPassword } from "@/lib/models/user";
import { requireRole } from "@/lib/auth/rbac";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate
    const { authorized, userId } = await requireRole(request, ["customer", "owner", "manager", "admin", "super_admin"]);
    
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate body
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // 3. Find user and verify current password
    const user = await findUserById(userId!);
    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { comparePasswords, hashPassword } = await import("@/lib/server/password");
    
    // 3.5 Check if new password is same as current
    const { isValid: isSameAsCurrent } = await comparePasswords(newPassword, user.password);
    if (isSameAsCurrent) {
      return NextResponse.json({ error: "New password cannot be the same as your current password" }, { status: 400 });
    }

    const { isValid } = await comparePasswords(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // 4. Hash new password and update (using Argon2)
    const hashedPassword = await hashPassword(newPassword);
    await updateUserPassword(userId!, hashedPassword);

    return NextResponse.json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
