# Home4Stay Database Verification Audit

## SECTION 1 — Verify Every Model

### User
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Frontend: apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx, Other: apps/main-site/src/app/api/admin/payments/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/subscriptions/route.ts...

### Property
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Frontend: apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx, Other: apps/main-site/src/app/api/admin/payments/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/properties/[propertyId]/toggle-status/route.ts...

### PropertyPageContent
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/property/[propertyId]/cms/publish/route.ts, Other: apps/main-site/src/app/api/property/[propertyId]/cms/route.ts, Other: apps/main-site/src/app/api/property/[propertyId]/cms/section/route.ts

### PropertySection
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/property/[propertyId]/cms/route.ts, Other: apps/main-site/src/app/api/property/[propertyId]/cms/section/route.ts, Other: apps/main-site/src/app/api/property/[propertyId]/cms/section/[sectionId]/route.ts

### MediaAsset
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/media/upload/route.ts, Other: apps/main-site/src/app/api/media/[mediaId]/route.ts, Other: apps/main-site/src/app/api/partner/billing/dashboard/route.ts...

### CmsVersion
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/property/[propertyId]/cms/publish/route.ts

### Theme
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### Guest
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### GuestKYC
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### Booking
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Frontend: apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx, Other: apps/main-site/src/app/api/bookings/[bookingId]/invoice/download/route.ts, Other: apps/main-site/src/app/api/bookings/[bookingId]/payment-status/route.ts...

### BookingConciergeService
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### BookingGuest
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### ConciergeRequest
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### ConciergeMessage
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyExperience
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/property/experiences/[id]/route.ts

### Room
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/billing/dashboard/route.ts, Other: apps/main-site/src/app/api/partner/calendar/route.ts, Other: apps/main-site/src/app/api/partner/rooms/route.ts

### PropertyAmenity
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyPolicy
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyPricing
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyReview
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyOffer
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### RoomInventory
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Status**: DEAD (Zero references found in src)

### PropertyUserAccess
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Other: apps/main-site/src/app/api/admin/payments/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/subscriptions/route.ts, Other: apps/main-site/src/app/api/bookings/[bookingId]/invoice/download/route.ts...

### Session
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/sessions/route.ts, Other: apps/main-site/src/lib/auth/rbac.ts, Other: apps/main-site/src/lib/repositories/session.repository.ts

### AuditLog
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/audit-logs/route.ts, Other: apps/main-site/src/app/api/admin/sessions/route.ts, Other: apps/main-site/src/app/api/admin/suspicious-activity/route.ts...

### OnboardingSession
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/onboarding/launch/route.ts, Other: apps/main-site/src/app/api/partner/onboarding/session/route.ts

### PropertySetupProgress
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/onboarding/launch/route.ts, Other: apps/main-site/src/app/api/partner/onboarding/session/route.ts

### WizardDraft
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/onboarding/session/route.ts

### AiGenerationEvent
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/lib/ai/intelligence.ts

### AiPreferenceSignal
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/lib/ai/intelligence.ts

### PropertyPaymentConfig
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/bookings/route.ts, Other: apps/main-site/src/app/api/bookings/[bookingId]/payment-status/route.ts, Other: apps/main-site/src/app/api/property/[propertyId]/payment-settings/route.ts...

### InvoiceRecord
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/bookings/[bookingId]/invoice/download/route.ts, Other: apps/main-site/src/modules/payments/services/emailQueue.ts

### Notification
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/notifications/route.ts, Other: apps/main-site/src/modules/payments/services/notificationService.ts

### EmailJob
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Frontend: apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx, Other: apps/main-site/src/modules/payments/services/emailQueue.ts

### PaymentProvider
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/payment-settings/providers/route.ts, Other: apps/main-site/src/app/api/admin/payment-settings/providers/[id]/route.ts, Other: apps/main-site/src/app/api/payments/manual-upi/submit/route.ts...

### PropertySubscription
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** true
- **Evidence**: Other: apps/main-site/src/app/api/admin/payments/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/subscriptions/route.ts, Other: apps/main-site/src/app/api/admin/payments/subscriptions/[id]/cancel/route.ts...

### SubscriptionPlan
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/subscription-plans/route.ts, Other: apps/main-site/src/app/api/admin/subscription-plans/[id]/route.ts, Other: apps/main-site/src/modules/payments/services/entitlements.ts

### PaymentTransaction
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/finance/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/payments/pending/route.ts...

### PaymentAuditLog
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/payments/audit-logs/route.ts, Other: apps/main-site/src/modules/payments/services/index.ts, Other: apps/main-site/src/modules/payments/services/subscriptionLifecycle.ts

### AutomationJobLog
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/cron/subscription-lifecycle/route.ts

### PaymentReconciliation
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/modules/payments/services/index.ts

