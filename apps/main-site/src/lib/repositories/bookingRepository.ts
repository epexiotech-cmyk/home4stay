import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class BookingRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findAllowedPropertyIds(userId: string): Promise<string[]> {
    const props = await prisma.property.findMany({ where: { ownerId: userId }, select: { id: true } });
    return props.map(p => p.id);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any) {
    return await prisma.booking.create({ data });
  }

  async createBookingGuest(bookingId: string, guestId: string, isPrimary: boolean) {
    return await prisma.bookingGuest.create({ data: { bookingId, guestId, isPrimaryGuest: isPrimary } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createConciergeService(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).conciergeService.create({ data });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findManyWithPagination(options: any) {
    return { data: [], total: 0, page: 1, limit: 10 };
  }

  async findByIdWithRelations(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma.booking as any).findUnique({ where: { id }, include: { property: true, room: true, guests: true } });
  }

  async findById(id: string) {
    return await prisma.booking.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string, paymentStatus: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma.booking as any).update({ where: { id }, data: { status, paymentStatus } });
  }

  async checkDuplicateUtr(utr: string, bookingId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).paymentTransaction.findFirst({ where: { utr, bookingId: { not: bookingId } } });
  }

  async updatePaymentStatusAndUtr(bookingId: string, paymentStatus: string, utr: string | null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma.booking as any).update({ where: { id: bookingId }, data: { paymentStatus } });
  }

  async checkGuestAccess(bookingId: string, userId: string) {
    return true;
  }

  async findInvoiceByBookingId(bookingId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).invoice.findFirst({ where: { bookingId } });
  }
}

export const bookingRepository = new BookingRepository();
