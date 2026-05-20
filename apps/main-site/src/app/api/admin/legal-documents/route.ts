import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { LegalService } from "@/lib/legal/legalService";
import { LegalDocumentType } from "@prisma/client";

/**
 * GET: Retrieve all versions of legal documents
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");

    const whereClause: any = {};
    if (typeParam) {
      const upperType = typeParam.toUpperCase();
      if (Object.values(LegalDocumentType).includes(upperType as LegalDocumentType)) {
        whereClause.documentType = upperType as LegalDocumentType;
      } else {
        return NextResponse.json({ error: `Invalid document type: ${typeParam}` }, { status: 400 });
      }
    }

    const documents = await prisma.legalDocument.findMany({
      where: whereClause,
      orderBy: [
        { documentType: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error("[LEGAL_DOCUMENTS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Create a new legal document version (draft)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    const body = await request.json();
    const { documentType, title, slug, version, content } = body;

    if (!documentType || !title || !slug || !version || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Object.values(LegalDocumentType).includes(documentType as LegalDocumentType)) {
      return NextResponse.json({ error: `Invalid document type: ${documentType}` }, { status: 400 });
    }

    // Check version format (e.g. semver 1.0.0 or simple float like 1.0)
    const semverRegex = /^\d+(\.\d+){1,2}$/;
    if (!semverRegex.test(version)) {
      return NextResponse.json({ error: "Invalid version format. Use Semantic Versioning (e.g., 1.0.0 or 1.0)" }, { status: 400 });
    }

    // Check if this version already exists
    const existing = await prisma.legalDocument.findUnique({
      where: {
        documentType_version: {
          documentType: documentType as LegalDocumentType,
          version
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Version ${version} of ${documentType} already exists.` }, { status: 400 });
    }

    const document = await LegalService.createDocumentVersion(
      documentType as LegalDocumentType,
      title,
      slug,
      version,
      content
    );

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error: any) {
    console.error("[LEGAL_DOCUMENTS_POST] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH: Edit draft or publish/activate document version
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, action, title, slug, version, content } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const document = await prisma.legalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ error: "Legal document not found" }, { status: 404 });
    }

    if (action === "publish") {
      const published = await LegalService.publishDocument(id);
      return NextResponse.json({
        success: true,
        document: published
      });
    }

    if (action === "edit") {
      if (document.isActive) {
        return NextResponse.json({ error: "Cannot edit active/published legal documents to preserve audit trail integrity." }, { status: 400 });
      }

      if (!title || !slug || !version || !content) {
        return NextResponse.json({ error: "Missing required fields for draft edit" }, { status: 400 });
      }

      // Check if version is being updated and conflicts
      if (version !== document.version) {
        const existing = await prisma.legalDocument.findUnique({
          where: {
            documentType_version: {
              documentType: document.documentType,
              version
            }
          }
        });
        if (existing && existing.id !== id) {
          return NextResponse.json({ error: `Version ${version} already exists.` }, { status: 400 });
        }
      }

      const updated = await prisma.legalDocument.update({
        where: { id },
        data: {
          title,
          slug,
          version,
          content
        }
      });

      return NextResponse.json({
        success: true,
        document: updated
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'publish' or 'edit'." }, { status: 400 });
  } catch (error: any) {
    console.error("[LEGAL_DOCUMENTS_PATCH] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
