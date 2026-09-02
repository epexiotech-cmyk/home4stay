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

### 🧑‍💼 Partner Onboarding Wizard & Portal Infrastructure (2026-05)
- **Multi-Step Onboarding**: Built a full 9-step guided onboarding wizard for new property partners covering Welcome, Property Details, Rooms, Gallery, Amenities, Experiences, Policies, Theme, and Pricing/Launch.
- **Partner Registration**: Created partner account registration with OTP-style flow and profile setup.
- **OnboardingContext**: Shared React context stores wizard state across steps with persistence and progress tracking.
- **SetupProgress Tracking**: Server-side `PropertySetupProgress` model tracks each completed onboarding step in the database.
- **Partner Dashboard**: Launched full Partner portal with pages for Bookings, Calendar, Financials, Properties, Promotions, Reviews, Rooms, Experiences, and Operational Panel.
- **Subscription Plans**: Designed tiered subscription model (Basic, Pro, Enterprise) with plan feature gates and pricing.

### 🔔 Notification & Email Infrastructure (2026-05)
- **Email Queue System**: Built an async transactional email queue (`EmailQueueWorker`) using database-backed job polling with retry logic.
- **Email Templates**: Created HTML email templates for welcome messages, payment confirmations, invoice delivery, and subscription renewals.
- **Real-Time Notifications**: Added WebSocket-based notification endpoints via `/api/realtime` and in-portal notification bell component.

### 📋 Legal Agreements & Compliance Infrastructure — Phase 10A (2026-05)
- **Legal Document Models**: Created `LegalDocument` and `LegalAcceptanceLog` Prisma models with version control and immutable consent logging.
- **Legal Document Types**: Implemented `TERMS_AND_CONDITIONS`, `PRIVACY_POLICY`, `REFUND_POLICY`, and `SUBSCRIPTION_AGREEMENT` enum support.
- **XSS Sanitization Guard**: Built `sanitizeHtml()` utility that strips dangerous tags/event handlers while allowing safe formatting markup.
- **LegalService**: Transactional draft/publish lifecycle, version history retrieval, and forced re-acceptance detection.
- **Legal Admin Control Center**: Premium glassmorphic admin dashboard at `/super-admin/legal-documents` with live HTML preview editor, version history ledger, and CSV-exportable consent audit logs.
- **Legal Wall Component**: Intercepts partner logins if unsigned legal documents are detected, forcing acceptance before portal access.
- **Public Legal Pages**: Auto-generated pages for `/terms`, `/privacy`, `/refund-policy`, and `/subscription-agreement`.

### ⚙️ Legal Clauses, SLA & Tax Compliance Enhancement — Phase 10A.5 (2026-05)
- **FinancialSettings Expansion**: Extended schema with `defaultSACCode`, `defaultGSTPercent`, `defaultStateCode`, `placeOfSupplyMode`, `enableGSTSplitting`, `enableIGST`, `invoiceTerms`, `refundTerms`, `SLAUptimeTarget`, `SLAMaintenanceWindow`, `liabilityCapMonths`, `dataRetentionDays`.
- **GST Jurisdiction Engine**: Upgraded `gstEngine.ts` to auto-resolve intrastate (CGST+SGST) vs. interstate (IGST) based on customer state code or GSTIN prefix.
- **Gujarat Registration**: Configured supplier state as Gujarat (State Code `24`) — intrastate = split 9%+9%, interstate = full 18% IGST.
- **GSTIN Field in Super Admin**: Added GSTIN text input with live validation to the Financial Settings admin panel.
- **B2B Billing Capture**: Partner onboarding pricing step now captures Legal Business Name, GSTIN, billing state, pincode, and contact — saved to User profile on launch.
- **Compliance Test Suite**: Expanded automated test script passing **40/40 assertions** covering place-of-supply resolution, B2B onboarding, and dynamic invoice tax splits.

### 🧾 GST Invoice Engine & Financial Document System — Phase 10B (2026-05)
- **Invoice & FinancialSettings Models**: Created Prisma `Invoice` model with sequential invoice numbering, and `FinancialSettings` for company billing info.
- **InvoiceType & InvoiceStatus Enums**: `SUBSCRIPTION`, `RENEWAL`, `MANUAL_ADJUSTMENT`, `REFUND` and `DRAFT`, `ISSUED`, `PAID`, `CANCELLED`, `REFUNDED`.
- **Decimal-Safe GST Calculator**: `gstEngine.ts` computes taxes backwards from gross amounts with `Number(val.toFixed(2))` rounding to prevent JS float drift.
- **Collision-Safe Invoice Numbering**: `financialNumberingService.ts` runs inside a `LOCK TABLE` transaction to guarantee sequential serial numbers (e.g. `H4S-2026-000001`).
- **A4 PDF Invoice Generator**: `subscriptionPdfGenerator.ts` using `pdfkit` produces print-quality tax invoices with company logo, HSN/SAC codes, GST breakdowns, bank details, and digital signature placeholders.
- **Auto-Issuance on Payment Approval**: Approving a manual UPI payment instantly generates and links a GST-compliant invoice in one atomic transaction.
- **Partner Billing History Ledger**: `/partner/dashboard/billing` — searchable invoice history with pagination and PDF download links.
- **Invoice Download API**: Secure ownership-checked endpoint at `/api/payments/invoices/[id]/download`.
- **Accounting Export API**: `/api/admin/financial-settings/export` generates Zoho Books and Tally ERP formatted CSV exports.

