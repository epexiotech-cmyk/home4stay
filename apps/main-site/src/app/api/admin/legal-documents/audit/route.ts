import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType, Prisma } from "@prisma/client";

/**
 * GET: Retrieve compliance acceptance logs with filters and pagination
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
    const search = searchParams.get("search");
    const docType = searchParams.get("documentType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 200);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const whereClause: Prisma.LegalAcceptanceLogWhereInput = {};

    // Filter by dynamic documentType
    if (docType) {
      const upperType = docType.toUpperCase();
      if (Object.values(LegalDocumentType).includes(upperType as LegalDocumentType)) {
        whereClause.document = {
          documentType: upperType as LegalDocumentType
        };
      } else {
        return NextResponse.json({ error: `Invalid document type: ${docType}` }, { status: 400 });
      }
    }

    // Dynamic case-insensitive search by user name or email
    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      whereClause.user = {
        OR: [
          { name: { contains: trimmedSearch, mode: "insensitive" } },
          { email: { contains: trimmedSearch, mode: "insensitive" } }
        ]
      };
    }

    // Filter by Date Range
    if (startDate || endDate) {
      whereClause.acceptedAt = {};
      if (startDate) {
        whereClause.acceptedAt = {
          ...(whereClause.acceptedAt as Prisma.DateTimeFilter),
          gte: new Date(startDate)
        };
      }
      if (endDate) {
        whereClause.acceptedAt = {
          ...(whereClause.acceptedAt as Prisma.DateTimeFilter),
          lte: new Date(endDate)
        };
      }
    }

    // Execute queries in parallel for high efficiency
    const [logs, totalCount] = await Promise.all([
      prisma.legalAcceptanceLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          document: {
            select: {
              documentType: true,
              title: true
            }
          }
        },
        orderBy: {
          acceptedAt: "desc"
        },
        take: limit,
        skip: offset
      }),
      prisma.legalAcceptanceLog.count({
        where: whereClause
      })
    ]);

    // Format output
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      acceptedAt: log.acceptedAt,
      acceptedVersion: log.acceptedVersion,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      user: {
        name: log.user?.name || "Unknown User",
        email: log.user?.email || "Unknown Email",
        role: log.user?.role || "owner"
      },
      document: {
        documentType: log.document.documentType,
        title: log.document.title
      }
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("[LEGAL_AUDIT_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
