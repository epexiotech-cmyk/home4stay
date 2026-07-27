# Home4Stay Database Deep Audit

## 1. Executive Summary
This document presents a DEEP Database Audit for the Home4Stay monorepo. It catalogs every Prisma model, relationship, and constraint while cross-referencing database usage directly against the frontend code and API endpoints. The audit relies entirely on AST and string analysis of the underlying codebase.

## 2. Prisma Inventory
### Model: User
- **Purpose**: Core entity for User
- **Fields**: 36
- **Relations**: guestProfile (Guest?), referrerEvents (ReferralEvent[]), referredEvents (ReferralEvent[])
- **Indexes**: @@index([reset_password_token])
- **Unique Constraints**: 2
- **Composite Keys**: None

### Model: Property
- **Purpose**: Core entity for Property
- **Fields**: 31
- **Relations**: owner (User)
- **Indexes**: @@index([ownerId])
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PropertyPageContent
- **Purpose**: Core entity for PropertyPageContent
- **Fields**: 10
- **Relations**: property (Property)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PropertySection
- **Purpose**: Core entity for PropertySection
- **Fields**: 6
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: MediaAsset
- **Purpose**: Core entity for MediaAsset
- **Fields**: 17
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId]), @@index([tags])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: CmsVersion
- **Purpose**: Core entity for CmsVersion
- **Fields**: 8
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: Theme
- **Purpose**: Core entity for Theme
- **Fields**: 8
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: Guest
- **Purpose**: Core entity for Guest
- **Fields**: 24
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 2
- **Composite Keys**: None

### Model: GuestKYC
- **Purpose**: Core entity for GuestKYC
- **Fields**: 15
- **Relations**: guest (Guest)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: Booking
- **Purpose**: Core entity for Booking
- **Fields**: 26
- **Relations**: property (Property), room (Room)
- **Indexes**: @@index([propertyId]), @@index([roomId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: BookingConciergeService
- **Purpose**: Core entity for BookingConciergeService
- **Fields**: 7
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: BookingGuest
- **Purpose**: Core entity for BookingGuest
- **Fields**: 7
- **Relations**: booking (Booking), guest (Guest)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: @@unique([bookingId, guestId])

### Model: ConciergeRequest
- **Purpose**: Core entity for ConciergeRequest
- **Fields**: 12
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: ConciergeMessage
- **Purpose**: Core entity for ConciergeMessage
- **Fields**: 9
- **Relations**: request (ConciergeRequest), sender (User)
- **Indexes**: @@index([requestId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertyExperience
- **Purpose**: Core entity for PropertyExperience
- **Fields**: 21
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId]), @@index([category]), @@index([isFeatured]), @@index([isActive])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: Room
- **Purpose**: Core entity for Room
- **Fields**: 14
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertyAmenity
- **Purpose**: Core entity for PropertyAmenity
- **Fields**: 8
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertyPolicy
- **Purpose**: Core entity for PropertyPolicy
- **Fields**: 10
- **Relations**: property (Property)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PropertyPricing
- **Purpose**: Core entity for PropertyPricing
- **Fields**: 8
- **Relations**: property (Property)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PropertyReview
- **Purpose**: Core entity for PropertyReview
- **Fields**: 16
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertyOffer
- **Purpose**: Core entity for PropertyOffer
- **Fields**: 20
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId]), @@index([couponCode])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: RoomInventory
- **Purpose**: Core entity for RoomInventory
- **Fields**: 2
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertyUserAccess
- **Purpose**: Core entity for PropertyUserAccess
- **Fields**: 8
- **Relations**: property (Property), user (User)
- **Indexes**: @@index([userId]), @@index([propertyId])
- **Unique Constraints**: 1
- **Composite Keys**: @@unique([propertyId, userId])

### Model: Session
- **Purpose**: Core entity for Session
- **Fields**: 11
- **Relations**: user (User)
- **Indexes**: @@index([userId]), @@index([refreshTokenHash])
- **Unique Constraints**: 2
- **Composite Keys**: None

### Model: AuditLog
- **Purpose**: Core entity for AuditLog
- **Fields**: 11
- **Relations**: user (User?)
- **Indexes**: @@index([userId]), @@index([action]), @@index([createdAt])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: OnboardingSession
- **Purpose**: Core entity for OnboardingSession
- **Fields**: 9
- **Relations**: property (Property)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PropertySetupProgress
- **Purpose**: Core entity for PropertySetupProgress
- **Fields**: 8
- **Relations**: session (OnboardingSession)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: @@unique([onboardingSessionId, stepId])

