import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/database/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Platform Admin or Super Admin only)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const searchProperty = searchParams.get("property");
    const searchOwner = searchParams.get("owner");
    const searchUtr = searchParams.get("utr");
    const statusParam = searchParams.get("status") || "PENDING_APPROVAL";
    
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // 3. Compile dynamic search filters
    const whereClause: any = {};

    // Filter by status
    const upperStatus = statusParam.toUpperCase();
    if (Object.values(PaymentStatus).includes(upperStatus as PaymentStatus)) {
      whereClause.paymentStatus = upperStatus as PaymentStatus;
    }

    // Filter by exact UTR
    if (searchUtr && searchUtr.trim()) {
      whereClause.utrNumber = searchUtr.trim();
    }

    // Filter by Property title (case-insensitive contains)
    if (searchProperty && searchProperty.trim()) {
      whereClause.property = {
        title: {
          contains: searchProperty.trim(),
          mode: "insensitive"
        }
      };
    }

    // Filter by Owner name or email (case-insensitive contains)
    if (searchOwner && searchOwner.trim()) {
      const trimmedOwner = searchOwner.trim();
      whereClause.property = {
        ...(whereClause.property || {}),
        owner: {
          OR: [
            { name: { contains: trimmedOwner, mode: "insensitive" } },
            { email: { contains: trimmedOwner, mode: "insensitive" } }
          ]
        }
      };
    }

    // 4. Fetch queue records
    const [transactions, totalCount] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              title: true,
              slug: true,
              owner: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          subscription: true,
          provider: {
            select: {
              displayName: true,
              providerType: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset
      }),
      prisma.paymentTransaction.count({
        where: whereClause
      })
    ]);

    // 5. Append calculated fields like secure preview URLs and payment age
    const formattedQueue = transactions.map(tx => {
      const ageMs = Date.now() - new Date(tx.createdAt).getTime();
      const ageMinutes = Math.floor(ageMs / (1000 * 60));
      const ageHours = Math.floor(ageMinutes / 60);
      const ageDisplay = ageHours > 0 ? `${ageHours} hours ago` : `${ageMinutes} minutes ago`;

      return {
        id: tx.id,
        status: tx.paymentStatus,
        amount: tx.amount,
        currency: tx.currency,
        utrNumber: tx.utrNumber,
        createdAt: tx.createdAt,
        paymentAge: ageDisplay,
        previewUrl: tx.paymentScreenshotUrl 
          ? `/api/admin/payments/proofs/${tx.paymentScreenshotUrl}`
          : null,
        propertyTitle: tx.property.title,
        ownerDetails: {
          name: tx.property.owner.name,
          email: tx.property.owner.email
        },
        planDetails: {
          planId: tx.subscription?.selectedPlanId,
          billingCycle: tx.subscription?.billingCycle
        }
      };
    });

    return NextResponse.json({
      success: true,
      queue: formattedQueue,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("[PENDING_QUEUE_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
