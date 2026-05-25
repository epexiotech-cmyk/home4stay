import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/database/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // 3. Formulate filters
    const whereClause: import("@prisma/client").Prisma.PaymentTransactionWhereInput = {
      property: {
        is: {
          ownerId: auth.userId
        }
      }
    };

    if (statusParam) {
      const upperStatus = statusParam.toUpperCase();
      if (Object.values(PaymentStatus).includes(upperStatus as PaymentStatus)) {
        whereClause.paymentStatus = upperStatus as PaymentStatus;
      }
    }

    // 4. Fetch paged transactions
    const [transactions, totalCount] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true
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

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("[MY_TRANSACTIONS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