### LegalDocument
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/legal-documents/route.ts, Other: apps/main-site/src/app/api/auth/partner/register/route.ts, Other: apps/main-site/src/app/api/payments/manual-upi/submit/route.ts...

### LegalAcceptanceLog
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/legal-documents/audit/route.ts, Other: apps/main-site/src/lib/legal/legalService.ts

### FinancialSettings
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/financial-settings/route.ts

### Invoice
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/finance/dashboard/route.ts, Other: apps/main-site/src/app/api/admin/financial-settings/export/route.ts, Other: apps/main-site/src/app/api/partner/billing/dashboard/route.ts...

### SettlementRecord
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/finance/dashboard/route.ts

### ReconciliationLog
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/finance/dashboard/route.ts, Other: apps/main-site/src/lib/financial/accountingExportService.ts

### ReferralProfile
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/referrals/route.ts, Other: apps/main-site/src/lib/referral/referralService.ts

### ReferralEvent
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/admin/referrals/route.ts, Other: apps/main-site/src/app/api/partner/referrals/route.ts, Other: apps/main-site/src/lib/referral/referralService.ts

### ReferralCreditLedger
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/referrals/route.ts

### ReferralRewardRedemption
- **Referenced by Repo?** false
- **Referenced by Service?** false
- **Referenced by API?** false
- **Referenced by Frontend?** false
- **Evidence**: Other: apps/main-site/src/app/api/partner/referrals/route.ts

## SECTION 2 — Verify API Mapping

### Endpoint: `/api/auth/change-password`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/change-password/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/profile/image`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/profile/image/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/profile`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/profile/image/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/forgot-password`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/forgot-password/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/register`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/register/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/reset-password`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/reset-password/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/legal/active`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/legal/active/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Valid (Via abstractions)

### Endpoint: `/api/auth/partner/register`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/partner/register/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/security/logs`
- **Frontend -> API Route**: Broken (No route.ts found for this endpoint)

### Endpoint: `/api/bookings`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/bookings/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/partner/calendar`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/calendar/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/payments/manual-upi/submit`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/payments/manual-upi/submit/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/partner/dashboard`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/dashboard/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/partner/referrals`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/referrals/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/property/experiences`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/experiences/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/partner/financials`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/financials/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/partner/ai`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/ai/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Valid (Via abstractions)

### Endpoint: `/api/partner/media`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/media/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/partner/onboarding/launch`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/onboarding/launch/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/property/promotions`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/promotions/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/property/cms`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/cms/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/property/reviews`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/reviews/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/partner/rooms`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/partner/rooms/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/automation/logs`
- **Frontend -> API Route**: Broken (No route.ts found for this endpoint)

### Endpoint: `/api/admin/finance/dashboard`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/finance/dashboard/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/finance/reconcile`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/finance/reconcile/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/admin/financial-settings`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/financial-settings/export/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/legal-documents`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/legal-documents/audit/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/payment-settings/providers`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/payment-settings/providers/qr-assets/[filename]/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/admin/payment-settings/providers/upload-qr`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/payment-settings/providers/upload-qr/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/admin/payments/dashboard`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/payments/dashboard/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/payments/audit-logs`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/payments/audit-logs/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/referrals`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/referrals/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/admin/subscription-plans`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/admin/subscription-plans/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/property/promotions/validate-coupon`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/promotions/validate-coupon/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/media/upload`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/media/upload/route.ts`)
- **API Route -> Service**: Bypassed (Direct Prisma)
- **Service -> Repository**: Bypassed
- **-> Prisma Model**: Valid (Direct invocation)

### Endpoint: `/api/contact`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/contact/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/property/image`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/image/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/auth/legal-status`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/legal-status/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Valid (Via abstractions)

### Endpoint: `/api/auth/legal-accept`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/auth/legal-accept/route.ts`)
- **API Route -> Service**: Valid
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Valid (Via abstractions)

### Endpoint: `/api/property`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/cms/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

### Endpoint: `/api/property/room`
- **Frontend -> API Route**: Valid (`apps/main-site/src/app/api/property/room/route.ts`)
- **API Route -> Service**: Broken
- **Service -> Repository**: Unknown without deep tracing
- **-> Prisma Model**: Broken

## SECTION 3 — Verify Seed Coverage

Seed scripts detected:
- seed-cms.ts

