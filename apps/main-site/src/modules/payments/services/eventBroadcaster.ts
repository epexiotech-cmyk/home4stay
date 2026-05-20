import { EventEmitter } from "events";

export type RealtimeEventType = 
  | "BOOKING_CREATED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REJECTED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_EXPIRED";

export interface RealtimeEventPayload {
  bookingId: string;
  propertyId?: string;
  userId?: string;
  amount?: number;
  paymentStatus?: string;
  status?: string;
  paymentReference?: string;
  utrNumber?: string;
  timestamp: string;
}

class EventBroadcasterService {
  private emitter: EventEmitter;
  private static instance: EventBroadcasterService;

  private constructor() {
    this.emitter = new EventEmitter();
    // Increase listener limits for multi-tab concurrency scaling
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBroadcasterService {
    if (!EventBroadcasterService.instance) {
      EventBroadcasterService.instance = new EventBroadcasterService();
    }
    return EventBroadcasterService.instance;
  }

  /**
   * Broadcast an event to all active channels and internal listeners
   */
  public broadcast(type: RealtimeEventType, payload: RealtimeEventPayload): void {
    console.log(`[EventBroadcaster] Broadcasting event: ${type}`, payload);
    this.emitter.emit("event", { type, payload });
  }

  /**
   * Subscribe to the global stream of events
   */
  public subscribe(callback: (event: { type: RealtimeEventType; payload: RealtimeEventPayload }) => void): () => void {
    this.emitter.on("event", callback);
    // Return unsubscribe cleanup function
    return () => {
      this.emitter.off("event", callback);
    };
  }
}

export const eventBroadcaster = EventBroadcasterService.getInstance();
