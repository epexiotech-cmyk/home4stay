import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { prisma } from "@/lib/database/prisma";

const authService = new AuthService();

async function meHandler(request: NextRequest) {
  console.log(`\n[API auth-me] Header 'cookie':`, request.headers.get("cookie"));
  console.log(`[API auth-me] request.cookies.getAll():`, JSON.stringify(request.cookies.getAll()));

  // 1. Authenticate (any role allowed)
  const { authorized, userId, propertyId } = await requireRole(request, ["admin", "super_admin", "partner", "owner", "manager", "customer"]);
  
  if (!authorized) {
    return NextResponse.json({ user: null }); // Returning 200 with null for unauthenticated guests
  }

  // 2. Fetch user via Prisma to include properties
  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    include: {
      properties: {
        include: { onboardingSession: true }
      },
      propertyAccesses: {
        include: { property: { include: { onboardingSession: true } } }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const property = user.propertyAccesses?.[0]?.property || user.properties?.[0];

  return successResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    propertyId: property?.id || propertyId,
    propertyName: property?.title,
    propertySlug: property?.slug,
    onboardingStatus: property?.onboardingStatus,
    onboardingSessionStatus: property?.onboardingSession?.status
  });
}

export const GET = withErrorHandler(meHandler as any);
