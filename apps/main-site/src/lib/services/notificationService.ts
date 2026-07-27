import { NotificationRepository } from "@/lib/repositories/notificationRepository";
import { AppError } from "@/lib/errors/handler";

export class NotificationService {
  static async getUserNotifications(userId: string) {
    const [unreadCount, notifications] = await Promise.all([
      NotificationRepository.getUnreadCount(userId),
      NotificationRepository.getRecentNotifications(userId, 50)
    ]);

    return { unreadCount, notifications };
  }

  static async markAllAsRead(userId: string) {
    await NotificationRepository.markAllAsRead(userId);
    return { success: true, message: "All notifications marked as read." };
  }

  static async markAsRead(userId: string, notificationId: string) {
    if (!notificationId) {
      throw new AppError("Missing notificationId", 400, "BAD_REQUEST");
    }

    const notification = await NotificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    if (notification.userId !== userId) {
      throw new AppError("Access Denied", 403, "FORBIDDEN");
    }

    await NotificationRepository.markAsRead(notificationId);
    return { success: true, message: "Notification marked as read." };
  }
}
