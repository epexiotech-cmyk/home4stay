# Property Architecture Verification

## Architecture Score
**85 / 100**

Significant progress was made during Sprint 2. The core Property Service was standardized, and the vast majority of API routes were successfully refactored into thin controllers using `withErrorHandler` and `successResponse`. However, a comprehensive audit revealed a subset of peripheral routes that bypassed the Task 4 refactor.

## Remaining Architectural Violations

The following files violate the Sprint 2 Architecture Freeze constraints:

### 1. `api/property/[propertyId]/cms/route.ts`
- **Violations:** 
  - Imports and directly calls `propertyCmsRepository` (Bypasses Service Layer).
  - Uses manual `try/catch` and `NextResponse.json` instead of `withErrorHandler` / `successResponse`.
  - Contains inline business logic: `getFallbackInitialPayload` and cache invalidation orchestration (`cacheGet`, `cacheSet`).

### 2. `api/property/[propertyId]/cms/publish/route.ts`
- **Violations:** 
  - Imports and directly calls `propertyCmsRepository`.
  - Uses manual `try/catch` and `NextResponse.json`.
  - Contains inline business logic: orchestrates the creation of a snapshot payload, fallback state, and publishes the version ID.

### 3. `api/property/promotions/validate-coupon/route.ts`
- **Violations:**
  - Imports and directly calls `propertyOfferRepository`.
  - Uses manual `try/catch` and `NextResponse.json`.
  - Contains inline business logic: manually compares `offer.startDate` and `offer.endDate`, and validates the `minimumBookingAmount`. This logic belongs inside `PropertyService.validateCoupon()`.

### 4. `api/property/image/route.ts`
- **Violations:**
  - **Severe:** Bypasses the PostgreSQL database entirely. It directly manipulates the legacy `packages/data/property.json` mock database using `fs.readFileSync` and `fs.writeFileSync`.
  - Bypasses standard RBAC guards (`requireRole`) by implementing inline JWT verification using the `jose` library.
  - Uses manual `try/catch` and `NextResponse.json`.
  - Contains inline business logic (Sharp optimization, size limits, file system manipulation).

## Production Readiness
**Not Ready**
While the core domain is well-structured, the peripheral routes (CMS caching, coupon validation, image uploading) violate the service-layer abstraction and thin-controller paradigm. The `image/route.ts` specifically relies on an insecure mock filesystem database which is a critical production blocker.

## Recommendation
A dedicated Sprint 2 cleanup task must be scheduled to:
1. Extract `validateCoupon`, CMS payload generation, and CMS publishing logic into `PropertyService`.
2. Refactor the `[propertyId]/cms`, `cms/publish`, and `validate-coupon` routes into Thin Controllers.
3. Completely rewrite `api/property/image/route.ts` to utilize the `PropertyMediaRepository` (PostgreSQL) instead of manipulating a local `property.json` file.