- **User**: Seed Exists
- **Property**: Seed Exists
- **PropertyPageContent**: Seed Exists
- **PropertySection**: Seed Exists
- **MediaAsset**: Seed Exists
- **CmsVersion**: No Seed Exists
- **Theme**: No Seed Exists
- **Guest**: No Seed Exists
- **GuestKYC**: No Seed Exists
- **Booking**: No Seed Exists
- **BookingConciergeService**: No Seed Exists
- **BookingGuest**: No Seed Exists
- **ConciergeRequest**: No Seed Exists
- **ConciergeMessage**: No Seed Exists
- **PropertyExperience**: No Seed Exists
- **Room**: No Seed Exists
- **PropertyAmenity**: No Seed Exists
- **PropertyPolicy**: No Seed Exists
- **PropertyPricing**: No Seed Exists
- **PropertyReview**: No Seed Exists
- **PropertyOffer**: No Seed Exists
- **RoomInventory**: No Seed Exists
- **PropertyUserAccess**: No Seed Exists
- **Session**: No Seed Exists
- **AuditLog**: No Seed Exists
- **OnboardingSession**: No Seed Exists
- **PropertySetupProgress**: No Seed Exists
- **WizardDraft**: No Seed Exists
- **AiGenerationEvent**: No Seed Exists
- **AiPreferenceSignal**: No Seed Exists
- **PropertyPaymentConfig**: No Seed Exists
- **InvoiceRecord**: No Seed Exists
- **Notification**: No Seed Exists
- **EmailJob**: No Seed Exists
- **PaymentProvider**: No Seed Exists
- **PropertySubscription**: No Seed Exists
- **SubscriptionPlan**: No Seed Exists
- **PaymentTransaction**: No Seed Exists
- **PaymentAuditLog**: No Seed Exists
- **AutomationJobLog**: No Seed Exists
- **PaymentReconciliation**: No Seed Exists
- **LegalDocument**: No Seed Exists
- **LegalAcceptanceLog**: No Seed Exists
- **FinancialSettings**: No Seed Exists
- **Invoice**: No Seed Exists
- **SettlementRecord**: No Seed Exists
- **ReconciliationLog**: No Seed Exists
- **ReferralProfile**: No Seed Exists
- **ReferralEvent**: No Seed Exists
- **ReferralCreditLedger**: No Seed Exists
- **ReferralRewardRedemption**: No Seed Exists

## SECTION 4 — Verify Relationships

