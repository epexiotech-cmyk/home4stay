# Home4Stay Project Documentation - Progress Report

This document provides a comprehensive breakdown of the Home4Stay monorepo architecture, features, and technical standards. It is designed to help new developers understand the "What", "How", and "Why" behind our implementation.

---

## 🚀 Progress Updates

### 🔐 Initial Core Hardening (2026-04-29)
- **Authentication System**: Implemented JWT-based dual-token system (Access + Refresh) with role-based access control and secure HttpOnly cookies.
- **Security Hardening**: Added API-level `jwtVerify`, CSRF protection, rate limiting, and strict Zod validation.
- **Proxy Optimization**: Migrated to dedicated proxy architecture with lightweight JWT validation and role-based route guards.
- **Audit Logging System**: Async non-blocking architecture using `fs.promises` with a sequential write queue and multi-pivot rotation.
- **Dev Infrastructure**: PID-based process management and automated "Hardened QA" crawler integration.
- **Stability Fixes**: Resolved file-watch infinite loops and ensured strict isolation of server-side logic from client-side bundles.

### 🏗️ Enterprise Production Transformation (2026-04-30)
- **Reliability Guards**: Refactored `withTimeout` to prevent memory leaks and implemented **Exponential Backoff with Jitter** for smart retries.
- **Atomic Idempotency Layer**: Implemented distributed Redis locks (`SETNX`) with atomic Lua script releases for race-condition protection.
- **Observability**: Standardized global `x-request-id` propagation and created real-time `/api/health` monitoring endpoints.
- **Database Safety**: Integrated `withTransaction` and Row-Level Locking (`FOR UPDATE`) for critical booking workflows.

### 🔐 Multi-Portal Auth & Database Refactor (2026-04-30)
- **Architecture**: Implemented `(marketing)` and `(portal)` route groups to separate public pages from administrative dashboards.
- **PostgreSQL Layer**: Developed a scalable user schema with native support for `customer`, `owner`, `manager`, and `admin` roles.
- **Edge Compatibility**: Transitioned to `jose` library for JWT operations to ensure compatibility with Next.js Edge Runtime middleware.
- **AuthContext**: Created a unified global state for session hydration and dynamic UI rendering (Navbar/Logout).

### 🛡️ Security Infrastructure Refinement (2026-04-30)
- **Brute-Force Protection**: Hardened lockout strategy using `email:ip` composite keys and fail-secure Redis fallbacks.
- **Intelligent Resilience**: Implemented selective strictness (blocking auth if Redis is down while allowing content routes to fail-open).
- **Role Gating**: Standardized server-side authorization using the `requireRole` helper across all protected APIs.

### 🎨 Premium UI & Experience Evolution (2026-05-04)
- **Island Architecture**: Finalized the glassmorphism "Floating Island" aesthetic for Navbar and Footer.
- **Rolling Display**: Implemented root layout transparency gradients for a seamless content-behind-nav scrolling effect.
- **Editorial Design**: Transitioned to `aspect-[4/5]` portrait ratios for property cards with smooth scaling and lift animations.
- **Image Optimization**: Migrated all assets to Next.js `<Image />` with WebP/AVIF conversion and intelligent lazy loading.

### 🔍 Premium Search & Discovery Hub (2026-05-05)
- **Intelligent Search**: Developed a multi-mode date selector supporting Flexible Stays and ± Day flexibility.
- **Flow Automation**: Implemented "Magical Auto-Progression" (Where → When → Who) to reduce booking friction.
- **Zero-Jitter Animations**: GPU-accelerated transitions and dimension locking to prevent layout shifts during scroll states.

### 🏨 Multi-Tenant CMS & PMS Calendar (2026-05-15)
- **Visual CMS Registry**: Built a modular engine for partners to customize Hero, Gallery, and Narrative sections with live previewing.
- **PMS-Style Calendar**: Engineered a history-aware calendar that filters selectable months based on actual booking activity.
- **Cinematic Checkout**: Designed a multi-step checkout experience with concierge upsells (meal plans/experiences).
- **Prisma Proxy**: Hardened the database layer by replacing unsafe `require()` imports with a type-safe Prisma proxy.
- **Brand Harmonization**: Eliminated slate tones in favor of the signature luxury palette across all partner and guest portals.

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

## 🚀 Developer Onboarding Checklist
1.  **Run the project**: `npm run dev` in the root.
2.  **Infrastructure Check**: Visit `/api/ready` to ensure your local Redis and DB are connected.
3.  **Add a property**: Go to `/admin/properties` (login with `admin` / `123456`) and add a test property.
4.  **Manage Assets**: Click on **"Rooms"** or **"Images"** on the property card to build your inventory.
5.  **View the result**: Check `/explore` on the main site or visit `localhost:3001/[your-slug]` to see your optimized gallery and rooms live.
