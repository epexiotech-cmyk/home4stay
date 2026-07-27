# Property Management Deep Audit Report

## 1. Existing Implementation
The Property Management module currently has a scattered foundation:
- **Models**: `Property` model exists in Prisma with relations to media, cms, experiences, rooms, reviews, etc.
- **Routes**: Multiple API endpoints exist under `app/api/property/...` covering CMS, media, experiences, payment configs, promotions, and reviews.
- **Services**: A `PropertyService` exists but is largely unused.
- **Repositories**: A `PropertyRepository` exists but is largely unused.
- **Validation**: Zod schemas exist in `property.validators.ts`.

## 2. Missing Implementation
- **Property Creation**: The primary `POST /api/property` route is completely mocked (`// 3. DATA PROCESSING (MOCKED)`) and does not actually save data to the database.
- **Full CRUD Support**: Missing standardized robust GET, PUT, DELETE for core property data outside of specific sub-modules.
- **Media Upload**: `media/route.ts` and `image/route.ts` exist but need auditing for actual cloud storage integration vs local stubs.
- **Amenities**: Proper relational mapping and API endpoints for amenity management are lacking or incomplete.

## 3. Architectural Violations (Critical)
The Property module fundamentally violates the Architecture Freeze rules established in Sprint 1:
- **Direct Prisma Access in Routes**: 14+ API routes directly import and use `prisma` to query and mutate data. This completely bypasses the Repository layer.
- **Missing Error Handling**: None of the property routes use the mandatory `withErrorHandler` wrapper.
- **Non-Standard Responses**: None of the property routes use the mandatory `successResponse()` utility, opting for custom `NextResponse.json` payloads.
- **Business Logic in Routes**: Routes are directly handling cache invalidation (`cacheGet`, `cacheSet`), access validation (`validatePropertyAccess`), and payload structuring.

## 4. Duplicate Logic
- **Slug Generation**: Both `api/property/route.ts` and `PropertyService` implement identical slug generation regex/logic manually.

## 5. Repository Violations
- **Bypassed Repositories**: `propertyRepository.ts` exists and follows rules, but the application does not use it. Routes talk to Prisma directly.

## 6. Service Violations
- **Bypassed Services**: `PropertyService` exists but is ignored by the CMS, experiences, and media routes, which handle their own orchestration.

## 7. Route Violations
- **Thick Controllers**: Routes are acting as controllers, services, and repositories simultaneously.
- **Missing Zod**: Many routes (e.g., `cms/route.ts`) manually destructure request bodies without any Zod validation.

## 8. Missing Validations
- Core operations lack strict Zod parsing before database insertion. `POST /api/property` uses an inline schema instead of the centralized `property.validators.ts`.

## 9. Missing APIs
- Robust endpoints for managing Property Settings (Policies, Pricing, Amenities) independently.
- Deletion / Archival flows for Properties.

## 10. Missing Business Rules
- Status transitions: Currently, there is no state machine or strict rules governing how a property moves from `DRAFT` to `LIVE` (e.g., ensuring rooms and media exist before publishing).

## 11. Production Readiness
**Status: NOT PRODUCTION READY.**
The code is fragmented, untested, and bypasses all enterprise architectural layers. It is highly susceptible to unhandled exceptions and payload injection.

## 12. Risks
- **Data Integrity**: Bypassing Zod means malformed data can reach the database.
- **Security**: While RBAC exists, mixing access checks directly with Prisma queries in routes increases the risk of a developer forgetting a check on a new endpoint.
- **Maintainability**: Dispersed logic means a change to the database schema requires updating dozens of API routes instead of one repository.

## 13. Recommendations
A complete teardown and rebuild of the API layer is required, redirecting all flows strictly through:
`Route -> Zod -> PropertyService -> PropertyRepository -> Prisma`.
