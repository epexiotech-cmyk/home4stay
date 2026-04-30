# Home4Stay Project Documentation - Progress Report

This document provides a comprehensive breakdown of the Home4Stay monorepo architecture, features, and technical standards. It is designed to help new developers understand the "What", "How", and "Why" behind our implementation.

---

## 🚀 Latest Update (2026-04-29)

### 🔐 Authentication System
- Implemented JWT-based dual-token system (Access + Refresh)
- Added role-based access control (Admin, Partner)
- Implemented secure cookies (HttpOnly, SameSite, Secure)
- Added token expiry + refresh flow

### 🛡️ Security Hardening
- Added API-level `jwtVerify` (Hard Gate)
- Implemented CSRF protection (double-submit pattern)
- Added rate limiting for login, refresh, and contact APIs
- Enforced strict Zod validation across all mutation endpoints

### ⚡ Proxy Optimization
- Migrated middleware → dedicated proxy architecture
- Implemented lightweight `decodeJwt` validation for high-performance routing
- Added role-based route guards and redirect logic
- Added issuer (`iss`) and audience (`aud`) validation
- Added clock skew tolerance (60s) for robust session handling
- Implemented refresh-aware routing (allows silent refresh via API)

### 📊 Audit Logging System
- **Async Non-blocking Architecture**: Uses `fs.promises` to prevent event-loop blocking.
- **Fire-and-Forget Logic**: Optimized APIs to trigger logging without adding request latency.
- **Sequential Write Queue**: Ensures data integrity by serializing log writes, preventing race conditions.
- **Multi-Pivot Rotation**: 
  - Daily rotation (`audit-YYYY-MM-DD.log`).
  - File size-based rotation (auto-parts if > 10MB).
- **Structured JSON Logs**: Detailed schemas including `ts`, `userId`, `role`, `action`, and `rid`.
- **Log Levels**: Support for `info`, `warn`, and `error` tiers.
- **Request Correlation (RID)**: Unique IDs to track request lifecycles across logs.
- **Safe Environment**: Logs stored in non-watched `/logs` directory with environment-aware guards (Dev + Prod).

### 🧠 Dev Infrastructure
- **PID-based Management**: Integrated tracking of development processes.
- **Safe Automation**: Custom start/stop scripts to handle port conflicts and stale processes.
- **Status Monitoring**: Real-time health checking of the monorepo environment.
- **Crawler Integration**: Automated "Hardened QA" crawler for session-aware route testing.

### 🐛 Stability Fixes
- **Infinite Loop Resolution**: Fixed file-watch loops caused by log writing.
- **Architecture Cleanup**: Resolved duplicate export errors and server-side logic in UI components (Footer).
- **Client/Server Separation**: Strict isolation of `fs` and `path` logic from client-side bundles.
- **Dev Stabilization**: Zeroed out all TypeScript linting errors and unused variable warnings.

---

## 📂 Project Structure
- **`apps/main-site`**: The public-facing marketing platform and administrative nerve center. Handles lead generation, property management, and partner relations.
- **`apps/property-site`**: The dynamic engine that powers hundreds of individual property websites. It uses a single code base to serve different property profiles based on the URL.
- **`packages/data`**: The shared brain of the project. Contains the property database, shared types, and data access logic used by both applications.

---

## 🏗️ 1. Core Architecture (The Shared Data Layer)
### What it is:
A centralized package (`@home4stay/data`) that prevents code duplication and ensures data consistency across the entire monorepo.

### How it works:
- **Central Database**: All property information is stored in `packages/data/property.json`.
- **Data Access Layer (DAL)**: Instead of apps reading files directly, they use safe helper functions like `getProperty(slug)` and `getAllProperties()`.
- **Type Safety**: TypeScript interfaces (like `Property` and `Room`) are defined once and enforced everywhere, preventing "undefined" errors.

### Why it matters:
If you add a new room or change a price in the JSON, the marketing site and the property site update **instantly** without needing a single code change.

---

## 🏠 2. Dynamic Property Engine (`apps/property-site`)
### What it is:
A high-performance "Site Generator" that renders custom websites for every property in our database.

### How it works:
- **Slug-Based Routing**: When a user visits `/shivay-resort`, the app identifies `shivay-resort` as a "slug," fetches that specific data from the DAL, and populates the UI.
- **Smart Booking System**:
    - **Dynamic Pricing**: Uses React logic to calculate stay duration (nights) and total costs in real-time.
    - **WhatsApp-First UX**: Instead of complex checkout forms, we generate a pre-filled WhatsApp link with the booking details. This handles 90% of the conversion friction in the Indian market.
    - **Trust Signals**: Features like "Instant Confirmation" and "Secure Booking" are baked into the layout to maximize user confidence.

