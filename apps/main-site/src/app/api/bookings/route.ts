import { NextResponse, NextRequest } from 'next/server'
import { withErrorHandler, AppError } from '@/lib/errors/handler'
import { withTransaction } from '@/lib/database/transactions'
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { 
  getIdempotencyResponse, 
  setIdempotencyResponse, 
  acquireIdempotencyLock, 
  releaseIdempotencyLock 
} from '@/lib/security/idempotency'

/**
 * ENTERPRISE BOOKING HANDLER (RACE-CONDITION PROOF)
 * Implements: Redis Lock (SETNX) -> DB Transaction -> Response Cache.
 */
async function bookingHandler(request: NextRequest) {
  const idempotencyKey = request.headers.get('idempotency-key')
  const route = '/api/bookings'

  // 1. AUTHENTICATION & CONTEXT
  const { authorized, userId, response } = await requireRole(request, ["user", "customer", "admin", "super_admin"]);
  if (!authorized || !userId) return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!idempotencyKey) {
    throw new AppError("idempotency-key is required", 400, "MISSING_IDEMPOTENCY_KEY")
  }

  // 2. AUTHORIZATION (Checked by requireRole)

  const body = await request.json()
  const { 
    propertyId, 
    roomId, 
    startDate, 
    endDate, 
    mealPlanId, 
    amount,
    guestData, // { fullName, email, mobile, kycVerified, ... }
    conciergeServices, // Array of { serviceType, amount, configData }
    paymentMode // smart_upi or other modes
  } = body

  // --- STRICT IDEMPOTENCY FLOW WITH SMART RETRY ---

  // STEP 1: Check cached response
  let cached = await getIdempotencyResponse(userId, idempotencyKey)
  if (cached) return NextResponse.json(cached)

  // STEP 2: Acquire Redis Lock (with Ownership Safety)
  let lock = await acquireIdempotencyLock(userId, idempotencyKey, route)
  
  // Smart Retry Loop: If lock not acquired, wait and check cache again
  if (!lock.acquired) {
    for (let i = 0; i < 3; i++) {
      await new Promise(res => setTimeout(res, 100)) // 100ms delay
      
      cached = await getIdempotencyResponse(userId, idempotencyKey)
      if (cached) return NextResponse.json(cached)

      lock = await acquireIdempotencyLock(userId, idempotencyKey, route)
      if (lock.acquired) break
    }
  }

  if (!lock.acquired) {
    return NextResponse.json({
      status: "processing",
      message: "Request already in progress. Please wait."
    }, { status: 409 })
  }

  try {
    // Verify that the target property is LIVE and open for bookings!
    const targetProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    if (!targetProperty || targetProperty.status !== "LIVE") {
      throw new AppError("Bookings are only allowed for active, live properties.", 403, "PROPERTY_NOT_LIVE");
    }

    // STEP 3: Execute Database Transaction
    const result = await withTransaction(async (tx) => {
      // 1. Inventory Locking & Check
      const inventory = await tx.query(
        'SELECT available_count FROM room_inventory WHERE room_id = $1 FOR UPDATE',
        [roomId]
      )

      if (inventory.rows.length === 0 || inventory.rows[0].available_count <= 0) {
        throw new AppError("Room is no longer available", 409, "OUT_OF_STOCK")
      }

      // 2. Decrement Inventory
      await tx.query(
        'UPDATE room_inventory SET available_count = available_count - 1 WHERE room_id = $1',
        [roomId]
      )

      // 3. Create/Update Guest Profile
      const guestId = crypto.randomUUID()
      await tx.query(
        `INSERT INTO guests (id, full_name, email, mobile, kyc_status, aadhaar_verified, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (mobile) DO UPDATE SET full_name = EXCLUDED.full_name, kyc_status = EXCLUDED.kyc_status, updated_at = NOW()`,
        [guestId, guestData.fullName, guestData.email, guestData.mobile, guestData.kycVerified ? 'VERIFIED' : 'PENDING', guestData.kycVerified]
      )

      // 4. Create Main Booking
      const bookingId = crypto.randomUUID()
      const initialStatus = paymentMode === "SMART_UPI" ? "pending" : "confirmed"
      const initialPaymentStatus = paymentMode === "SMART_UPI" ? "PENDING_PAYMENT" : "PENDING"

      const bookingResult = await tx.query(
        `INSERT INTO bookings (id, property_id, room_id, start_date, end_date, meal_plan, amount, status, payment_status, payment_mode, source, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
        [bookingId, propertyId, roomId, startDate, endDate, mealPlanId, amount, initialStatus, initialPaymentStatus, paymentMode || null, 'Home4Stay']
      )

      // 5. Link Guest to Booking
      await tx.query(
        'INSERT INTO booking_guests (id, booking_id, guest_id, is_primary_guest) VALUES ($1, $2, $3, $4)',
        [crypto.randomUUID(), bookingId, guestId, true]
      )

      // 6. Create Concierge Requests (if any)
      if (conciergeServices && conciergeServices.length > 0) {
        for (const svc of conciergeServices) {
          const svcId = crypto.randomUUID()
          await tx.query(
            `INSERT INTO booking_concierge_services (id, booking_id, service_type, amount, config_data, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [svcId, bookingId, svc.serviceType, svc.amount, JSON.stringify(svc.configData || {}), 'REQUESTED']
          )

          // Auto-create Operational Concierge Request
          await tx.query(
            `INSERT INTO concierge_requests (id, user_id, booking_id, property_id, category, title, description, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [crypto.randomUUID(), userId, bookingId, propertyId, svc.serviceType, `Guest Service: ${svc.serviceType}`, `Auto-generated concierge request from booking ${bookingId}`, 'SUBMITTED']
          )
        }
      }

      return bookingResult.rows[0]
    })

    let finalResult = { ...result }

    // STEP 3.5: Initialize Smart UPI Payment Intent (if requested)
    if (paymentMode === "SMART_UPI") {
      const { SmartUpiProvider } = await import("@/modules/payments/providers/smartUpi")
      const config = await prisma.propertyPaymentConfig.findFirst({
        where: { propertyId, isActive: true }
      })
      
      const provider = new SmartUpiProvider()
      const intent = await provider.createPaymentIntent(result.id, amount, {
        upiId: config?.upiId,
        merchantName: config?.merchantName
      })

      if (intent.success) {
        finalResult = {
          ...finalResult,
          amount: intent.reconciliationAmount,
          paymentReference: intent.paymentReference,
          paymentExpiresAt: intent.expiresAt,
          qrPayload: intent.qrPayload,
          deepLink: intent.deepLink
        }
      }
    }

    // STEP 4: Store Response in Cache
    await setIdempotencyResponse(userId, idempotencyKey, finalResult)

    return NextResponse.json(finalResult, { status: 201 })

  } catch (error) {
    throw error;
  } finally {
    // STEP 5: Release Redis Lock (Only if we own it)
    if (lock.lockValue) {
      await releaseIdempotencyLock(userId, idempotencyKey, lock.lockValue)
    }
  }
}

async function getBookingsHandler(request: NextRequest) {
  try {
    const { authorized, role, userId, response } = await requireRole(request, [
      "admin", "super_admin", "owner", "partner", "manager", "receptionist", "billing", "housekeeping"
    ]);
    if (!authorized || !userId) return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const propertyId = request.nextUrl.searchParams.get('propertyId');

    // Tenant Isolation Check: If a specific propertyId is requested, verify PropertyUserAccess
    if (propertyId && !["admin", "super_admin"].includes(role || "")) {
      const { requirePropertyAccess } = await import("@/lib/auth/rbac");
      const propAuth = await requirePropertyAccess(request, propertyId);
      if (!propAuth.authorized) return propAuth.response!;
    }

    // 1. Enforce strict, unbounded query pagination controls
    const limitParam = request.nextUrl.searchParams.get('limit');
    const offsetParam = request.nextUrl.searchParams.get('offset');
    const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 50, 100); // Enforce max 100 rows per request
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    return await withTransaction(async (tx) => {
      let query = `
        SELECT 
          b.*, 
          g.full_name as guest_name, 
          g.email as guest_email, 
          g.mobile as guest_mobile,
          p.title as property_name,
          r.name as room_name
        FROM bookings b
        JOIN booking_guests bg ON b.id = bg.booking_id AND bg.is_primary_guest = true
        JOIN guests g ON bg.guest_id = g.id
        JOIN properties p ON b.property_id = p.id
        JOIN rooms r ON b.room_id = r.id
      `;
      const params: unknown[] = [];

      if (role !== 'admin' && role !== 'super_admin') {
        // Enforce PropertyUserAccess filter for non-administrative accounts
        query += ` WHERE b.property_id IN (SELECT property_id FROM property_user_access WHERE user_id = $1)`;
        params.push(userId);
        
        if (propertyId) {
          query += ` AND b.property_id = $2`;
          params.push(propertyId);
        }
      } else if (propertyId) {
        query += ` WHERE b.property_id = $1`;
        params.push(propertyId);
      }

      query += ` ORDER BY b.created_at DESC`;

      // 2. Append SQL Limit and Offset controls
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await tx.query(query, params);
      const bookings = result.rows;

      // 3. Resolve N+1 Queries: Batch query concierge services in exactly ONE efficient SQL roundtrip
      if (bookings.length > 0) {
        const bookingIds = bookings.map(b => b.id);
        const svcResult = await tx.query(
          `SELECT * FROM booking_concierge_services WHERE booking_id = ANY($1)`,
          [bookingIds]
        );

        // Map list items locally
        const servicesByBooking = new Map<string, Record<string, unknown>[]>();
        for (const svc of svcResult.rows) {
          const list = servicesByBooking.get(svc.booking_id) || [];
          list.push(svc);
          servicesByBooking.set(svc.booking_id, list);
        }

        for (const b of bookings) {
          b.conciergeServices = servicesByBooking.get(b.id) || [];
        }
      }

      return NextResponse.json(bookings);
    });
  } catch (err) {
    console.error("Critical Bookings API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const POST = withErrorHandler(bookingHandler)
export const GET = withErrorHandler(getBookingsHandler)
