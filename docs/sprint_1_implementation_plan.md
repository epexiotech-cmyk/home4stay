# Home4Stay Sprint 1 Implementation Plan (Revised)

## 1. Sprint Goal
The objective of Sprint 1 is to strictly establish the core Authentication and Authorization foundations for the Home4Stay monorepo. It explicitly excludes all business domain features (Bookings, CMS, Payments, etc.) and avoids sweeping project-wide refactoring. The goal is to build a highly secure, correctly abstracted, and validated Auth API layer that subsequent feature sprints can rely upon, backed by standard API response utilities and environment validations.

## 2. Features Included
This sprint focuses exclusively on the following core foundation:

1. **Authentication Foundation**
   - Login, Register, Logout
   - Refresh Token, Current User
   - Session Handling, JWT
2. **Authorization**
   - Role Checking, Permission Checking, Auth Guards
3. **Core API Foundation**
   - Standard API Response
   - Central Error Handling
   - Logging Utilities
   - Environment Validation
4. **Validation**
   - Strictly limited to Authentication APIs
5. **Repository Layer**
   - User Repository, Auth Repository
6. **Service Layer**
   - User Service, Auth Service

*Explicitly Excluded: Schema/Dead Model cleanup, Booking, Payments, Property, CMS, Media, Calendar, Notifications, Analytics, Reports, Partner Dashboard, Super Admin, Generic Repositories, and Full Project Zod Validation.*

## 3. Task Breakdown

### TASK-1: Core API Foundation Utilities
- **Title**: Implement Core API Utilities
- **Description**: Establish the base utilities required before building APIs: Environment Validation (validating JWT secrets exist), Logging Utilities, Central Error Handling, and a Standard API Response wrapper.
- **Files Expected**: `src/lib/utils/env.ts`, `src/lib/utils/logger.ts`, `src/lib/utils/apiResponse.ts`, `src/lib/middleware/errorHandler.ts`
- **Dependencies**: None
- **Risk**: Low
- **Estimated Complexity**: Small

### TASK-2: Authentication Validation Schemas
- **Title**: Zod Validation for Auth APIs
- **Description**: Implement strict Zod schemas explicitly for the Auth flow (Login, Register, Refresh).
- **Files Expected**: `src/lib/validations/auth.schema.ts`
- **Dependencies**: None
- **Risk**: Low
- **Estimated Complexity**: Small

### TASK-3: User & Auth Repositories
- **Title**: Auth Data Access Layer
- **Description**: Implement specific repositories to isolate Prisma queries for Users and Sessions.
- **Files Expected**: `src/lib/repositories/user.repository.ts`, `src/lib/repositories/auth.repository.ts`
- **Dependencies**: None
- **Risk**: Medium
- **Estimated Complexity**: Medium

### TASK-4: User & Auth Services
- **Title**: Auth Business Logic Layer
- **Description**: Build the `AuthService` (JWT signing, verification, session lifecycle) and `UserService` (password hashing, user creation) utilizing the Repositories.
- **Files Expected**: `src/lib/services/auth.service.ts`, `src/lib/services/user.service.ts`
- **Dependencies**: TASK-3
- **Risk**: High (Core security logic)
- **Estimated Complexity**: Medium

### TASK-5: Authentication API Routes
- **Title**: Implement Auth Endpoints
- **Description**: Refactor or build the Next.js API routes for Login, Register, Logout, Refresh Token, and Current User. Wire them to use the Validation Schemas, Auth/User Services, and Standard API Responses.
- **Files Expected**: `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/refresh/route.ts`, `src/app/api/auth/me/route.ts`
- **Dependencies**: TASK-1, TASK-2, TASK-4
- **Risk**: High
- **Estimated Complexity**: Large

### TASK-6: Authorization Guards
- **Title**: Implement Auth & Role Guards
- **Description**: Build utility functions and middleware specifically designed to verify tokens, check User Roles, and validate Permissions before allowing route access.
- **Files Expected**: `src/lib/auth/guards.ts`, `src/lib/auth/roles.ts`
- **Dependencies**: TASK-4, TASK-5
- **Risk**: Medium
- **Estimated Complexity**: Medium

## 4. Implementation Order
1. **TASK-1**: Core API Foundation Utilities (No dependencies)
2. **TASK-2**: Authentication Validation Schemas (No dependencies)
3. **TASK-3**: User & Auth Repositories (No dependencies)
4. **TASK-4**: User & Auth Services (Depends on TASK-3)
5. **TASK-5**: Authentication API Routes (Depends on TASK-1, TASK-2, TASK-4)
6. **TASK-6**: Authorization Guards (Depends on TASK-4, TASK-5)

## 5. Risk Analysis
- **Critical Risks**: JWT secret exposure or session hijacking. *Mitigation*: Strictly enforce Environment Validation (TASK-1) to ensure secure salts/secrets are loaded before the app boots, and implement HttpOnly secure cookies during TASK-5.
- **Medium Risks**: Breaking existing mocked logins currently used by frontend developers. *Mitigation*: Ensure the new standard API responses closely map to the current JSON shapes expected by the frontend components.
- **Low Risks**: Typographical errors in Zod schemas. *Mitigation*: Validation strategy includes automated type checking.

## 6. Validation Strategy
- **TypeScript**: `tsc --noEmit` must pass without errors for all modified/created files.
- **Runtime Tests**: Manual API testing via Postman/cURL to verify:
  - Register API creates a user in the database.
  - Login API returns a secure JWT and formatted standard response.
  - Refresh API mints a new token.
  - Invalid payloads trigger centralized Zod error responses.
- **Environment**: Application fails to start if critical `.env` variables (e.g., `JWT_SECRET`) are missing.

## 7. Deliverables
- Environment Validation Utility
- Standardized API Response & Error Handling utilities
- Authentication Zod Schemas
- `UserRepository` and `AuthRepository`
- `UserService` and `AuthService`
- End-to-end connected API Routes: `/api/auth/login`, `/register`, `/logout`, `/refresh`, `/me`
- Role & Permission Checking Guards

## 8. Definition of Done
Sprint 1 is strictly considered complete when:
1. Environment variables are successfully validated on startup.
2. The 5 core Auth API endpoints (Login, Register, Logout, Refresh, Me) are fully functional, correctly validated by Zod, and return standardized responses.
3. The API endpoints rely 100% on the `AuthService` and `UserService`, with zero direct `prisma` calls in the Next.js route handlers.
4. Role and permission checking utilities are implemented and ready to be used by future feature sprints.