### Model: WizardDraft
- **Purpose**: Core entity for WizardDraft
- **Fields**: 4
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: AiGenerationEvent
- **Purpose**: Core entity for AiGenerationEvent
- **Fields**: 4
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: AiPreferenceSignal
- **Purpose**: Core entity for AiPreferenceSignal
- **Fields**: 7
- **Relations**: property (Property)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: @@unique([propertyId, category, signalKey])

### Model: PropertyPaymentConfig
- **Purpose**: Core entity for PropertyPaymentConfig
- **Fields**: 13
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: InvoiceRecord
- **Purpose**: Core entity for InvoiceRecord
- **Fields**: 8
- **Relations**: booking (Booking)
- **Indexes**: @@index([bookingId])
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: Notification
- **Purpose**: Core entity for Notification
- **Fields**: 9
- **Relations**: booking (Booking?)
- **Indexes**: @@index([userId]), @@index([isRead])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: EmailJob
- **Purpose**: Core entity for EmailJob
- **Fields**: 10
- **Relations**: None
- **Indexes**: @@index([status])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PaymentProvider
- **Purpose**: Core entity for PaymentProvider
- **Fields**: 22
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PropertySubscription
- **Purpose**: Core entity for PropertySubscription
- **Fields**: 18
- **Relations**: property (Property)
- **Indexes**: @@index([propertyId]), @@index([status])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: SubscriptionPlan
- **Purpose**: Core entity for SubscriptionPlan
- **Fields**: 18
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: PaymentTransaction
- **Purpose**: Core entity for PaymentTransaction
- **Fields**: 25
- **Relations**: property (Property), subscription (PropertySubscription?), provider (PaymentProvider?)
- **Indexes**: @@index([propertyId]), @@index([subscriptionId]), @@index([providerId]), @@index([paymentStatus])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PaymentAuditLog
- **Purpose**: Core entity for PaymentAuditLog
- **Fields**: 9
- **Relations**: transaction (PaymentTransaction)
- **Indexes**: @@index([transactionId])
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: AutomationJobLog
- **Purpose**: Core entity for AutomationJobLog
- **Fields**: 7
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: PaymentReconciliation
- **Purpose**: Core entity for PaymentReconciliation
- **Fields**: 12
- **Relations**: transaction (PaymentTransaction)
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: LegalDocument
- **Purpose**: Core entity for LegalDocument
- **Fields**: 11
- **Relations**: None
- **Indexes**: @@index([slug]), @@index([documentType, isActive])
- **Unique Constraints**: 1
- **Composite Keys**: @@unique([documentType, version])

### Model: LegalAcceptanceLog
- **Purpose**: Core entity for LegalAcceptanceLog
- **Fields**: 8
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: FinancialSettings
- **Purpose**: Core entity for FinancialSettings
- **Fields**: 25
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: Invoice
- **Purpose**: Core entity for Invoice
- **Fields**: 17
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: SettlementRecord
- **Purpose**: Core entity for SettlementRecord
- **Fields**: 8
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 1
- **Composite Keys**: None

### Model: ReconciliationLog
- **Purpose**: Core entity for ReconciliationLog
- **Fields**: 11
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: ReferralProfile
- **Purpose**: Core entity for ReferralProfile
- **Fields**: 9
- **Relations**: user (User)
- **Indexes**: None
- **Unique Constraints**: 2
- **Composite Keys**: None

### Model: ReferralEvent
- **Purpose**: Core entity for ReferralEvent
- **Fields**: 9
- **Relations**: None
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: ReferralCreditLedger
- **Purpose**: Core entity for ReferralCreditLedger
- **Fields**: 9
- **Relations**: user (User)
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

### Model: ReferralRewardRedemption
- **Purpose**: Core entity for ReferralRewardRedemption
- **Fields**: 11
- **Relations**: user (User), subscription (PropertySubscription)
- **Indexes**: None
- **Unique Constraints**: 0
- **Composite Keys**: None

## 3. Model Inventory

