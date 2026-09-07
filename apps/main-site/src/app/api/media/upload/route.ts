import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { MediaService } from "@/lib/services/mediaService";
import { successResponse } from "@/lib/utils/apiResponse";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { propertyId, fileBase64, fileName, tags } = body;

  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) return auth.response!;
  
  if (!["admin", "super_admin", "owner", "partner", "manager"].includes(auth.role || "")) {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  const activeUserId = auth.userId || "partner_admin_owner";

  const newMedia = await MediaService.uploadMedia({
    propertyId,
    fileBase64,
    fileName,
    tags,
    activeUserId: activeUserId as string
  });

  try {
    const prop = await prisma.property.findUnique({ where: { id: propertyId } });
    if (prop?.slug) revalidatePath(`/property/${prop.slug}`, "page");
  } catch (e) {}
  
  return successResponse({ asset: newMedia }, { status: 201 });
});
