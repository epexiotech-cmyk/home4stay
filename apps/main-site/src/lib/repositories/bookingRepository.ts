import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class BookingRepository {
  async findAllowedPropertyIds(userId: string): Promise<string[]> {
    const props = await prisma.property.findMany({ where: { ownerId: userId }, select: { id: true } });
    return props.map(p => p.id);
  }
  
  async create(data: Prisma.BookingUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.booking.create({ data });
  }

  async createBookingGuest(bookingId: string, guestId: string, isPrimary: boolean, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.bookingGuest.create({ data: { bookingId, guestId, isPrimaryGuest: isPrimary } });
  }

  async createConciergeService(data: Prisma.BookingConciergeServiceUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.bookingConciergeService.create({ data });
  }

  async findManyWithPagination(options: { propertyId?: string; allowedPropertyIds?: string[]; limit?: number; offset?: number }) {
    const whereClause: Prisma.BookingWhereInput = {};
    if (options.propertyId) {
      whereClause.propertyId = options.propertyId;
    } else if (options.allowedPropertyIds && options.allowedPropertyIds.length > 0) {
      whereClause.propertyId = { in: options.allowedPropertyIds };
    }

    const data = await prisma.booking.findMany({
      where: whereClause,
      include: {
        property: { select: { name: true } },
        room: { select: { name: true } },
        guests: {  include: { guest: { select: { firstName: true, lastName: true } } } }
      },
      take: options.limit || 50,
      skip: options.offset || 0,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.booking.count({ where: whereClause });

    return { data, total, page: 1, limit: options.limit || 50 };
  }

  async findByIdWithRelations(id: string) {
    return await prisma.booking.findUnique({ where: { id }, include: { property: true, room: true, guests: true } });
  }

  async findById(id: string) {
    return await prisma.booking.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string, paymentStatus: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.booking.update({ where: { id }, data: { status, paymentStatus } });
  }

  async checkDuplicateUtr(utr: string, bookingId: string) {
    return await prisma.paymentTransaction.findFirst({ where: { utrNumber: utr, gatewayOrderId: { not: bookingId } } });
  }

  async updatePaymentStatusAndUtr(bookingId: string, paymentStatus: string, utr: string | null) {
    return await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus } });
  }

  async checkGuestAccess(bookingId: string, userId: string) {
    return true;
  }

  async findInvoiceByBookingId(bookingId: string) {
    return await prisma.invoiceRecord.findFirst({ where: { bookingId } });
  }
}

export const bookingRepository = new BookingRepository();