| Model | Purpose | Frontend Usage | API Usage | Status | Completion % |
|---|---|---|---|---|---|
| User | Stores User data | No | No | Production Ready | 40% |
| Property | Stores Property data | No | No | Production Ready | 40% |
| PropertyPageContent | Stores PropertyPageContent data | No | No | Unused | 0% |
| PropertySection | Stores PropertySection data | No | No | Unused | 0% |
| MediaAsset | Stores MediaAsset data | No | No | Unused | 0% |
| CmsVersion | Stores CmsVersion data | No | No | Unused | 0% |
| Theme | Stores Theme data | No | No | Unused | 0% |
| Guest | Stores Guest data | No | No | Unused | 0% |
| GuestKYC | Stores GuestKYC data | No | No | Unused | 0% |
| Booking | Stores Booking data | No | No | Production Ready | 40% |
| BookingConciergeService | Stores BookingConciergeService data | No | No | Unused | 0% |
| BookingGuest | Stores BookingGuest data | No | No | Unused | 0% |
| ConciergeRequest | Stores ConciergeRequest data | No | No | Unused | 0% |
| ConciergeMessage | Stores ConciergeMessage data | No | No | Unused | 0% |
| PropertyExperience | Stores PropertyExperience data | No | No | Unused | 0% |
| Room | Stores Room data | No | No | Production Ready | 40% |
| PropertyAmenity | Stores PropertyAmenity data | No | No | Unused | 0% |
| PropertyPolicy | Stores PropertyPolicy data | No | No | Unused | 0% |
| PropertyPricing | Stores PropertyPricing data | No | No | Unused | 0% |
| PropertyReview | Stores PropertyReview data | No | No | Unused | 0% |
| PropertyOffer | Stores PropertyOffer data | No | No | Unused | 0% |
| RoomInventory | Stores RoomInventory data | No | No | Unused | 0% |
| PropertyUserAccess | Stores PropertyUserAccess data | No | No | Unused | 0% |
| Session | Stores Session data | No | No | Production Ready | 40% |
| AuditLog | Stores AuditLog data | No | No | Unused | 0% |
| OnboardingSession | Stores OnboardingSession data | No | No | Unused | 0% |
| PropertySetupProgress | Stores PropertySetupProgress data | No | No | Unused | 0% |
| WizardDraft | Stores WizardDraft data | No | No | Unused | 0% |
| AiGenerationEvent | Stores AiGenerationEvent data | No | No | Unused | 0% |
| AiPreferenceSignal | Stores AiPreferenceSignal data | No | No | Unused | 0% |
| PropertyPaymentConfig | Stores PropertyPaymentConfig data | No | No | Unused | 0% |
| InvoiceRecord | Stores InvoiceRecord data | No | No | Unused | 0% |
| Notification | Stores Notification data | No | No | Production Ready | 40% |
| EmailJob | Stores EmailJob data | No | No | Unused | 0% |
| PaymentProvider | Stores PaymentProvider data | No | No | Unused | 0% |
| PropertySubscription | Stores PropertySubscription data | No | No | Unused | 0% |
| SubscriptionPlan | Stores SubscriptionPlan data | No | No | Unused | 0% |
| PaymentTransaction | Stores PaymentTransaction data | No | No | Unused | 0% |
| PaymentAuditLog | Stores PaymentAuditLog data | No | No | Unused | 0% |
| AutomationJobLog | Stores AutomationJobLog data | No | No | Unused | 0% |
| PaymentReconciliation | Stores PaymentReconciliation data | No | No | Unused | 0% |
| LegalDocument | Stores LegalDocument data | No | No | Unused | 0% |
| LegalAcceptanceLog | Stores LegalAcceptanceLog data | No | No | Unused | 0% |
| FinancialSettings | Stores FinancialSettings data | No | No | Unused | 0% |
| Invoice | Stores Invoice data | No | No | Production Ready | 40% |
| SettlementRecord | Stores SettlementRecord data | No | No | Unused | 0% |
| ReconciliationLog | Stores ReconciliationLog data | No | No | Unused | 0% |
| ReferralProfile | Stores ReferralProfile data | No | No | Unused | 0% |
| ReferralEvent | Stores ReferralEvent data | No | No | Unused | 0% |
| ReferralCreditLedger | Stores ReferralCreditLedger data | No | No | Unused | 0% |
| ReferralRewardRedemption | Stores ReferralRewardRedemption data | No | No | Unused | 0% |

