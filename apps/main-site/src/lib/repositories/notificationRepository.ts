import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

export class NotificationRepository {
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  static async getRecentNotifications(userId: string, take: number = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take
    });
  }

  static async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id }
    });
  }

  static async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
