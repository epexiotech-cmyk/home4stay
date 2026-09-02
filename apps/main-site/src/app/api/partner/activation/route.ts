import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { PartnerActivationService } from "@/lib/services/partnerActivationService";
import { LaunchReadinessService } from "@/lib/onboarding/readiness";
import { prisma } from "@/lib/database/prisma";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const propertyId = auth.propertyId;
  if (!propertyId) {
    throw new AppError("No active property profile", 409, "CONFLICT");
  }

  // Get or create activation record
  const activation = await PartnerActivationService.getOrCreateActivation(propertyId);

  return successResponse({
    activationKey: activation.activationKey,
    activationUrl: activation.activationUrl,
    status: activation.status,
    activatedAt: activation.activatedAt
  });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const propertyId = auth.propertyId;
  if (!propertyId) {
    throw new AppError("No active property profile", 409, "CONFLICT");
  }

  // Enforce readiness checks before activating
  const report = await LaunchReadinessService.evaluateReadiness(propertyId);
  if (!report.isReady) {
    throw new AppError("Cannot activate property. There are blocking readiness gaps.", 403, "FORBIDDEN");
  }

  const activation = await PartnerActivationService.activateProperty(propertyId);
  
  // Ensure subdomain exists
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  let finalSubdomain = property?.subdomain;
  
  if (property && !finalSubdomain) {
    const { propertyService } = require("@/lib/services/propertyService");
    finalSubdomain = await propertyService.generateUniqueSubdomain(property.title);
  }

  // also mark property as published if it was in draft, and save subdomain
  await prisma.property.update({
    where: { id: propertyId },
    data: { 
      status: "LIVE",
      onboardingStatus: "LIVE",
      publishedAt: new Date(),
      ...(finalSubdomain ? { subdomain: finalSubdomain } : {})
    }
  });

  const propertyUrl = finalSubdomain ? `http://${finalSubdomain}.localhost:3000` : `/property/${property?.slug}`;

  return successResponse({
    status: activation.status,
    activatedAt: activation.activatedAt,
    propertyUrl
  });
});
