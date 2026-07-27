import { prisma } from "../database/prisma";
import { PaymentStatus, PaymentTransaction, Prisma } from "@prisma/client";

export class PaymentRepository {
  static async findTransactionById(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentTransaction.findUnique({
      where: { id },
      include: { provider: true, reconciliation: true }
    });
  }

  static async findDuplicateUtr(utrNumber: string, propertyId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentTransaction.findFirst({
      where: {
        utrNumber,
        propertyId,
        paymentStatus: { in: [PaymentStatus.PENDING_APPROVAL, PaymentStatus.APPROVED, PaymentStatus.SUCCESS] }
      }
    });
  }

  static async findPendingSubmission(propertyId: string, providerId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentTransaction.findFirst({
      where: {
        propertyId,
        providerId,
        paymentStatus: PaymentStatus.PENDING_APPROVAL,
        createdAt: { gt: new Date(Date.now() - 3600000) } // Last hour
      }
    });
  }

  static async updateTransaction(id: string, data: Prisma.PaymentTransactionUpdateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentTransaction.update({
      where: { id },
      data
    });
  }

  static async createAuditLog(data: Prisma.PaymentAuditLogUncheckedCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentAuditLog.create({ data });
  }

  static async findReconciliation(transactionId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentReconciliation.findUnique({
      where: { transactionId }
    });
  }

  static async updateReconciliation(transactionId: string, data: Prisma.PaymentReconciliationUpdateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentReconciliation.update({
      where: { transactionId },
      data
    });
  }

  static async createReconciliation(data: Prisma.PaymentReconciliationUncheckedCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.paymentReconciliation.create({ data });
  }

  static async findUserTransactions(userId: string, status?: PaymentStatus, limit: number = 10, offset: number = 0, tx: Prisma.TransactionClient = prisma) {
    const whereClause: Prisma.PaymentTransactionWhereInput = {
      property: { is: { ownerId: userId } }
    };
    if (status) whereClause.paymentStatus = status;

    const [transactions, totalCount] = await Promise.all([
      tx.paymentTransaction.findMany({
        where: whereClause,
        include: {
          property: { select: { id: true, title: true, slug: true } },
          subscription: true,
          provider: { select: { displayName: true, providerType: true } }
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset
      }),
      tx.paymentTransaction.count({ where: whereClause })
    ]);

    return { transactions, pagination: { total: totalCount, limit, offset } };
  }
}

