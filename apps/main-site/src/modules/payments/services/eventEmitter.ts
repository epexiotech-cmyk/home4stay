import { EventEmitter } from "events";

export class PaymentEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Enforce large listener capability if scalable hooks are registered later
    this.setMaxListeners(100);
  }
}

// Global shared payment events instance
export const paymentEvents = new PaymentEventEmitter();

// Define clean event name constants for static analysis type-safety
export const PAYMENT_EVENTS = {
  BOOKING_PAYMENT_CREATED: "BOOKING_PAYMENT_CREATED",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
} as const;

// Example subscriber log bind for audit observability
paymentEvents.on("BOOKING_PAYMENT_CREATED", (data) => {
  console.log(`[EVENT] [BOOKING_PAYMENT_CREATED] Booking: ${data.bookingId}, Amount: ${data.amount}`);
});

paymentEvents.on("PAYMENT_SUBMITTED", (data) => {
  console.log(`[EVENT] [PAYMENT_SUBMITTED] Booking: ${data.bookingId}, UTR: ${data.utrNumber}`);
});

paymentEvents.on("PAYMENT_EXPIRED", (data) => {
  console.log(`[EVENT] [PAYMENT_EXPIRED] Booking: ${data.bookingId}, Room: ${data.roomId} hold released.`);
});

paymentEvents.on("PAYMENT_CONFIRMED", (data) => {
  console.log(`[EVENT] [PAYMENT_CONFIRMED] Booking: ${data.bookingId} payment verified.`);
});

paymentEvents.on("PAYMENT_REJECTED", (data) => {
  console.log(`[EVENT] [PAYMENT_REJECTED] Booking: ${data.bookingId} payment rejected.`);
});