---

## 📊 3. Admin & Business Suite (`apps/main-site`)
### What it is:
A secure administrative area for the Home4Stay team to manage the business.

### Features & Implementation:
- **Route Guarding (Middleware)**: Every admin page is protected. If you aren't logged in (verified via a secure cookie), the system instantly redirects you to `/admin/login`.
- **Leads CRM Dashboard**: 
    - A real-time view of all property owner inquiries.
    - Features "Click-to-Copy" phone numbers and "Call/WhatsApp" quick-actions for high-speed outreach.
    - Sorting and filtering ensure that "New" leads are never buried under old data.
- **Property Management Hub**:
    - An interface to "spawn" new property websites. 
    - **Slug Hardening**: If you add "Royal Villa" twice, the system automatically creates `royal-villa` and `royal-villa-1` to prevent broken links.
    - **Smart Normalization**: A custom engine that standardizes input. It fixes sloppy typing (e.g., `"manali"` -> `"Manali"`) and handles complex terms like `"3BHK"` or `"Eco-Friendly"` automatically.

---

## 📣 4. Marketing & Data Integrity
### How we protect our data:
- **Atomic Secure Writes**: When the system writes to our JSON database (for leads or properties), it first writes to a temporary file and *then* renames it. This prevents "partial writes" or file corruption if a server crashes mid-save.
- **Input Sanitization**: Every piece of data entering the system is trimmed, title-cased, and cleaned of extra spaces to maintain a "Premium" feel across the UI.

### Lead Capture:
The "Partner with Us" form uses a hardened API endpoint that validates every field and stores inquiries safely, triggering an immediate update on the Admin Dashboard.

---

## ✨ 5. Design & Tech Standards
- **Design System**: Built on a modern "Zinc-900" (Black & White) aesthetic. It uses high-contrast typography and subtle glassmorphism to feel "Premium" and "High-Trust."
- **Next.js 15+ & React 19**: Utilizing the latest React features like Server Components for speed and Client Components for interactivity.
- **Indian Market Localization**: Currencies are formatted using the Indian numbering system (`₹3,0,000` instead of `300,000`).

---

## 🚀 6. Latest Updates & Enhancements
### 🏨 Room Management System
- **Granular Inventory Control**: Admins can now manage specific room types for each property.
- **Smart Validation**: 
  - Prevents zero or negative pricing.
  - **Duplicate Check**: Ensures no two rooms in the same property share a name.
  - **Whitespace Normalization**: Automatically cleans up messy room names (e.g., `" Deluxe   Suite "` -> `"Deluxe Suite"`).

### 🖼️ Image Management & Optimization
- **High-Performance Media Pipeline**:
  - **Sharp Integration**: Every image is now processed locally using the industry-standard `sharp` library.
  - **Auto-Conversion**: All uploads are converted to **WebP** (80% quality) for maximum speed.
  - **Cinematic Resizing**: Images are automatically cropped and resized to **1920x1080 (1080p)** to ensure a uniform, premium look in galleries.
- **Media Security Guards**:
  - **Payload Limits**: Strictly enforces a **5MB maximum** file size to protect server resources.
  - **MIME Validation**: Only authentic image files (JPEG, PNG, WebP) are accepted.
  - **Inventory Cap**: Limits each property to **10 high-quality images** to maintain site performance.
  - **Fetch Resilience**: Robust error handling for broken or private image URLs.

### 💎 Data Quality & UX Polish
- **Advanced "Smart Title Case"**: 
  - Intelligently handles small words (*and, of, the, in*).
  - **Acronym Support**: Preserves official terms like `HP`, `UK`, `USA`.
  - **Hyphenation Logic**: Correctly capitalizes terms like `Eco-Friendly`.
  - **Unit Intelligence**: Recognizes and capitalizes housing units like `3BHK` or `2BHK`.
- **Admin Workflow Improvements**:
  - Integrated navigation links for "Rooms" and "Images" directly onto property cards.
  - Live gallery previews in the admin panel for instant feedback.

### 🔒 Final Hardening & Production Readiness
- **Room Data Integrity**:
  - **Normalized room names**: Automatically cleans up whitespace and formatting (trim + remove extra spaces).
  - **Case-insensitive duplicate prevention**: Ensures unique room names within a single property profile.
  - **Strict positive pricing validation**: Prevents broken or zero-cost listings.
