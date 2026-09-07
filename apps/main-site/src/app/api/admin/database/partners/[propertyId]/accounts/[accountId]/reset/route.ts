import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { verifyToken } from "@/lib/auth/jwt";
import crypto from "crypto";
import { hashPassword } from "@/lib/server/password";

async function resetAccountPasswordHandler(request: NextRequest, { params }: { params: { propertyId: string; accountId: string } }) {
  const token = request.cookies.get("access-token")?.value || request.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const payload = await verifyToken(token);
  if (!payload || (payload.role !== "super_admin" && payload.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const { propertyId, accountId } = params;

  // Verify the account belongs to the property
  const access = await prisma.propertyUserAccess.findFirst({
    where: { propertyId, userId: accountId }
  });

  if (!access) {
    throw new Error("Account not found for this property");
  }

  // Generate new password
  const newPassword = crypto.randomBytes(12).toString("base64").slice(0, 16) + "1aA!";
  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: accountId },
    data: { password: newPasswordHash }
  });
  
  // Optionally clear sessions
  await prisma.session.updateMany({
    where: { userId: accountId },
    data: { isActive: false }
  });

  return successResponse({ newPassword }, { message: "Password reset successfully", status: 200 });
}

export const POST = withErrorHandler(resetAccountPasswordHandler);