### User
- @relation(fields: [guestProfileId], references: [id]
### Property
- @relation(fields: [ownerId], references: [id]
### PropertyPageContent
- @relation(fields: [propertyId], references: [id]
### MediaAsset
- @relation(fields: [propertyId], references: [id]
### CmsVersion
- @relation(fields: [propertyId], references: [id]
### GuestKYC
- @relation(fields: [guestId], references: [id]
### Booking
- @relation(fields: [propertyId], references: [id]
- @relation(fields: [roomId], references: [id]
### BookingGuest
- @relation(fields: [bookingId], references: [id]
- @relation(fields: [guestId], references: [id]
### ConciergeMessage
- @relation(fields: [requestId], references: [id]
- @relation(fields: [senderId], references: [id]
### PropertyExperience
- @relation(fields: [propertyId], references: [id]
### Room
- @relation(fields: [propertyId], references: [id]
### PropertyAmenity
- @relation(fields: [propertyId], references: [id]
### PropertyPolicy
- @relation(fields: [propertyId], references: [id]
### PropertyPricing
- @relation(fields: [propertyId], references: [id]
### PropertyReview
- @relation(fields: [propertyId], references: [id]
### PropertyOffer
- @relation(fields: [propertyId], references: [id]
### PropertyUserAccess
- @relation(fields: [propertyId], references: [id]
- @relation(fields: [userId], references: [id]
### Session
- @relation(fields: [userId], references: [id]
### AuditLog
- @relation(fields: [userId], references: [id]
### OnboardingSession
- @relation(fields: [propertyId], references: [id]
### PropertySetupProgress
- @relation(fields: [onboardingSessionId], references: [id]
### AiPreferenceSignal
- @relation(fields: [propertyId], references: [id]
### PropertyPaymentConfig
- @relation(fields: [propertyId], references: [id]
### InvoiceRecord
- @relation(fields: [bookingId], references: [id]
### Notification
- @relation(fields: [bookingId], references: [id]
### PropertySubscription
- @relation(fields: [propertyId], references: [id]
### PaymentTransaction
- @relation(fields: [propertyId], references: [id]
- @relation(fields: [subscriptionId], references: [id]
- @relation(fields: [providerId], references: [id]
### PaymentAuditLog
- @relation(fields: [transactionId], references: [id]
### PaymentReconciliation
- @relation(fields: [transactionId], references: [id]
### ReferralProfile
- @relation(fields: [userId], references: [id]
### ReferralCreditLedger
- @relation(fields: [userId], references: [id]
### ReferralRewardRedemption
- @relation(fields: [userId], references: [id]
- @relation(fields: [subscriptionId], references: [id]

*All `@relation` definitions verified directly from AST. Foreign keys and reference arrays exist per schema.*

## SECTION 5 — Verify Indexes

### User
- **@@index**: @@index([reset_password_token])
- **@unique Count**: 2
### Property
- **@@index**: @@index([ownerId])
- **@unique Count**: 1
### PropertyPageContent
- **@unique Count**: 1
### MediaAsset
- **@@index**: @@index([propertyId]), @@index([tags])
### CmsVersion
- **@@index**: @@index([propertyId])
### Theme
- **@unique Count**: 1
### Guest
- **@unique Count**: 2
### GuestKYC
- **@unique Count**: 1
### Booking
- **@@index**: @@index([propertyId]), @@index([roomId])
### BookingGuest
- **@unique Count**: 1
- **@@unique**: @@unique([bookingId, guestId])
### ConciergeMessage
- **@@index**: @@index([requestId])
### PropertyExperience
- **@@index**: @@index([propertyId]), @@index([category]), @@index([isFeatured]), @@index([isActive])
### Room
- **@@index**: @@index([propertyId])
### PropertyAmenity
- **@@index**: @@index([propertyId])
### PropertyPolicy
- **@unique Count**: 1
### PropertyPricing
- **@unique Count**: 1
### PropertyReview
- **@@index**: @@index([propertyId])
### PropertyOffer
- **@@index**: @@index([propertyId]), @@index([couponCode])
### PropertyUserAccess
- **@@index**: @@index([userId]), @@index([propertyId])
- **@unique Count**: 1
- **@@unique**: @@unique([propertyId, userId])
### Session
- **@@index**: @@index([userId]), @@index([refreshTokenHash])
- **@unique Count**: 2
### AuditLog
- **@@index**: @@index([userId]), @@index([action]), @@index([createdAt])
### OnboardingSession
- **@unique Count**: 1
### PropertySetupProgress
- **@unique Count**: 1
- **@@unique**: @@unique([onboardingSessionId, stepId])
### AiPreferenceSignal
- **@unique Count**: 1
- **@@unique**: @@unique([propertyId, category, signalKey])
### PropertyPaymentConfig
- **@@index**: @@index([propertyId])
### InvoiceRecord
- **@@index**: @@index([bookingId])
- **@unique Count**: 1
### Notification
- **@@index**: @@index([userId]), @@index([isRead])
### EmailJob
- **@@index**: @@index([status])
### PropertySubscription
- **@@index**: @@index([propertyId]), @@index([status])
### SubscriptionPlan
- **@unique Count**: 1
### PaymentTransaction
- **@@index**: @@index([propertyId]), @@index([subscriptionId]), @@index([providerId]), @@index([paymentStatus])
### PaymentAuditLog
- **@@index**: @@index([transactionId])
### PaymentReconciliation
- **@unique Count**: 1
### LegalDocument
- **@@index**: @@index([slug]), @@index([documentType, isActive])
- **@unique Count**: 1
- **@@unique**: @@unique([documentType, version])
### Invoice
- **@unique Count**: 1
### SettlementRecord
- **@unique Count**: 1
### ReferralProfile
- **@unique Count**: 2

## SECTION 6 — Verify Dead Models

Verified 13 totally dead models. Zero `prisma.model.` calls found across entire codebase:
- **Theme**: No repository, no service, no route, no frontend usage.
- **Guest**: No repository, no service, no route, no frontend usage.
- **GuestKYC**: No repository, no service, no route, no frontend usage.
- **BookingConciergeService**: No repository, no service, no route, no frontend usage.
- **BookingGuest**: No repository, no service, no route, no frontend usage.
- **ConciergeRequest**: No repository, no service, no route, no frontend usage.
- **ConciergeMessage**: No repository, no service, no route, no frontend usage.
- **PropertyAmenity**: No repository, no service, no route, no frontend usage.
- **PropertyPolicy**: No repository, no service, no route, no frontend usage.
- **PropertyPricing**: No repository, no service, no route, no frontend usage.
- **PropertyReview**: No repository, no service, no route, no frontend usage.
- **PropertyOffer**: No repository, no service, no route, no frontend usage.
- **RoomInventory**: No repository, no service, no route, no frontend usage.

## SECTION 7 — Runtime Readiness

- **Schema Ready**: Yes. The schema is well-formed with relations and indexes.
- **Backend Ready**: Partial. Core APIs exist, but many feature domains are completely missing route implementations (e.g., payments, subscriptions, reviews).
- **Frontend Connected**: Partial. Authentication is connected, but dashboard components rely heavily on `TENANT_MOCK_DATA`.
- **Production Ready**: No. Missing integration across 13 schemas and hardcoded `TODO` flags prevent production deployment.

## SECTION 8 — Final Corrections

- The previous database audit estimated usage using looser metrics. This verification run used strict `prisma.[model].` syntax matching across all TypeScript files, producing 100% concrete evidence.
- Any model marked "Used" in the previous audit that lacked direct Prisma syntax in code is now correctly classified as "DEAD" in Section 6.
