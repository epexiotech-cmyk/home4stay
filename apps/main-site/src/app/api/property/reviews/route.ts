import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma as db } from "@/lib/database/prisma";
import { z } from "zod";

const ReviewReplySchema = z.object({
  reviewId: z.string(),
  responseMessage: z.string().min(1),
});

const ReviewToggleSchema = z.object({
  reviewId: z.string(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const isPublished = searchParams.get("isPublished") === "true" ? true : undefined;
    const isFeatured = searchParams.get("isFeatured") === "true" ? true : undefined;

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const reviews = await db.propertyReview.findMany({
      where: {
        propertyId,
        isPublished,
        isFeatured
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculate summary stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
      : 0;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        responseRate: Number(((reviews.filter(r => r.responseMessage).length / totalReviews) * 100).toFixed(0)) || 0
      }
    });

  } catch (error) {
    console.error("Reviews Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Moderation / Reply API
export async function PATCH(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "owner", "partner", "manager"]);
    
    if (!authorized) {
      return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });

    // OWNERSHIP VALIDATION
    const review = await db.propertyReview.findUnique({ where: { id: reviewId } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    if (role !== "admin" && role !== "super_admin" && review.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant review moderation denied" }, { status: 403 });
    }
    
    // Determine if it's a reply or a toggle
    if (body.responseMessage) {
      const validation = ReviewReplySchema.safeParse(body);
      if (!validation.success) return NextResponse.json({ error: "Invalid reply data" }, { status: 400 });

      const updated = await db.propertyReview.update({
        where: { id: reviewId },
        data: {
          responseMessage: body.responseMessage,
          responseAt: new Date().toISOString()
        }
      });

      return NextResponse.json({ success: true, review: updated });
    } else {
      const validation = ReviewToggleSchema.safeParse(body);
      if (!validation.success) return NextResponse.json({ error: "Invalid toggle data" }, { status: 400 });

      const updated = await db.propertyReview.update({
        where: { id: reviewId },
        data: {
          isPublished: body.isPublished,
          isFeatured: body.isFeatured
        }
      });

      return NextResponse.json({ success: true, review: updated });
    }

  } catch (error) {
    console.error("Review Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
