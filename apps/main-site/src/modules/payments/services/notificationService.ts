import { prisma } from "@/lib/database/prisma";

export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP" | "WHATSAPP";

export interface NotificationPayload {
  userId: string;
  bookingId?: string;
  title: string;
  message: string;
  type: string;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Dispatch a notification across selected channels
   */
  public async send(
    channels: NotificationChannel[],
    payload: NotificationPayload
  ): Promise<void> {
    const promises = channels.map(async (channel) => {
      switch (channel) {
        case "IN_APP":
          await this.sendInApp(payload);
          break;
        case "EMAIL":
          await this.sendEmailMock(payload);
          break;
        case "PUSH":
          await this.sendPushMock(payload);
          break;
        case "WHATSAPP":
          await this.sendWhatsAppMock(payload);
          break;
      }
    });

    await Promise.all(promises);
  }

  private async sendInApp(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          bookingId: payload.bookingId || null,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          isRead: false
        }
      });
      console.log(`[NotificationService] Saved In-App notification for user: ${payload.userId}`);
    } catch (err) {
      console.error("[NotificationService] Failed to record in-app notification:", err);
    }
  }

  private async sendEmailMock(payload: NotificationPayload): Promise<void> {
    console.log(`[NotificationMock] [EMAIL] Sending email to User: ${payload.userId}`);
    console.log(`Subject: ${payload.title}`);
    console.log(`Message: ${payload.message}`);
  }

  private async sendPushMock(payload: NotificationPayload): Promise<void> {
    console.log(`[NotificationMock] [PUSH] Sending push notification to User: ${payload.userId}`);
    console.log(`Title: ${payload.title}`);
    console.log(`Body: ${payload.message}`);
  }

  private async sendWhatsAppMock(payload: NotificationPayload): Promise<void> {
    console.log(`[NotificationMock] [WHATSAPP] Future placeholder message to User: ${payload.userId}`);
    console.log(`Text: ${payload.message}`);
  }
}

export const notificationService = NotificationService.getInstance();