- **Image Pipeline Hardening**:
  - **5MB file size limit**: Protects server memory and storage from payload overload.
  - **MIME type validation**: Strictly enforces `image/*` formats to prevent malicious or incompatible file uploads.
  - **Safe fetch handling**: Robust resilience against broken, private, or invalid image URLs.
  - **Max 10 images per property**: A critical performance guard to keep property sites lean and fast.
- **Media Reliability**:
  - **Self-hosted image system**: No longer relies on external URLs; all assets are optimized and hosted locally.
  - **Atomic write pattern**: Every database update uses a secure write-to-temp-then-rename cycle to prevent data loss.
  - **Graceful failure handling**: Integrated error wrapping for both network fetch and `sharp` processing stages.
- **System Stability Upgrade**:
  - All critical APIs are now professionally guarded against invalid input, duplicate entries, and corrupted payloads.
  - Ensures production-safe behavior even under high administrative usage.

---

### 🚀 Enterprise Production Transformation (2026-04-30)

#### 🛡️ Distributed Reliability Guards
- **Leak-Free Performance**: Refactored `withTimeout` to ensure all timers are cleared, preventing memory leaks in high-concurrency environments.
- **Smart Retries**: Implemented **Exponential Backoff with Jitter** in `withRetry` to prevent "thundering herd" issues during service recovery.
- **Capped Delays**: Strictly enforced a 2-second backoff cap to prevent request starvation and maintain system responsiveness.
- **Standardized Traceability**: Integrated `AppError` with `requestId` propagation across all reliability utilities.

#### 🔐 Atomic Idempotency Layer (Race-Condition Proof)
- **Ownership-Safe Locking**: Implemented distributed Redis locks (`SETNX`) with unique request-based UUIDs to prevent accidental cross-request unlocking.
- **Atomic Release**: Developed **Lua scripts** for Redis lock releasing, ensuring "Check-and-Delete" operations are 100% atomic.
- **Smart Retry UX**: Added a 3-pass retry loop (100ms intervals) for concurrent requests, allowing "In-Progress" requests to wait for results instead of failing.
- **Safe JSON Integrity**: Implemented resilient JSON parsing with **auto-purge corruption recovery** to handle malformed cache data without crashing.
- **Safe Redis Wrapper**: Created a `safeRedis` handler with strict failure policies (Fail-Fast for critical writes, Graceful Degradation for caching).

#### 📊 Advanced Observability & Monitoring
- **Structured JSON Logging**: Implemented an enterprise logger with cost-control sampling and request-timing metrics.
- **Distributed Request Tracing**: Enforced global `x-request-id` propagation through middleware and all backend services.
- **Real-time Health Monitoring**: Created `/api/health` and `/api/ready` endpoints with live Redis and PostgreSQL connectivity checks.
- **Global Error Boundary**: Replaced all `any` and generic `Function` types in `withErrorHandler` with strict, type-safe guards and standardized response formats.

#### 🧱 Database & Transaction Safety
- **Atomic Transactions**: Integrated `withTransaction` for all critical booking and inventory workflows.
- **Row-Level Locking**: Implemented `FOR UPDATE` queries to prevent double-booking and race conditions during high-concurrency operations.
- **Source of Truth Philosophy**: Reinforced that the database is the final authority, treating the Redis cache as purely advisory.

---

### 🚦 Future Hardening (Audit Backlog)
- **JWT Revocation**: Implementation of a Redis-based blacklist for immediate token invalidation.
- **Transaction Timeouts**: Adding internal timeouts to `withTransaction` to prevent deadlock hangs.
- **Circuit Breakers**: Enhancing `safeRedis` to support "Safe Degraded Mode" for read-only operations during infra instability.

---

### 🚀 Developer Onboarding Checklist
1.  **Run the project**: `npm run dev` in the root.
2.  **Infrastructure Check**: Visit `/api/ready` to ensure your local Redis and DB are connected.
3.  **Add a property**: Go to `/admin/properties` (login with `admin` / `123456`) and add a test property.
4.  **Manage Assets**: Click on **"Rooms"** or **"Images"** on the property card to build your inventory.
5.  **View the result**: Check `/explore` on the main site or visit `localhost:3001/[your-slug]` to see your optimized gallery and rooms live.

---

### 🔐 Multi-Portal Auth & Database Refactor (2026-04-30)

