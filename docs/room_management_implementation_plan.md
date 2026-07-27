# Room Management Implementation Plan (Sprint 3)

## Objective
Establish a robust, enterprise-grade Room Management Foundation by addressing architectural gaps in the current CRUD implementation. This sprint will introduce structured capacity, inventory tracking, type-safe services, and availability calculation logic.

## Task Sequence

### Task 1: Repository Layer Review & Refactoring
- Upgrade `PropertyRoomRepository` to support transactions and relational includes (e.g., fetching a room with its inventory).
- Create `PropertyRoomInventoryRepository`.

### Task 2: Validation & DTO Standardization
- Update `propertyRoomSchema` to strictly type the new capacity fields based on the Domain Model Audit.
- Create DTO interfaces (`CreateRoomDto`, `UpdateRoomDto`) to replace the `any` types currently used in `PropertyService`.
- Create validation schemas for inventory updates (`updateRoomInventorySchema`).

### Task 3: Service Layer
- Refactor `PropertyService.createRoom` to utilize the new DTOs.
- Implement a Prisma transaction within `createRoom` to automatically provision a `RoomInventory` record whenever a new `Room` is created.
- Move room ownership validation deeper into the service layer to ensure cross-tenant boundaries are protected at the domain level.

### Task 4: Availability & Inventory Engine
- Implement an `AvailabilityEngine` within `PropertyService`.
- Create a method `checkRoomAvailability(roomId, startDate, endDate)` that calculates real-time availability by cross-referencing `RoomInventory` against active `Booking` records.

### Task 5: Database Schema Review & Migration
*(Only if still required after Tasks 1–4)*
- Refactor `Room.capacity` in Prisma to match the Recommended Domain Model (see Audit section).
- Create an explicit foreign key relation from `RoomInventory` to `Room` with `onDelete: Cascade`.

### Task 6: Thin Controllers
- Update `api/property/room/route.ts` to consume the new strictly-typed service methods.
- Create `api/property/room/[roomId]/inventory/route.ts` as a thin controller to manage inventory counts.
- Create `api/property/room/[roomId]/availability/route.ts` to expose the new Availability Engine to the frontend.

### Task 7: Media & Amenities Integration
- Refactor Room Image handling to align with the `PropertyMediaRepository` patterns established in Sprint 2, replacing the generic JSON array.
- Create a standardized Room Amenities payload structure and update the API routes and services to handle it.

### Task 8: Booking Integration Review
- Verify that `BookingEngine` successfully integrates with the new `AvailabilityEngine` and `RoomInventory` state transitions.

### Task 9: Architecture Verification
- Final comprehensive audit confirming thin controllers, absence of direct repository usages in routes, and 100% type safety.

---

## Room.capacity Domain Audit

**Current State Analysis:**
- **Format:** `String` (Database level).
- **Validators:** Defined as `z.string().min(1)` in both `property.validators.ts` and `onboarding/validation.ts`.
- **UI Usage:** Handled as a free-text string default `2 Guests` in `RoomForm.tsx`, and parsed as `room.capacity || room.occupancy || "2 Adults"` in `RoomSelection.tsx`.
- **Booking Usage:** The booking engine does not currently read the room's guest capacity for validation. Mentions of "capacity" in `bookingEngine.ts` refer to Room Inventory Count (holding physical rooms) rather than Occupant Capacity per room.

**Recommended Final Domain Model:**
The free-text string model prevents mathematical validation at checkout (e.g., preventing 4 adults from booking a 2-person room). The recommended database schema migration is:
- **`maxGuests`**: `Int` (Total combined maximum occupancy)
- **`maxAdults`**: `Int` (Maximum allowed adults)
- **`maxChildren`**: `Int` (Maximum allowed children)
*(Alternatively, a single `maxOccupancy: Int` field if demographic breakdown is unnecessary).*
All UIs and Validators should migrate from the `"2 Guests"` string to numeric dropdowns or inputs.
