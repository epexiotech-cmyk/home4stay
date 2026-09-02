import { prisma } from "@/lib/database/prisma";
import { withTransaction } from "@/lib/database/transactions";
import { paymentEvents } from "@/modules/payments/services/eventEmitter";

export class InventoryLockService {
  /**
   * Sets up a room hold lock for a specified duration (default 15 minutes).
   */
  static async createRoomHold(bookingId: string, timeoutMinutes = 15): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);
      
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          temporaryInventoryLockedUntil: expiresAt,
          paymentStatus: "PENDING_PAYMENT",
          status: "DRAFT"
        }
      });
      
      return true;
    } catch (err) {
      console.error("Failed to create room hold:", err);
      return false;
    }
  }

  /**
   * Scans and auto-releases all bookings whose temporary inventory locks have expired.
   * Restores available room counts atomically inside a PostgreSQL transaction.
   * Returns the count of released bookings.
   */
  static async releaseExpiredLocks(): Promise<number> {
    try {
      const now = new Date();
      
      // Find all bookings with expired locks that are still in PENDING_PAYMENT state
      const expiredBookings = await prisma.booking.findMany({
        where: {
          paymentStatus: "PENDING_PAYMENT",
          temporaryInventoryLockedUntil: {
            lt: now
          }
        },
        select: {
          id: true,
          roomId: true,
          amount: true
        }
      });

      if (expiredBookings.length === 0) {
        return 0;
      }

      console.log(`[INVENTORY_LOCK] Found ${expiredBookings.length} expired room holds. Commencing atomic release...`);

      let releasedCount = 0;

      for (const booking of expiredBookings) {
        // Execute atomic release for each booking in a transaction
        const success = await withTransaction(async (tx) => {
          // 1. Double check room hold status inside the row lock
          const bookingCheck = await tx.query(
            "SELECT payment_status FROM bookings WHERE id = $1 FOR UPDATE",
            [booking.id]
          );

          if (
            bookingCheck.rows.length === 0 || 
            bookingCheck.rows[0].payment_status !== "PENDING_PAYMENT"
          ) {
            return false; // Already updated by another worker
          }

          // 2. Increment room inventory capacity by 1
          console.log(`[INVENTORY_LOCK] Restoring inventory for room ${booking.roomId}...`);
          await tx.query(
            "UPDATE room_inventory SET available_count = available_count + 1 WHERE room_id = $1",
            [booking.roomId]
          );

          // 3. Mark booking as EXPIRED
          await tx.query(
            `UPDATE bookings 
             SET payment_status = 'EXPIRED', status = 'EXPIRED', updated_at = NOW() 
             WHERE id = $1`,
            [booking.id]
          );

          return true;
        });

        if (success) {
          releasedCount++;
          // Trigger internal model event for decoupling
          paymentEvents.emit("PAYMENT_EXPIRED", {
            bookingId: booking.id,
            roomId: booking.roomId,
            amount: booking.amount
          });
        }
      }

      console.log(`[INVENTORY_LOCK] Successfully released ${releasedCount} expired room holds.`);
      return releasedCount;
    } catch (err) {
      console.error("Critical error in releaseExpiredLocks:", err);
      return 0;
    }
  }
}
