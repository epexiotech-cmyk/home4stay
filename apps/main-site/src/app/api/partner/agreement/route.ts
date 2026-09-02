import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PartnerAgreementService } from "@/lib/services/partnerAgreementService";
import { PartnerMediaService } from "@/lib/services/partnerMediaService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

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

  const agreement = await PartnerAgreementService.getLatestAgreement(propertyId);
  return successResponse({ agreement });
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

  const formData = await request.formData();
  
  // The server enforces the exact agreement text rather than trusting the client
  const agreementType = "Property Partner Agreement";
  const agreementContent = `HOME4STAY - PROPERTY PARTNER AGREEMENT

This Property Partner Agreement ("Agreement") is entered into between Home4Stay ("Home4Stay") and the property owner / authorized representative ("Partner") for the listing, management, promotion and booking of the Partner's property through the Home4Stay platform.

1. Partner & Property
The Partner confirms that the information, photographs, amenities, pricing, availability, policies and other details provided for the property are accurate and up to date.

2. Authority & Ownership
The Partner confirms that they are the property owner or are duly authorized to represent and manage the property and to provide the property for listing and booking through Home4Stay.

3. Property Information
The Partner is responsible for maintaining accurate property information, including:
- Property name and address
- Room and accommodation details
- Amenities and facilities
- Pricing and availability
- Check-in / check-out policies
- House rules and applicable restrictions

4. Bookings & Guest Services
Home4Stay may display the property on its platform and facilitate guest discovery, booking and related communication in accordance with the applicable Home4Stay policies and commercial terms.

The Partner remains responsible for providing the accommodation and services represented in the property listing.

5. Accuracy & Compliance
The Partner agrees that the property and its operation will comply with applicable laws, regulations, licenses, permissions and safety requirements.

The Partner is responsible for obtaining and maintaining any permissions, registrations or licenses required for operating the property.

6. Property Standards
The Partner agrees to maintain the property in a reasonably clean, safe and usable condition and to provide guests with the services and facilities represented in the listing.

7. Content & Media
The Partner authorizes Home4Stay to use property information, photographs, videos, descriptions and other materials supplied by the Partner for the purpose of listing, promoting and operating the property on the Home4Stay platform.

8. Partner Responsibility
The Partner is responsible for:
- Accuracy of submitted information
- Guest-ready condition of the property
- Compliance with applicable requirements
- Availability provided to Home4Stay
- Fulfilment of confirmed bookings
- Any representations made regarding the property

9. Changes & Updates
The Partner must promptly update Home4Stay regarding material changes to the property, availability, pricing, amenities, policies or operating conditions.

10. Termination
Either party may terminate the partnership subject to applicable commercial terms, pending bookings and any other obligations that survive termination.

Home4Stay may suspend or remove a property where information is materially inaccurate, the property presents a significant risk, or the Partner fails to comply with applicable platform requirements.

11. Electronic Record & Acceptance
The Partner confirms that they have read and understood this Agreement and that the information provided during onboarding is accurate.

The Partner's acceptance and uploaded signature will be stored with the Agreement record together with the Partner's name, designation, property information and acceptance date.`;

  const signatureFile = formData.get("signatureFile") as File | null;

  if (!signatureFile || signatureFile.size === 0) {
    throw new AppError("Missing signature image", 400, "BAD_REQUEST");
  }

  // Hardcode signatoryName and signatoryRole to satisfy Prisma schema, 
  // as the client no longer provides them.
  const signatoryName = "Partner";
  const signatoryRole = "Authorized Representative";

  let signatureUrl: string | undefined;

  if (signatureFile && signatureFile.size > 0) {
    const result = await PartnerMediaService.uploadRawDocument({
      propertyId,
      userId: auth.userId,
      file: signatureFile,
      assetType: "SIGNATURE"
    });
    signatureUrl = result.url;
  }

  const newAgreement = await PartnerAgreementService.createAgreement({
    propertyId,
    agreementType,
    agreementContent,
    signatoryName,
    signatoryRole,
    signatureUrl
  });

  return successResponse({ agreement: newAgreement });
});