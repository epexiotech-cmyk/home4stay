import { NextResponse, NextRequest } from 'next/server'
import { withErrorHandler, AppError } from '@/lib/errors/handler'
import { authorize, Role } from '@/lib/security/rbac'
import { withTransaction } from '@/lib/database/transactions'
import { jwtVerify, JWTPayload } from 'jose'
import { 
  getIdempotencyResponse, 
  setIdempotencyResponse, 
  acquireIdempotencyLock, 
  releaseIdempotencyLock 
} from '@/lib/security/idempotency'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const encodedSecret = new TextEncoder().encode(JWT_SECRET)

interface UserPayload extends JWTPayload {
  username: string;
  role: string;
}

function toUserContext(user: UserPayload) {
  return {
    id: user.username, // map username → id
    username: user.username,
    role: user.role as Role,
  }
}

/**
 * ENTERPRISE BOOKING HANDLER (RACE-CONDITION PROOF)
 * Implements: Redis Lock (SETNX) -> DB Transaction -> Response Cache.
 */
async function bookingHandler(request: NextRequest) {
  const idempotencyKey = request.headers.get('idempotency-key')
  const route = '/api/bookings'

  // 1. AUTHENTICATION & CONTEXT
  const token = request.cookies.get('access-token')?.value
  if (!token) throw new AppError("Unauthorized", 401, "UNAUTHORIZED")

  let user: UserPayload
  try {
    const { payload } = await jwtVerify(token, encodedSecret)
    user = payload as UserPayload
  } catch {
    throw new AppError("Invalid session", 401, "AUTH_INVALID")
  }

  if (!idempotencyKey) {
    throw new AppError("idempotency-key is required", 400, "MISSING_IDEMPOTENCY_KEY")
  }

  // 2. AUTHORIZATION
  authorize(toUserContext(user), ['user', 'admin'])

  const body = await request.json()
  const { 
    propertyId, 
    roomId, 
    startDate, 
    endDate, 
    mealPlanId, 
    amount,
    guestData, // { fullName, email, mobile, kycVerified, ... }
    conciergeServices // Array of { serviceType, amount, configData }
  } = body

  // --- STRICT IDEMPOTENCY FLOW WITH SMART RETRY ---

  // STEP 1: Check cached response
  let cached = await getIdempotencyResponse(user.username, idempotencyKey)
  if (cached) return NextResponse.json(cached)

  // STEP 2: Acquire Redis Lock (with Ownership Safety)
  let lock = await acquireIdempotencyLock(user.username, idempotencyKey, route)
  
  // Smart Retry Loop: If lock not acquired, wait and check cache again
  if (!lock.acquired) {
    for (let i = 0; i < 3; i++) {
      await new Promise(res => setTimeout(res, 100)) // 100ms delay
      
      cached = await getIdempotencyResponse(user.username, idempotencyKey)
      if (cached) return NextResponse.json(cached)

      lock = await acquireIdempotencyLock(user.username, idempotencyKey, route)
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
        `INSERT INTO guests (id, full_name, email, mobile, kyc_status, aadhaar_verified) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (mobile) DO UPDATE SET full_name = EXCLUDED.full_name, kyc_status = EXCLUDED.kyc_status`,
        [guestId, guestData.fullName, guestData.email, guestData.mobile, guestData.kycVerified ? 'VERIFIED' : 'PENDING', guestData.kycVerified]
      )

      // 4. Create Main Booking
      const bookingId = crypto.randomUUID()
      const bookingResult = await tx.query(
        `INSERT INTO bookings (id, property_id, room_id, start_date, end_date, meal_plan, amount, status, source) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [bookingId, propertyId, roomId, startDate, endDate, mealPlanId, amount, 'confirmed', 'Home4Stay']
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
            `INSERT INTO booking_concierge_services (id, booking_id, service_type, amount, config_data, status) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [svcId, bookingId, svc.serviceType, svc.amount, JSON.stringify(svc.configData || {}), 'REQUESTED']
          )

          // Auto-create Operational Concierge Request
          await tx.query(
            `INSERT INTO concierge_requests (id, user_id, booking_id, property_id, category, title, description, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [crypto.randomUUID(), user.username, bookingId, propertyId, svc.serviceType, `Guest Service: ${svc.serviceType}`, `Auto-generated concierge request from booking ${bookingId}`, 'SUBMITTED']
          )
        }
      }

      return bookingResult.rows[0]
    })

    // STEP 4: Store Response in Cache
    await setIdempotencyResponse(user.username, idempotencyKey, result)

    return NextResponse.json(result, { status: 201 })

  } finally {
    // STEP 5: Release Redis Lock (Only if we own it)
    if (lock.lockValue) {
      await releaseIdempotencyLock(user.username, idempotencyKey, lock.lockValue)
    }
  }
}

async function getBookingsHandler(request: NextRequest) {
  const token = request.cookies.get('access-token')?.value
  if (!token) throw new AppError("Unauthorized", 401, "UNAUTHORIZED")

  let user: UserPayload
  try {
    const { payload } = await jwtVerify(token, encodedSecret)
    user = payload as UserPayload
  } catch {
    throw new AppError("Invalid session", 401, "AUTH_INVALID")
  }

  const role = user.role as Role
  const propertyId = request.nextUrl.searchParams.get('propertyId')

  return await withTransaction(async (tx) => {
    let query = `
      SELECT 
        b.*, 
        g.full_name as guest_name, 
        g.email as guest_email, 
        g.mobile as guest_mobile,
        p.title as property_name,
        r.title as room_name
      FROM bookings b
      JOIN booking_guests bg ON b.id = bg.booking_id AND bg.is_primary_guest = true
      JOIN guests g ON bg.guest_id = g.id
      JOIN properties p ON b.property_id = p.id
      JOIN room_inventory r ON b.room_id = r.room_id
    `
    const params: string[] = []

    if (role !== 'admin' && role !== 'super_admin') {
      // If not admin, restrict to properties they own
      query += ` WHERE p.owner_id = $1`
      params.push(user.username)
      
      if (propertyId) {
        query += ` AND b.property_id = $2`
        params.push(propertyId)
      }
    } else if (propertyId) {
      query += ` WHERE b.property_id = $1`
      params.push(propertyId)
    }

    query += ` ORDER BY b.created_at DESC`

    const result = await tx.query(query, params)
    
    // Fetch concierge services for these bookings
    const bookings = result.rows
    for (const b of bookings) {
      const svcResult = await tx.query(
        'SELECT * FROM booking_concierge_services WHERE booking_id = $1',
        [b.id]
      )
      b.conciergeServices = svcResult.rows
    }

    return NextResponse.json(bookings)
  })
}

export const POST = withErrorHandler(bookingHandler)
export const GET = withErrorHandler(getBookingsHandler)