### 📊 Accounting Exports, Finance Reconciliation & Admin Finance Suite — Phase 10C (2026-05)
- **SettlementRecord & ReconciliationLog Models**: New Prisma models for gateway payout tracking and immutable reconciliation audit logs.
- **ReconciliationStatus Enum**: `MATCHED`, `MISMATCH`, `PENDING`, `FAILED`.
- **Settlement Tracker**: `financeService.ts` — idempotently records gateway batches, updates existing records on duplicate reference.
- **Reconciliation Engine**: Auto-matches payment amounts to settlements; flags underpayments, overpayments, and duplicate UTR replay risks.
- **Zoho Books CSV Exporter**: Generates schema-compliant double-quoted CSV with HSN/SAC codes and GST columns for Zoho Books import.
- **Tally ERP CSV Exporter**: Generates double-entry credit/debit voucher CSV with SaaS Income ledger mapping.
- **Finance Dashboard API**: `/api/admin/finance/dashboard` aggregates gross revenue, tax liabilities (CGST/SGST/IGST), mismatch counts, and reconciliation histories.
- **Reconcile API**: `/api/admin/finance/reconcile` — logs manual gateway payouts and triggers reconciliation engine.
- **Export API**: `/api/admin/finance/export` — date-filtered downloads for General, Zoho, Tally, Payments, and Reconciliation CSV types.
- **Super Admin Finance Panel**: Glassmorphic dashboard at `/super-admin/finance` with metric cards, settlement audit feed, reconciliation modal, and export hub.
- **Phase 10C Test Suite**: **26/26 assertions** passing — covering settlement idempotency, exact matching, underpayment flagging, duplicate UTR detection, and all CSV format validators.

### 🎁 Referral Credits, Rewards & Renewal Discount Engine — Phase 11 (2026-05)
- **Referral Database Models**: Created `ReferralProfile`, `ReferralEvent`, `ReferralCreditLedger`, and `ReferralRewardRedemption` Prisma models with full relation cascades.
- **ReferralService**: Core business logic at `src/lib/referral/referralService.ts` — handles referral binding, fraud detection, credit awarding, discount calculation, and transactional redemptions.
- **Fraud Prevention Engine**: Detects self-referral abuse by matching phone numbers, GSTINs, and suspicious signup patterns. Flags events for admin review instead of silently blocking.
- **Tiered Discount System**: Credit thresholds mapped to renewal discounts — 4 credits = 50% off half-yearly, 6 credits = 50% off yearly, 10 credits = 100% off either plan. Discounts apply **before** GST calculation.
- **Credit Awarding on Subscription Activation**: Referral events are automatically converted from PENDING to AWARDED when the referred partner activates a paid subscription.
- **Credit Ledger**: Immutable `ReferralCreditLedger` records every credit earn/spend with timestamps and notes for full audit traceability.
- **Carry-Forward Credits**: Unused credits after redemption roll over to the referrer's balance for future use.
- **Partner Referral Dashboard**: Premium glassmorphic portal at `/partner/dashboard/referrals` with gamified progress circle, one-click referral code copy, credit balance breakdown, and live referral log.
- **Super Admin Referrals Panel**: Admin control at `/super-admin/referrals` — platform-wide credit velocity matrix, fraud flag review queue, and manual override capability with full audit trail.
- **Admin Sidebar Navigation**: Added "Referrals & Rewards" link to `PartnerLayout.tsx` and "Referrals" link to `AdminLayout.tsx`.
- **GST-Aware Invoice Integration**: `InvoiceService` generates invoices with the discounted amount as base, back-calculates subtotal and GST correctly, and records `referralDiscount`, `referralCreditsUsed`, and `originalSubtotal` in invoice metadata.
- **E2E Integration Test Suite**: `scripts/test-referral-rewards.mjs` — **54/54 assertions** passing across 7 test groups covering: referral code generation, fraud detection, admin overrides, subscription credit awarding, tiered discount calculations, transactional redemptions, and GST-compliant invoice integration.

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
