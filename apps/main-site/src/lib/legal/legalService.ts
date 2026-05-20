import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType, LegalDocument } from "@prisma/client";

export class LegalService {
  /**
   * Fetches the currently active version of a legal document type.
   */
  static async getActiveDocument(type: LegalDocumentType): Promise<LegalDocument | null> {
    return prisma.legalDocument.findFirst({
      where: {
        documentType: type,
        isActive: true,
      },
    });
  }

  /**
   * Fetches a specific version of a document type.
   */
  static async getDocumentByVersion(type: LegalDocumentType, version: string): Promise<LegalDocument | null> {
    return prisma.legalDocument.findUnique({
      where: {
        documentType_version: {
          documentType: type,
          version,
        },
      },
    });
  }

  /**
   * Creates a new legal document version as a draft.
   */
  static async createDocumentVersion(
    type: LegalDocumentType,
    title: string,
    slug: string,
    version: string,
    content: string
  ): Promise<LegalDocument> {
    // Basic validation
    if (!version || !content || !title || !slug) {
      throw new Error("Missing required document version fields");
    }

    return prisma.legalDocument.create({
      data: {
        documentType: type,
        title,
        slug,
        version,
        content,
        isActive: false,
      },
    });
  }

  /**
   * Publishes and activates a specific legal document version.
   * Runs in a transaction: sets all other versions of this type to inactive,
   * then activates this version and updates its publishedAt timestamp.
   */
  static async publishDocument(id: string): Promise<LegalDocument> {
    const document = await prisma.legalDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Legal document not found");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Deactivate all existing versions of this type
      await tx.legalDocument.updateMany({
        where: {
          documentType: document.documentType,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // 2. Activate the target version and stamp publish time
      const published = await tx.legalDocument.update({
        where: { id },
        data: {
          isActive: true,
          publishedAt: new Date(),
        },
      });

      return published;
    });
  }

  /**
   * Creates an immutable signature log of user consent for a specific legal document version.
   */
  static async logAcceptance(
    userId: string,
    documentId: string,
    acceptedVersion: string,
    ipAddress: string | null,
    userAgent: string | null,
    metadata: any = {}
  ) {
    if (!userId || !documentId || !acceptedVersion) {
      throw new Error("Missing required compliance acceptance parameters");
    }

    // Ensure the document exists
    const doc = await prisma.legalDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new Error("Target legal document to sign does not exist");
    }

    return prisma.legalAcceptanceLog.create({
      data: {
        userId,
        documentId,
        acceptedVersion,
        ipAddress,
        userAgent,
        metadata: metadata || {},
      },
    });
  }

  /**
   * Checks if a user has accepted the latest active version of a document type.
   */
  static async hasUserAcceptedLatest(userId: string, type: LegalDocumentType): Promise<boolean> {
    const activeDoc = await this.getActiveDocument(type);
    if (!activeDoc) {
      // No active document configured means no agreement to accept
      return true;
    }

    const log = await prisma.legalAcceptanceLog.findFirst({
      where: {
        userId,
        documentId: activeDoc.id,
        acceptedVersion: activeDoc.version,
      },
    });

    return !!log;
  }

  /**
   * Resolves all active legal documents that a user has NOT accepted yet.
   * Useful for forced re-acceptance and dashboard updates overlays.
   */
  static async getPendingReacceptances(userId: string): Promise<LegalDocument[]> {
    // 1. Get all active documents
    const activeDocs = await prisma.legalDocument.findMany({
      where: { isActive: true },
    });

    if (activeDocs.length === 0) {
      return [];
    }

    // 2. Fetch all acceptances for this user
    const acceptances = await prisma.legalAcceptanceLog.findMany({
      where: {
        userId,
        documentId: { in: activeDocs.map((d) => d.id) },
      },
    });

    // Create a map of accepted documentId -> acceptedVersion
    const acceptedMap = new Map<string, string>();
    acceptances.forEach((log) => {
      acceptedMap.set(log.documentId, log.acceptedVersion);
    });

    // 3. Filter documents where the user hasn't accepted the active version
    return activeDocs.filter((doc) => {
      const acceptedVersion = acceptedMap.get(doc.id);
      return acceptedVersion !== doc.version;
    });
  }
}
