# Room Management Architectural Audit

## Executive Summary
This audit reviews the current state of the Room Management module to establish the foundation for Sprint 3. The current implementation is rudimentary, serving only as a basic CRUD wrapper. It lacks the domain logic required for a production-grade property management system, specifically around inventory, capacity, and availability rules.

## Current State Analysis

### 1. Prisma Models & Database Relations
- **Models Present**: `Room`, `RoomInventory`.
- **Issues**:
  - `RoomInventory` is isolated and lacks a formal foreign key relation back to `Room`.
  - Missing a junction table for Room Amenities.
  - The `capacity` field in `Room` is a `String` rather than an integer or structured JSON (e.g., adult/child breakdown), preventing programmatic occupancy calculations.
  - `images` is a generic `Json` field on `Room`, which bypasses the centralized `PropertyMediaRepository` pattern established in Sprint 2.

### 2. Repository Layer
- **`PropertyRoomRepository`**:
  - Implements basic CRUD (`findManyByPropertyId`, `create`, `update`, `delete`).
  - **Issues**: 
    - Lacks advanced querying (e.g., filtering by availability, capacity, or amenities).
    - Missing transactions for atomic room and inventory creation.
    - No `RoomInventoryRepository` exists.

### 3. Service Layer (`PropertyService`)
- **Issues**:
  - Room methods (`createRoom`, `updateRoom`) bypass domain logic entirely. They simply forward calls to the repository.
  - DTOs are completely missing; methods use `any` for input parameters (e.g., `async createRoom(data: any)`).
  - Lacks orchestration for inventory initialization upon room creation.
  - Missing ownership validation within the service layer (currently delegated entirely to the API route).

### 4. API Routes & Thin Controllers
- **`api/property/room/route.ts`**:
  - Successfully refactored during Sprint 2.1 to act as a Thin Controller (`withErrorHandler`, `successResponse`, no repository imports).
  - **Issues**: No dedicated endpoints exist for managing room inventory, room availability, or room-specific media.

### 5. Validation Layer
- **`propertyRoomSchema`**:
  - Exists but is overly permissive.
  - `capacity` is validated simply as `z.string().min(1)` instead of a numeric structure.
  - No schemas exist for room inventory updates, status transitions, or pricing rules.

## Architecture Risks & Technical Debt
1. **Data Integrity Risk**: `RoomInventory` lacks a relational constraint to `Room`. If a room is deleted, its inventory remains orphaned.
2. **Type Safety Violation**: Widespread use of `any` in `PropertyService` for Room operations.
3. **Domain Logic Gap**: There is no Availability Engine to verify if a room can be booked based on existing inventory and active bookings.
4. **Media Inconsistency**: Room images use a generic JSON array on the model rather than leveraging the standard Media architecture.
