import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { prisma } from "database";
import { bookingRepository } from "@/lib/repositories/bookingRepository";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return auth.response!;
  }

  const userId = auth.userId!;
  const role = auth.role!;

  let allowedPropertyIds: string[] = [];
  if (["admin", "super_admin"].includes(role)) {
    // Admins see all. For performance, we might want to paginate, but we'll fetch all here for simplicity.
    const allProps = await prisma.property.findMany({ select: { id: true } });
    allowedPropertyIds = allProps.map(p => p.id);
  } else {
    allowedPropertyIds = await bookingRepository.findAllowedPropertyIds(userId);
  }

  if (allowedPropertyIds.length === 0) {
    return successResponse([]); // No properties to manage
  }

  // Fetch bookings for these properties, including primary guest and KYC data
  const bookings = await prisma.booking.findMany({
    where: {
      propertyId: { in: allowedPropertyIds },
    },
    include: {
      property: {
        select: { title: true, id: true }
      },
      guests: {
        where: { isPrimaryGuest: true },
        include: {
          guest: {
            include: {
              kycData: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    // Adding a reasonable limit so we don't fetch thousands of bookings unpaginated
    take: 100
  });

  // Map to a clean response shape
  const guestList = bookings
    .filter(b => b.guests.length > 0)
    .map(b => {
      const primaryGuest = b.guests[0].guest;
      const kyc = primaryGuest.kycData;
      
      return {
        bookingId: b.id,
        propertyId: b.property.id,
        propertyName: b.property.title,
        guestId: primaryGuest.id,
        guestName: primaryGuest.fullName,
        guestEmail: primaryGuest.email,
        guestPhone: primaryGuest.mobile,
        startDate: b.startDate,
        endDate: b.endDate,
        bookingStatus: b.status,
        kycStatus: kyc?.verificationStatus || primaryGuest.kycStatus || "PENDING",
        documentType: kyc?.documentType || null,
        kycUpdatedAt: kyc?.updatedAt || primaryGuest.updatedAt
      };
    });

  // Sort by UNDER_REVIEW first, then by date
  guestList.sort((a, b) => {
    if (a.kycStatus === "UNDER_REVIEW" && b.kycStatus !== "UNDER_REVIEW") return -1;
    if (a.kycStatus !== "UNDER_REVIEW" && b.kycStatus === "UNDER_REVIEW") return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return successResponse(guestList);
});
