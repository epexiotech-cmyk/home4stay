import { prisma } from "../database/prisma";
import { Prisma, GuestKYC } from "@prisma/client";

export class KycRepository {
  async getBookingAndPrimaryGuest(bookingId: string) {
    return await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guests: {
          where: { isPrimaryGuest: true },
          include: { guest: true },
          take: 1
        },
      }
    });
  }

  async getGuestKyc(guestId: string) {
    return await prisma.guestKYC.findUnique({
      where: { guestId }
    });
  }

  /**
   * Atomic KYC submission
   */
  async submitKyc(
    bookingId: string,
    guestId: string,
    data: {
      documentType: string;
      documentFront: string;
      documentBack?: string;
      selfieImage?: string;
    },
    nextBookingStatus: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const existingKyc = await tx.guestKYC.findUnique({ where: { guestId } });
      
      const kyc = await tx.guestKYC.upsert({
        where: { guestId },
        update: {
          documentType: data.documentType,
          documentFront: data.documentFront,
          documentBack: data.documentBack,
          selfieImage: data.selfieImage,
          verificationStatus: "UNDER_REVIEW",
          updatedAt: new Date()
        },
        create: {
          guestId,
          documentType: data.documentType,
          documentFront: data.documentFront,
          documentBack: data.documentBack,
          selfieImage: data.selfieImage,
          verificationStatus: "UNDER_REVIEW",
        }
      });

      await tx.guest.update({
        where: { id: guestId },
        data: { kycStatus: "UNDER_REVIEW" }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: nextBookingStatus }
      });

      return kyc;
    });
  }

  /**
   * Atomic KYC approval
   */
  async approveKyc(
    bookingId: string,
    guestId: string,
    nextBookingStatus: string
  ) {
    return await prisma.$transaction(async (tx) => {
      await tx.guestKYC.update({
        where: { guestId },
        data: {
          verificationStatus: "VERIFIED",
          verificationTimestamp: new Date(),
          updatedAt: new Date()
        }
      });

      await tx.guest.update({
        where: { id: guestId },
        data: {
          aadhaarVerified: true,
          policeVerificationReady: true,
          kycStatus: "VERIFIED"
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: nextBookingStatus }
      });
    });
  }

  /**
   * Atomic KYC rejection
   */
  async rejectKyc(
    bookingId: string,
    guestId: string,
    nextBookingStatus: string
  ) {
    return await prisma.$transaction(async (tx) => {
      await tx.guestKYC.update({
        where: { guestId },
        data: {
          verificationStatus: "REJECTED",
          updatedAt: new Date()
        }
      });

      await tx.guest.update({
        where: { id: guestId },
        data: { kycStatus: "REJECTED" }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: nextBookingStatus }
      });
    });
  }
}

export const kycRepository = new KycRepository();
