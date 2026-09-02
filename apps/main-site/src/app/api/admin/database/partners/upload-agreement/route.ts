import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { PartnerAgreementService } from "@/lib/services/partnerAgreementService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { prisma } from "@/lib/database/prisma";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || auth.role !== "super_admin") {
    throw new AppError("Unauthorized: Only super admins can upload agreements here", 403, "FORBIDDEN");
  }

  const formData = await request.formData();
  const propertyId = formData.get("propertyId") as string;
  const file = formData.get("file") as File | null;

  if (!propertyId) {
    throw new AppError("Missing propertyId", 400, "BAD_REQUEST");
  }

  if (!file || file.size === 0) {
    throw new AppError("Missing file", 400, "BAD_REQUEST");
  }

  if (file.type !== "application/pdf") {
    throw new AppError("Only PDF files are allowed", 400, "BAD_REQUEST");
  }

  // Upload the file using existing service
  const result = await PartnerMediaService.uploadRawDocument({
    propertyId,
    userId: auth.userId as string,
    file,
    assetType: "AGREEMENT"
  });

  // Get or create the agreement record for this property
  const existingAgreement = await prisma.propertyAgreement.findFirst({
    where: { propertyId },
    orderBy: { createdAt: "desc" }
  });

  if (existingAgreement) {
    // Update existing agreement with new documentUrl
    await prisma.propertyAgreement.update({
      where: { id: existingAgreement.id },
      data: { documentUrl: result.url }
    });
  } else {
    // Create new agreement if none exists (unlikely if they finished onboarding, but just in case)
    await PartnerAgreementService.createAgreement({
      propertyId,
      agreementType: "Property Partner Agreement",
      agreementContent: "Uploaded by Super Admin",
      signatoryName: "Partner",
      signatoryRole: "Authorized Representative",
      documentUrl: result.url
    });
  }

  return successResponse({ success: true, url: result.url });
});