#### 🏛️ Multi-Portal Architecture
- **Route Group Strategy**: Implemented `(marketing)` and `(portal)` route groups to cleanly separate public pages from administrative dashboards.
- **Optimized Folder Structure**: Refactored the authentication routes into a flat, intuitive hierarchy under `/(portal)/(auth)/` while strictly maintaining clean URL paths (`/auth/login`, `/partner/login`, `/admin/login`).
- **Focused Auth Layout**: Created a centralized, centered-card layout in `/(portal)/(auth)/layout.tsx` for a distraction-free login experience across all portals.

#### 🗄️ PostgreSQL Database Layer
- **Robust User Schema**: Implemented a scalable `users` table with UUID primary keys, unique email constraints, and role-based validation.
- **Multi-Role Support**: Native support for `customer`, `owner`, `manager`, `admin`, and `super_admin` roles.
- **Connection Management**: Configured a high-performance PostgreSQL pool in `src/lib/db.ts` with environment-aware SSL settings.
- **Type-Safe User Model**: Developed helper functions (`createUser`, `findUserByEmail`, `findUserById`) with integrated password hashing.

#### 🛡️ Secure Authentication System
- **Next.js Edge Middleware**: Implemented a secure, role-based middleware in `src/middleware.ts` compatible with Next.js Edge Runtime.
- **Jose JWT Integration**: Transitioned to the `jose` library for JWT signing and verification to ensure 100% compatibility with Edge middleware.
- **HTTP-Only Cookies**: Secured sessions using HTTP-only, secure, and SameSite=Strict cookies to protect against XSS and CSRF.
- **Role-Based Access Control (RBAC)**: Strictly enforced portal-specific access (e.g., only owners/managers can access `/partner/*`).

#### 🌐 Frontend Auth Integration
- **AuthContext & Hook**: Created a global `AuthContext` to manage user sessions, loading states, and unified login/logout logic.
- **Session Hydration**: Integrated automatic session restoration on app load using the secure `/api/auth/me` endpoint.
- **Dynamic UI Logic**: Updated the `Navbar` to dynamically reflect authentication status, showing user names and logout options.
- **UX Polish**: Optimized the initial auth check with mounting protections to prevent "cascading render" warnings and redundant API calls.

### 🛡️ Security Infrastructure Refinement (2026-04-30)

#### 🔐 Advanced Lockout & Brute-Force Protection
- **Email + IP Binding**: Hardened the lockout strategy to use an `email:ip` composite key, preventing attackers from locking out legitimate users by spoofing their email from different locations.
- **Fail-Secure Lockout**: If the security infrastructure (Redis) is unavailable, the system defaults to a "Strict Block" for authentication attempts, ensuring no bypasses are possible during instability.
- **Auto-Reset Logic**: Integrated automatic lockout resets upon successful login to ensure a seamless experience for recovered accounts.

#### 📊 Enterprise Security Observability
- **Structured Audit Events**: Integrated the unified `logger` across all security-critical paths (Lockout, Rate Limiting, RBAC).
- **Security Event Triggers**:
  - `AUTH_LOCKOUT_TRIGGERED` / `AUTH_LOCKOUT_CHECK`
  - `AUTH_LOGIN_FAILURE` (with reason) / `AUTH_LOGIN_SUCCESS`
  - `RATE_LIMIT_EXCEEDED`
  - `REDIS_CONNECTION_FAILURE` (with failure mode context)
- **Forensic Context**: Every security log now captures `requestId`, `ip`, `userId`, and `method` for rapid incident response and auditing.

#### ⚡ Intelligent Redis Resilience (Selective Strictness)
- **Critical Strictness**: Enforced **Strict Mode** for all `/api/auth/*` routes—blocking access if Redis is down to guarantee authentication integrity.
- **Graceful Fail-Open**: Implemented a "Fail-Open" fallback for non-critical content routes (e.g., property listings). If Redis fails, the system allows the request to pass with a warning, maintaining site availability while protecting the auth perimeter.
- **Smart Adaptive Rate Limiting**: The rate limiter now detects the criticality of the route and adjusts its failure strategy dynamically.

#### 🔑 Hardened Token & RBAC Enforcement
- **Server-Side Role Gating**: Standardized authorization using the `requireRole` helper, ensuring all `/api/admin/*` and `/api/partner/*` routes enforce strict server-side checks independent of frontend state.
- **Comprehensive Session Audit**: Verified JWT expiry (15m access / 7d refresh) and audience/issuer validation across all protected backend services.


