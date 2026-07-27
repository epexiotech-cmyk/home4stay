# Home4Stay End-to-End Integration Audit

## 1. Executive Summary
This document presents the FINAL technical integration audit for Home4Stay. It strictly verifies the complete request lifecycle (Frontend UI → API → Validation → Service → Repository → Prisma Database → Response) for every feature, highlighting broken chains and missing implementations using direct AST and string analysis.

## 2. Feature Matrix & E2E Flows

### Auth
- **Login**: Frontend (apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx) -> API (apps/main-site/src/app/api/auth/login/route.ts) -> Validation (Exists) -> Service (Exists) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists)
- **Register**: Frontend (apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx) -> API (apps/main-site/src/app/api/auth/partner/register/route.ts) -> Validation (Exists) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Forgot Password**: Frontend (apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx) -> API (apps/main-site/src/app/api/auth/forgot-password/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Reset Password**: Frontend (apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx) -> API (apps/main-site/src/app/api/auth/reset-password/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Partner Login**: NOT FOUND (Frontend Missing)
- **Admin Login**: NOT FOUND (Frontend Missing)
- **Profile**: Frontend (apps/main-site/src/app/(marketing)/profile/change-password/page.tsx) -> API (apps/main-site/src/app/api/auth/profile/image/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Change Password**: Frontend (apps/main-site/src/app/(marketing)/profile/change-password/page.tsx) -> API (apps/main-site/src/app/api/auth/change-password/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **JWT**: Frontend (apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx) -> API (apps/main-site/src/app/api/admin/sessions/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Session**: Frontend (apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx) -> API (apps/main-site/src/app/api/admin/sessions/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Role Guards**: NOT FOUND (Frontend Missing)

### Property
- **Property CRUD**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/property/page.tsx) -> API (apps/main-site/src/app/api/admin/payments/properties/[propertyId]/toggle-status/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Gallery**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/gallery/page.tsx) -> BROKEN (API Missing)
- **Rooms**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx) -> API (apps/main-site/src/app/api/partner/rooms/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Amenities**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/amenities/page.tsx) -> BROKEN (API Missing)
- **Pricing**: Frontend (apps/main-site/src/app/(marketing)/partner/pricing/page.tsx) -> BROKEN (API Missing)
- **Policies**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/policies/page.tsx) -> BROKEN (API Missing)
- **Themes**: NOT FOUND (Frontend Missing)
- **CMS**: Frontend (apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx) -> API (apps/main-site/src/app/api/property/cms/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **SEO**: NOT FOUND (Frontend Missing)
- **Media**: Frontend (apps/main-site/src/app/api/media/upload/route.ts) -> API (apps/main-site/src/app/api/media/upload/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)

### Booking
- **Property Page**: Frontend (apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx) -> BROKEN (API Missing)
- **Availability**: NOT FOUND (Frontend Missing)
- **Booking**: Frontend (apps/main-site/src/app/(portal)/partner/bookings/page.tsx) -> API (apps/main-site/src/app/api/bookings/route.ts) -> Validation (Missing) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Guest Details**: NOT FOUND (Frontend Missing)
- **Checkout**: Frontend (apps/main-site/src/app/booking/checkout/page.tsx) -> BROKEN (API Missing)
- **Coupon**: Frontend (apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts) -> API (apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Payment**: Frontend (apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx) -> API (apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Booking Confirmation**: NOT FOUND (Frontend Missing)
- **Documents**: Frontend (apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx) -> API (apps/main-site/src/app/api/admin/legal-documents/audit/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)

### PartnerDashboard
- **Dashboard**: Frontend (apps/main-site/src/app/(portal)/admin/dashboard/page.tsx) -> API (apps/main-site/src/app/api/admin/finance/dashboard/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Bookings**: Frontend (apps/main-site/src/app/(portal)/partner/bookings/page.tsx) -> API (apps/main-site/src/app/api/bookings/route.ts) -> Validation (Missing) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Calendar**: Frontend (apps/main-site/src/app/(portal)/partner/calendar/page.tsx) -> API (apps/main-site/src/app/api/partner/calendar/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Guests**: Frontend (apps/main-site/src/app/(portal)/partner/guests/page.tsx) -> BROKEN (API Missing)
- **Rooms**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx) -> API (apps/main-site/src/app/api/partner/rooms/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Promotions**: Frontend (apps/main-site/src/app/(portal)/partner/promotions/page.tsx) -> API (apps/main-site/src/app/api/property/promotions/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Experiences**: Frontend (apps/main-site/src/app/(portal)/partner/experiences/page.tsx) -> API (apps/main-site/src/app/api/property/experiences/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Financials**: Frontend (apps/main-site/src/app/(portal)/partner/financials/page.tsx) -> API (apps/main-site/src/app/api/partner/financials/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Reviews**: Frontend (apps/main-site/src/app/(portal)/partner/reviews/page.tsx) -> API (apps/main-site/src/app/api/property/reviews/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Notifications**: Frontend (apps/main-site/src/app/(portal)/partner/notifications/page.tsx) -> API (apps/main-site/src/app/api/notifications/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Staff**: Frontend (apps/main-site/src/app/(portal)/partner/staff/page.tsx) -> BROKEN (API Missing)

### SuperAdmin
- **Payments**: Frontend (apps/main-site/src/app/(portal)/super-admin/payments/page.tsx) -> API (apps/main-site/src/app/api/admin/payments/audit-logs/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Finance**: Frontend (apps/main-site/src/app/(portal)/super-admin/finance/page.tsx) -> API (apps/main-site/src/app/api/admin/finance/dashboard/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Automation**: Frontend (apps/main-site/src/app/(portal)/super-admin/automation/page.tsx) -> BROKEN (API Missing)
- **Legal Documents**: Frontend (apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx) -> API (apps/main-site/src/app/api/admin/legal-documents/audit/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Subscription Plans**: Frontend (apps/main-site/src/app/(portal)/super-admin/subscription-plans/page.tsx) -> API (apps/main-site/src/app/api/admin/subscription-plans/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Payment Settings**: Frontend (apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx) -> API (apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Financial Settings**: Frontend (apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx) -> API (apps/main-site/src/app/api/admin/financial-settings/export/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Referrals**: Frontend (apps/main-site/src/app/(portal)/partner/dashboard/referrals/page.tsx) -> API (apps/main-site/src/app/api/admin/referrals/route.ts) -> Validation (Missing) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)

### Marketing
- **Landing**: NOT FOUND (Frontend Missing)
- **Explore**: Frontend (apps/main-site/src/app/(marketing)/explore/page.tsx) -> BROKEN (API Missing)
- **Partner**: Frontend (apps/main-site/src/app/(marketing)/partner/contact/page.tsx) -> API (apps/main-site/src/app/api/auth/partner/register/route.ts) -> Validation (Exists) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Pricing**: Frontend (apps/main-site/src/app/(marketing)/partner/pricing/page.tsx) -> BROKEN (API Missing)
- **Contact**: Frontend (apps/main-site/src/app/(marketing)/partner/contact/page.tsx) -> API (apps/main-site/src/app/api/contact/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)
- **Legal Pages**: Frontend (apps/main-site/src/app/(marketing)/privacy/page.tsx) -> API (apps/main-site/src/app/api/admin/legal-documents/audit/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)

### PropertySite
- **Landing**: NOT FOUND (Frontend Missing)
- **Rooms**: Frontend (apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx) -> API (apps/main-site/src/app/api/partner/rooms/route.ts) -> Validation (Missing) -> Service (Missing) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **Booking**: Frontend (apps/main-site/src/app/(portal)/partner/bookings/page.tsx) -> API (apps/main-site/src/app/api/bookings/route.ts) -> Validation (Missing) -> Service (Exists) -> Repository (Missing) -> Prisma (Exists) -> Response (Exists)
- **About**: Frontend (apps/property-site/src/app/[slug]/about/page.tsx) -> BROKEN (API Missing)
- **Contact**: Frontend (apps/main-site/src/app/(marketing)/partner/contact/page.tsx) -> API (apps/main-site/src/app/api/contact/route.ts) -> Validation (Exists) -> Service (Missing) -> Repository (Missing) -> Prisma (Missing) -> Response (Exists) (BROKEN CHAIN)

## 8. API Verification

### apps/main-site/src/app/api/admin/audit-logs/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/finance/dashboard/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/finance/export/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/finance/reconcile/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/financial-settings/export/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/financial-settings/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/legal-documents/audit/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/legal-documents/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payment-settings/providers/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payment-settings/providers/upload-qr/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payment-settings/providers/[id]/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/audit-logs/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/dashboard/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/pending/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/proofs/[filename]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/properties/[propertyId]/toggle-status/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/[id]/cancel/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/[id]/change-plan/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/[id]/extend/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/[id]/reactivate/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/subscriptions/[id]/suspend/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/[id]/approve/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/payments/[id]/reject/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/referrals/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/sessions/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/subscription-plans/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/subscription-plans/[id]/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/admin/suspicious-activity/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/change-password/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: Exists

### apps/main-site/src/app/api/auth/forgot-password/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/legal-accept/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/legal-status/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/login/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/logout/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/me/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/partner/register/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/profile/image/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/profile/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/register/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/auth/reset-password/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: Exists

### apps/main-site/src/app/api/bookings/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: Exists

### apps/main-site/src/app/api/bookings/[bookingId]/approve-payment/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/bookings/[bookingId]/invoice/download/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: Exists

### apps/main-site/src/app/api/bookings/[bookingId]/payment-status/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/bookings/[bookingId]/reject-payment/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/bookings/[bookingId]/submit-payment/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: Exists

### apps/main-site/src/app/api/contact/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/cron/cleanup/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/cron/cleanup-locks/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/cron/subscription-lifecycle/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/health/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/legal/active/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/login/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: NOT FOUND
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/logout/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: NOT FOUND
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/media/upload/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/media/[mediaId]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/notifications/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/ai/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/billing/dashboard/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/billing/proofs/[filename]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/billing/transactions/[id]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/calendar/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/dashboard/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/financials/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/media/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/onboarding/launch/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/onboarding/session/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/referrals/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/partner/rooms/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/invoices/[id]/download/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/manual-upi/submit/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/my-transactions/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/webhooks/phonepe/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/webhooks/yesbank/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/payments/[id]/status/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/properties/public/[id]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/properties/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/properties/[id]/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/cms/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/experiences/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/experiences/[id]/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/image/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/promotions/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/reviews/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/room/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/cms/publish/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/cms/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/cms/section/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/cms/section/[sectionId]/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/media/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/payment-settings/route.ts
- **Route**: Exists
- **Validation**: Exists
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/property/[propertyId]/public-payment-config/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/readiness/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/ready/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/realtime/events/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: NOT FOUND
- **Repository**: NOT FOUND
- **Prisma**: Exists
- **Response**: NOT FOUND
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

### apps/main-site/src/app/api/refresh/route.ts
- **Route**: Exists
- **Validation**: NOT FOUND
- **Service**: Exists
- **Repository**: NOT FOUND
- **Prisma**: NOT FOUND
- **Response**: Exists
- **Error Handling**: Exists
- **Authentication**: NOT FOUND

## 9. Broken Chains

- Frontend -> API (apps/main-site/src/app/api/auth/forgot-password/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/auth/reset-password/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/auth/profile/image/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/auth/change-password/route.ts) -> Service/Repo/Prisma Missing
- Frontend (apps/main-site/src/app/(portal)/partner/onboarding/gallery/page.tsx) -> API Missing for Gallery
- Frontend (apps/main-site/src/app/(portal)/partner/onboarding/amenities/page.tsx) -> API Missing for Amenities
- Frontend (apps/main-site/src/app/(marketing)/partner/pricing/page.tsx) -> API Missing for Pricing
- Frontend (apps/main-site/src/app/(portal)/partner/onboarding/policies/page.tsx) -> API Missing for Policies
- Frontend -> API (apps/main-site/src/app/api/property/cms/route.ts) -> Service/Repo/Prisma Missing
- Frontend (apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx) -> API Missing for Property Page
- Frontend (apps/main-site/src/app/booking/checkout/page.tsx) -> API Missing for Checkout
- Frontend -> API (apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts) -> Service/Repo/Prisma Missing
- Frontend (apps/main-site/src/app/(portal)/partner/guests/page.tsx) -> API Missing for Guests
- Frontend -> API (apps/main-site/src/app/api/property/promotions/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/property/experiences/route.ts) -> Service/Repo/Prisma Missing
- Frontend -> API (apps/main-site/src/app/api/property/reviews/route.ts) -> Service/Repo/Prisma Missing
- Frontend (apps/main-site/src/app/(portal)/partner/staff/page.tsx) -> API Missing for Staff
- Frontend (apps/main-site/src/app/(portal)/super-admin/automation/page.tsx) -> API Missing for Automation
- Frontend (apps/main-site/src/app/(marketing)/explore/page.tsx) -> API Missing for Explore
- Frontend -> API (apps/main-site/src/app/api/contact/route.ts) -> Service/Repo/Prisma Missing
- Frontend (apps/property-site/src/app/[slug]/about/page.tsx) -> API Missing for About

## 10. Production Blockers

- **Critical**:  Broken backend logic in apps/main-site/src/app/api/auth/forgot-password/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/auth/reset-password/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/auth/profile/image/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/auth/change-password/route.ts
- **High**:  Missing API for Gallery
- **High**:  Missing API for Amenities
- **High**:  Missing API for Pricing
- **High**:  Missing API for Policies
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/property/cms/route.ts
- **High**:  Missing API for Property Page
- **High**:  Missing API for Checkout
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts
- **High**:  Missing API for Guests
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/property/promotions/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/property/experiences/route.ts
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/property/reviews/route.ts
- **High**:  Missing API for Staff
- **High**:  Missing API for Automation
- **High**:  Missing API for Explore
- **Critical**:  Broken backend logic in apps/main-site/src/app/api/contact/route.ts
- **High**:  Missing API for About

## 11. Recommended Development Order

1. **Core Data Access (Repositories)**: Implement missing Prisma connections for Dashboard, Bookings, and CMS endpoints to eliminate Critical blockers.
2. **Service Layer Isolation**: Move raw Prisma logic in existing endpoints (like auth) to dedicated services to ensure reusability for the Super Admin panel.
3. **API Implementation**: Build missing APIs for Payments, Checkout, and Settings to connect existing frontend placeholders.
4. **Validation Hardening**: Add Zod validation to endpoints currently marked as `Validation: NOT FOUND` to prevent runtime crashes.
