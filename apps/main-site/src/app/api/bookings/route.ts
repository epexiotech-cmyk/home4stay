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
  const { propertyId, roomId } = body

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
      const inventory = await tx.query(
        'SELECT available_count FROM room_inventory WHERE room_id = $1 FOR UPDATE',
        [roomId]
      )

      if (inventory.rows.length === 0 || inventory.rows[0].available_count <= 0) {
        throw new AppError("Room is no longer available", 409, "OUT_OF_STOCK")
      }

      await tx.query(
        'UPDATE room_inventory SET available_count = available_count - 1 WHERE room_id = $1',
        [roomId]
      )

      const bookingId = crypto.randomUUID()
      const bookingResult = await tx.query(
        'INSERT INTO bookings (id, user_id, property_id, room_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [bookingId, user.username, propertyId, roomId, 'confirmed']
      )

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

export const POST = withErrorHandler(bookingHandler)
