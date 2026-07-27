# Property Management Implementation Plan

This plan breaks down the refactoring and completion of the Property Management module into isolated, independently reviewable tasks in strict adherence to the Architecture Freeze guidelines.

## Task 1: Repository Layer Standardization
**Objective:** Centralize all Prisma database access for the property domain.
- Review and expand `propertyRepository.ts` to support all necessary queries currently scattered in routes (e.g., CMS fetches, media, experiences, promotions).
- Ensure the repository returns raw data without business logic.
- Verify `Prisma` imports only exist in repositories.

## Task 2: Validation Layer Standardization
**Objective:** Enforce strict data boundaries before business logic execution.
- Review and finalize `property.validators.ts`.
- Remove inline Zod schemas from API routes (e.g., `api/property/route.ts`).
- Create specific Zod schemas for CMS updates, Media creation, and Sub-resource mutations.

## Task 3: Service Layer Refactoring
**Objective:** Centralize business rules, cache management, and aggregate coordination.
- Expand `PropertyService` to handle CMS updates, Media orchestration, caching (`cacheGet`, `cacheSet`), and property publishing rules.
- Eliminate duplicate slug generation logic (ensure only `PropertyService` generates slugs).
- Move ownership verification (`validatePropertyAccess`) explicitly into the Service Layer workflow.

## Task 4: Core CRUD API Route Refactoring
**Objective:** Convert primary property routes to thin controllers.
- Refactor `POST /api/property` (remove mock, invoke service, apply `withErrorHandler` and `successResponse`).
- Implement missing `GET`, `PUT`, `DELETE` routes for standard property management using the thin controller pattern.

## Task 5: Sub-Resource API Route Refactoring (CMS & Media)
**Objective:** Convert sub-domain routes to thin controllers.
- Refactor `api/property/[propertyId]/cms/route.ts` to remove direct Prisma calls and cache logic.
- Refactor `api/property/[propertyId]/media/route.ts`.
- Refactor `api/property/image/route.ts`.
- Ensure all routes use `withErrorHandler` and `successResponse()`.

## Task 6: Sub-Resource API Route Refactoring (Experiences & Others)
**Objective:** Finalize remaining isolated routes.
- Refactor Experiences, Reviews, Promotions, and Payment Settings API routes.
- Eliminate Prisma imports from all remaining `api/property/*` routes.

## Task 7: Business Logic & State Flow Implementation
**Objective:** Enforce property lifecycle rules.
- Implement strict status transition rules in `PropertyService` (e.g., cannot move from `DRAFT` to `LIVE` without essential fields).
- Ensure property deletion safely suspends active properties rather than hard deleting.

---

### Recommended Execution Order
Tasks must be completed sequentially (1 through 7). The repository and validation boundaries must exist before the services can be built, and services must exist before the routes can be converted to thin controllers.
