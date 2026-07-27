import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class GuestRepository {
  async findById(id: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.guest.findUnique({
      where: { id }
    });
  }

  async findByMobile(mobile: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.guest.findUnique({
      where: { mobile }
    });
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.guest.findUnique({
      where: { email }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async upsertGuest(mobile: string, data: any, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.guest.upsert({
      where: { mobile },
      update: {
        fullName: data.fullName,
        email: data.email,
        kycStatus: data.kycStatus,
        aadhaarVerified: data.aadhaarVerified
      },
      create: {
        fullName: data.fullName,
        mobile: mobile,
        email: data.email,
        kycStatus: data.kycStatus || 'PENDING',
        aadhaarVerified: data.aadhaarVerified || false
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.guest.update({
      where: { id },
      data
    });
  }
}

export const guestRepository = new GuestRepository();
