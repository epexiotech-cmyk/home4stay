import { prisma } from "@/lib/database/prisma";
import { AppError } from "@/lib/errors/handler";
import crypto from "crypto";

export class PartnerAgreementService {
  static async getLatestAgreement(propertyId: string) {
    if (!propertyId) throw new AppError("Property ID required", 400, "BAD_REQUEST");

    const agreement = await prisma.propertyAgreement.findFirst({
      where: { propertyId },
      orderBy: { createdAt: "desc" }
    });

    return agreement;
  }

  static async createAgreement(payload: {
    propertyId: string;
    agreementType: string;
    agreementContent: string;
    signatoryName: string;
    signatoryRole: string;
    documentUrl?: string;
    signatureUrl?: string;
  }) {
    const {
      propertyId,
      agreementType,
      agreementContent,
      signatoryName,
      signatoryRole,
      documentUrl,
      signatureUrl
    } = payload;

    if (!propertyId || !agreementType || !agreementContent || !signatoryName || !signatoryRole) {
      throw new AppError("Missing required agreement fields", 400, "BAD_REQUEST");
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw new AppError("Property not found", 404, "NOT_FOUND");
    }

    // Supersede any previously signed agreement
    const existingAgreements = await prisma.propertyAgreement.findMany({
      where: {
        propertyId,
        status: {
          in: ["SIGNED", "DRAFT"]
        }
      },
      orderBy: { version: "desc" }
    });

    let newVersion = 1;
    if (existingAgreements.length > 0) {
      newVersion = existingAgreements[0].version + 1;
      
      const signedIds = existingAgreements.filter(a => a.status === "SIGNED").map(a => a.id);
      const draftIds = existingAgreements.filter(a => a.status === "DRAFT").map(a => a.id);

      if (signedIds.length > 0) {
        await prisma.propertyAgreement.updateMany({
          where: { id: { in: signedIds } },
          data: { status: "SUPERSEDED" }
        });
      }

      if (draftIds.length > 0) {
        await prisma.propertyAgreement.deleteMany({
          where: { id: { in: draftIds } }
        });
      }
    }

    // Compute hash for integrity
    const hash = crypto
      .createHash("sha256")
      .update(`${agreementContent}|${signatoryName}|${signatoryRole}`)
      .digest("hex");

    const newAgreement = await prisma.propertyAgreement.create({
      data: {
        propertyId,
        agreementType,
        agreementContent,
        signatoryName,
        signatoryRole,
        documentUrl,
        signatureUrl,
        status: signatureUrl ? "SIGNED" : "DRAFT",
        signedAt: signatureUrl ? new Date() : null,
        version: newVersion,
        contentHash: hash
      }
    });

    return newAgreement;
  }
}