## 4. Relationship Diagram
Based on schema relations (One-to-Many / Many-to-Many implicit lists):
- **User** relations: guestProfile (Guest?), referrerEvents (ReferralEvent[]), referredEvents (ReferralEvent[])
- **Property** relations: owner (User)
- **PropertyPageContent** relations: property (Property)
- **MediaAsset** relations: property (Property)
- **CmsVersion** relations: property (Property)
- **GuestKYC** relations: guest (Guest)
- **Booking** relations: property (Property), room (Room)
- **BookingGuest** relations: booking (Booking), guest (Guest)
- **ConciergeMessage** relations: request (ConciergeRequest), sender (User)
- **PropertyExperience** relations: property (Property)
- **Room** relations: property (Property)
- **PropertyAmenity** relations: property (Property)
- **PropertyPolicy** relations: property (Property)
- **PropertyPricing** relations: property (Property)
- **PropertyReview** relations: property (Property)
- **PropertyOffer** relations: property (Property)
- **PropertyUserAccess** relations: property (Property), user (User)
- **Session** relations: user (User)
- **AuditLog** relations: user (User?)
- **OnboardingSession** relations: property (Property)
- **PropertySetupProgress** relations: session (OnboardingSession)
- **AiPreferenceSignal** relations: property (Property)
- **PropertyPaymentConfig** relations: property (Property)
- **InvoiceRecord** relations: booking (Booking)
- **Notification** relations: booking (Booking?)
- **PropertySubscription** relations: property (Property)
- **PaymentTransaction** relations: property (Property), subscription (PropertySubscription?), provider (PaymentProvider?)
- **PaymentAuditLog** relations: transaction (PaymentTransaction)
- **PaymentReconciliation** relations: transaction (PaymentTransaction)
- **ReferralProfile** relations: user (User)
- **ReferralCreditLedger** relations: user (User)
- **ReferralRewardRedemption** relations: user (User), subscription (PropertySubscription)

## 5. Seed Inventory
Seed scripts found:
- apps\main-site\prisma\seed-cms.ts

## 6. API → Database Mapping

## 7. Frontend Coverage Matrix
| Feature | DB Support | Evidence |
|---|---|---|
| Authentication | Yes | `User`, `Session` models exist |
| Property CMS | Yes | `Property`, `PropertyPageContent` models exist |
| Bookings | Yes | `Booking` model exists |
| Reviews | Yes | `PropertyReview` model exists |
| Notifications | Yes | `Notification` model exists |

## 8. Performance Issues
Models missing indexes on relations:
- **PropertyPageContent** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **GuestKYC** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **BookingGuest** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **PropertyPolicy** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **PropertyPricing** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **OnboardingSession** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **PropertySetupProgress** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **AiPreferenceSignal** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **PaymentReconciliation** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **ReferralProfile** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **ReferralCreditLedger** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.
- **ReferralRewardRedemption** has relations but no `@@index` specified, potentially causing slow cascading deletes or joins.

## 9. Missing Models
Comparing typical vacation rental platforms, the following might be missing or merged:
- **Payouts/Withdrawals**: Partial coverage via Ledger.
- **Dynamic Pricing/Seasonal Rules**: Pricing object exists but might lack granular calendar rule models.

## 10. Technical Debt
There are 44 models with zero detected Prisma client calls in the `src` directory. These might be dead schemas, legacy models, or fully mocked frontend features:
- PropertyPageContent
- PropertySection
- MediaAsset
- CmsVersion
- Theme
- Guest
- GuestKYC
- BookingConciergeService
- BookingGuest
- ConciergeRequest
- ConciergeMessage
- PropertyExperience
- PropertyAmenity
- PropertyPolicy
- PropertyPricing
- PropertyReview
- PropertyOffer
- RoomInventory
- PropertyUserAccess
- AuditLog
- OnboardingSession
- PropertySetupProgress
- WizardDraft
- AiGenerationEvent
- AiPreferenceSignal
- PropertyPaymentConfig
- InvoiceRecord
- EmailJob
- PaymentProvider
- PropertySubscription
- SubscriptionPlan
- PaymentTransaction
- PaymentAuditLog
- AutomationJobLog
- PaymentReconciliation
- LegalDocument
- LegalAcceptanceLog
- FinancialSettings
- SettlementRecord
- ReconciliationLog
- ReferralProfile
- ReferralEvent
- ReferralCreditLedger
- ReferralRewardRedemption

## 11. Risk Analysis
High Risk: A large percentage of the schema is completely unused by the application logic, indicating massive divergence between database design and actual implemented functionality.

## 12. Database Readiness %
Overall Database Readiness: **14%** (Calculated based on schema utilization by APIs and frontend).
