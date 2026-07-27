import { eventBroadcaster } from "@/modules/payments/services/eventBroadcaster";
import { bookingRepository } from "@/lib/repositories/bookingRepository";
import { UserRepository } from "@/lib/repositories/user.repository";

const userRepository = new UserRepository();

export class RealtimeService {
  /**
   * Generates a Server-Sent Events (SSE) stream for realtime updates.
   * Isolates the stream correctly for multi-tenancy.
   */
  async createEventStream(userId: string | null, bookingId: string | null, signal: AbortSignal): Promise<ReadableStream> {
    let isAuthorized = false;
    let authorizedPropertyIds: string[] = [];

    if (userId) {
      const user = await userRepository.findById(userId);
      if (user) {
        isAuthorized = true;
        if (["owner", "manager", "partner", "receptionist", "billing"].includes(user.role)) {
          authorizedPropertyIds = await bookingRepository.findAllowedPropertyIds(userId);
        } else if (["admin", "super_admin"].includes(user.role)) {
          // Administrative roles have unbounded access. 
          authorizedPropertyIds = ["*"];
        }
      }
    }

    const encoder = new TextEncoder();

    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ connected: true, timestamp: new Date().toISOString() })}\n\n`));

        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keepalive pulse\n\n"));
          } catch {
            clearInterval(keepAliveInterval);
          }
        }, 15000);

        const unsubscribe = eventBroadcaster.subscribe(({ type, payload }) => {
          try {
            let shouldPush = false;

            // Guest Checkout Stream Validation
            if (bookingId && payload.bookingId === bookingId) {
              shouldPush = true;
            }

            // Owner Dashboard Stream Validation (Multi-Tenant Isolation)
            if (isAuthorized && !bookingId) {
              if (authorizedPropertyIds.includes("*")) {
                shouldPush = true;
              } else if (payload.propertyId && authorizedPropertyIds.includes(payload.propertyId)) {
                shouldPush = true;
              }
            }

            if (shouldPush) {
              const data = JSON.stringify({ type, ...payload });
              controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
            }
          } catch (err) {
            console.error("[RealtimeService] Failed to stream message packet", err);
            unsubscribe();
            clearInterval(keepAliveInterval);
            controller.close();
          }
        });

        signal.addEventListener("abort", () => {
          unsubscribe();
          clearInterval(keepAliveInterval);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      }
    });
  }
}

export const realtimeService = new RealtimeService();
