# Home4Stay Frontend Deep Audit

## SECTION 1 — Route Inventory

| Route URL | File Path | Purpose | Exists | UI % | Responsive | Mock Data | API | DB | Status |
|---|---|---|---|---|---|---|---|---|---|
| /explore | apps/main-site/src/app/(marketing)/explore/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| / | apps/main-site/src/app/(marketing)/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner/contact | apps/main-site/src/app/(marketing)/partner/contact/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner/demo | apps/main-site/src/app/(marketing)/partner/demo/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner | apps/main-site/src/app/(marketing)/partner/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner/pricing | apps/main-site/src/app/(marketing)/partner/pricing/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /privacy | apps/main-site/src/app/(marketing)/privacy/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /profile/change-password | apps/main-site/src/app/(marketing)/profile/change-password/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /profile/edit | apps/main-site/src/app/(marketing)/profile/edit/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /profile | apps/main-site/src/app/(marketing)/profile/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /refund-policy | apps/main-site/src/app/(marketing)/refund-policy/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /subscription-agreement | apps/main-site/src/app/(marketing)/subscription-agreement/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /terms | apps/main-site/src/app/(marketing)/terms/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /admin/login | apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx | Page | Yes | 60% | No | Yes | No | No | Partial |
| /auth/forgot-password | apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /auth/login | apps/main-site/src/app/(portal)/(auth)/auth/login/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /auth/register | apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /auth/reset-password | apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/login | apps/main-site/src/app/(portal)/(auth)/partner/login/page.tsx | Page | Yes | 60% | No | Yes | No | No | Partial |
| /partner/register | apps/main-site/src/app/(portal)/(auth)/partner/register/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /admin/dashboard | apps/main-site/src/app/(portal)/admin/dashboard/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /admin/leads | apps/main-site/src/app/(portal)/admin/leads/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /admin/properties | apps/main-site/src/app/(portal)/admin/properties/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /admin/properties/[slug]/images | apps/main-site/src/app/(portal)/admin/properties/[slug]/images/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /admin/security | apps/main-site/src/app/(portal)/admin/security/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/bookings | apps/main-site/src/app/(portal)/partner/bookings/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/calendar | apps/main-site/src/app/(portal)/partner/calendar/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/dashboard/billing | apps/main-site/src/app/(portal)/partner/dashboard/billing/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/dashboard/billing/transactions/[id] | apps/main-site/src/app/(portal)/partner/dashboard/billing/transactions/[id]/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/dashboard | apps/main-site/src/app/(portal)/partner/dashboard/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/dashboard/referrals | apps/main-site/src/app/(portal)/partner/dashboard/referrals/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/experiences | apps/main-site/src/app/(portal)/partner/experiences/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/financials | apps/main-site/src/app/(portal)/partner/financials/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/guests | apps/main-site/src/app/(portal)/partner/guests/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/meal-plans | apps/main-site/src/app/(portal)/partner/meal-plans/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner/notifications | apps/main-site/src/app/(portal)/partner/notifications/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/onboarding/amenities | apps/main-site/src/app/(portal)/partner/onboarding/amenities/page.tsx | Page | Yes | 100% | No | No | Yes | No | Complete |
| /partner/onboarding/experiences | apps/main-site/src/app/(portal)/partner/onboarding/experiences/page.tsx | Page | Yes | 100% | No | No | Yes | No | Complete |
| /partner/onboarding/gallery | apps/main-site/src/app/(portal)/partner/onboarding/gallery/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/onboarding/launch | apps/main-site/src/app/(portal)/partner/onboarding/launch/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/onboarding | apps/main-site/src/app/(portal)/partner/onboarding/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /partner/onboarding/policies | apps/main-site/src/app/(portal)/partner/onboarding/policies/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/onboarding/pricing | apps/main-site/src/app/(portal)/partner/onboarding/pricing/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/onboarding/property | apps/main-site/src/app/(portal)/partner/onboarding/property/page.tsx | Page | Yes | 100% | No | Yes | Yes | No | Complete |
| /partner/onboarding/rooms | apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx | Page | Yes | 60% | No | Yes | No | No | Partial |
| /partner/onboarding/theme | apps/main-site/src/app/(portal)/partner/onboarding/theme/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/onboarding/welcome | apps/main-site/src/app/(portal)/partner/onboarding/welcome/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /partner/operational-panel | apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx | Page | Yes | 100% | Yes | No | No | Yes | Complete |
| /partner/promotions | apps/main-site/src/app/(portal)/partner/promotions/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/properties | apps/main-site/src/app/(portal)/partner/properties/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/property-page-cms | apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/reviews | apps/main-site/src/app/(portal)/partner/reviews/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /partner/rooms | apps/main-site/src/app/(portal)/partner/rooms/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /partner/staff | apps/main-site/src/app/(portal)/partner/staff/page.tsx | Page | Yes | 60% | Yes | Yes | No | No | Partial |
| /partner/subscription | apps/main-site/src/app/(portal)/partner/subscription/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /super-admin/automation | apps/main-site/src/app/(portal)/super-admin/automation/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/finance | apps/main-site/src/app/(portal)/super-admin/finance/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/financial-settings | apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/legal-documents | apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/payment-settings | apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /super-admin/payments | apps/main-site/src/app/(portal)/super-admin/payments/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/referrals | apps/main-site/src/app/(portal)/super-admin/referrals/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /super-admin/subscription-plans | apps/main-site/src/app/(portal)/super-admin/subscription-plans/page.tsx | Page | Yes | 100% | Yes | No | Yes | No | Complete |
| /booking/checkout | apps/main-site/src/app/booking/checkout/page.tsx | Page | Yes | 100% | Yes | Yes | Yes | No | Complete |
| /booking/documents/[bookingId] | apps/main-site/src/app/booking/documents/[bookingId]/page.tsx | Page | Yes | 100% | Yes | Yes | No | Yes | Complete |
| /payments/checkout | apps/main-site/src/app/payments/checkout/page.tsx | Page | Yes | 100% | No | Yes | Yes | No | Complete |
| /property/[slug] | apps/main-site/src/app/property/[slug]/page.tsx | Page | Yes | 100% | Yes | No | No | Yes | Complete |
| / | apps/property-site/src/app/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /[slug]/about | apps/property-site/src/app/[slug]/about/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /[slug]/booking | apps/property-site/src/app/[slug]/booking/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /[slug]/contact | apps/property-site/src/app/[slug]/contact/page.tsx | Page | Yes | 60% | No | No | No | No | Partial |
| /[slug] | apps/property-site/src/app/[slug]/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |
| /[slug]/rooms | apps/property-site/src/app/[slug]/rooms/page.tsx | Page | Yes | 60% | Yes | No | No | No | Partial |

## SECTION 2 — Page Inventory

### ExplorePage
- **File**: apps/main-site/src/app/(marketing)/explore/page.tsx
- **Lines**: 134
- **Imports**: { useState, useMemo } from "react", { getAllProperties } from "@/properties-data", FilterPanel, { FilterState } from "@/components/FilterPanel"...
- **Child Components**: FilterState, FilterPanel, SlidersHorizontal, PropertyCard
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### HomePage
- **File**: apps/main-site/src/app/(marketing)/page.tsx
- **Lines**: 210
- **Imports**: Link from "next/link", { useState, useMemo } from "react", OptimizedImage from "@/components/OptimizedImage"...
- **Child Components**: FilterState, FilterPanel, SlidersHorizontal, Link, OptimizedImage
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### ContactPage
- **File**: apps/main-site/src/app/(marketing)/partner/contact/page.tsx
- **Lines**: 25
- **Imports**: ContactForm from "@/components/ContactForm"
- **Child Components**: ContactForm
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### DemoPage
- **File**: apps/main-site/src/app/(marketing)/partner/demo/page.tsx
- **Lines**: 131
- **Imports**: Link from "next/link"
- **Child Components**: Link
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### PartnerPage
- **File**: apps/main-site/src/app/(marketing)/partner/page.tsx
- **Lines**: 349
- **Imports**: Logo from "@/components/ui/Logo", Link from "next/link"
- **Child Components**: Sparkles, Logo, Link, ArrowRight, ArrowUpRight, CheckCircle2, Zap, Star, Lock
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### PricingPage
- **File**: apps/main-site/src/app/(marketing)/partner/pricing/page.tsx
- **Lines**: 129
- **Imports**: Link from "next/link"
- **Child Components**: Link
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### PrivacyPage
- **File**: apps/main-site/src/app/(marketing)/privacy/page.tsx
- **Lines**: 81
- **Imports**: { LegalService } from "@/lib/legal/legalService", { sanitizeHtml } from "@/lib/legal/sanitizer", Link from "next/link"...
- **Child Components**: Link, ShieldAlert, Calendar, FileText
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### ChangePasswordPage
- **File**: apps/main-site/src/app/(marketing)/profile/change-password/page.tsx
- **Lines**: 181
- **Imports**: React, { useState } from "react", { useRouter } from "next/navigation", Link from "next/link"...
- **Child Components**: Loader2, Link, ArrowLeft, ShieldCheck, PasswordInput, PasswordStrengthIndicator, CheckCircle2, KeyRound
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### EditProfilePage
- **File**: apps/main-site/src/app/(marketing)/profile/edit/page.tsx
- **Lines**: 309
- **Imports**: React, { useState, useEffect } from "react", { useRouter } from "next/navigation", OptimizedImage from "@/components/OptimizedImage"...
- **Child Components**: HTMLInputElement, Link, ArrowLeft, Loader2, OptimizedImage, Camera, InputField, User, Mail, PhoneInput, MapPin, Save
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### ProfilePage
- **File**: apps/main-site/src/app/(marketing)/profile/page.tsx
- **Lines**: 298
- **Imports**: React, { useEffect } from "react", Link from "next/link", { useAuth } from "@/context/AuthContext"...
- **Child Components**: Link, Edit3, OptimizedImage, VerifiedBadge, Mail, ProfileItem, User, Phone, MapPin, Calendar, Shield, ArrowRight, ShieldCheck, CheckCircle2, ConciergePortal, AnimatePresence, AadhaarOTPVerification
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### RefundPolicyPage
- **File**: apps/main-site/src/app/(marketing)/refund-policy/page.tsx
- **Lines**: 81
- **Imports**: { LegalService } from "@/lib/legal/legalService", { sanitizeHtml } from "@/lib/legal/sanitizer", Link from "next/link"...
- **Child Components**: Link, ShieldAlert, Calendar, FileText
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### SubscriptionAgreementPage
- **File**: apps/main-site/src/app/(marketing)/subscription-agreement/page.tsx
- **Lines**: 81
- **Imports**: { LegalService } from "@/lib/legal/legalService", { sanitizeHtml } from "@/lib/legal/sanitizer", Link from "next/link"...
- **Child Components**: Link, ShieldAlert, Calendar, FileText
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### TermsPage
- **File**: apps/main-site/src/app/(marketing)/terms/page.tsx
- **Lines**: 81
- **Imports**: { LegalService } from "@/lib/legal/legalService", { sanitizeHtml } from "@/lib/legal/sanitizer", Link from "next/link"...
- **Child Components**: Link, ShieldAlert, Calendar, FileText
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### AdminLoginPage
- **File**: apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx
- **Lines**: 90
- **Imports**: { useState } from "react", { useAuth } from "@/context/AuthContext", { PasswordInput } from "@/components/auth/PasswordInput"
- **Child Components**: LoginFormData, PasswordInput
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### ForgotPasswordPage
- **File**: apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx
- **Lines**: 161
- **Imports**: React, { useState } from "react", Link from "next/link", { ArrowLeft, Send, Loader2, Mail, CheckCircle2, RefreshCw } from "lucide-react"
- **Child Components**: Link, ArrowLeft, CheckCircle2, RefreshCw, Mail, Loader2, Send
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### LoginPage
- **File**: apps/main-site/src/app/(portal)/(auth)/auth/login/page.tsx
- **Lines**: 125
- **Imports**: { useState } from "react", Link from "next/link", { motion } from "framer-motion"...
- **Child Components**: LoginFormData, LogIn, PasswordInput, Link, ArrowRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### RegisterPage
- **File**: apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx
- **Lines**: 187
- **Imports**: { useState, useMemo } from "react", { useRouter } from "next/navigation", Link from "next/link"...
- **Child Components**: CheckCircle2, Sparkles, PhoneInput, PasswordInput, PasswordStrengthIndicator, ArrowRight, Link
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### ResetPasswordPage
- **File**: apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx
- **Lines**: 221
- **Imports**: React, { useState, Suspense } from "react", { useRouter, useSearchParams } from "next/navigation", Link from "next/link"...
- **Child Components**: Lock, Link, Loader2, CheckCircle2, PasswordInput, PasswordStrengthIndicator, ArrowLeft, Suspense, ResetPasswordForm
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerLoginPage
- **File**: apps/main-site/src/app/(portal)/(auth)/partner/login/page.tsx
- **Lines**: 94
- **Imports**: { useState } from "react", Link from "next/link", { useAuth } from "@/context/AuthContext"...
- **Child Components**: LoginFormData, PasswordInput, Link
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### PartnerRegisterPage
- **File**: apps/main-site/src/app/(portal)/(auth)/partner/register/page.tsx
- **Lines**: 250
- **Imports**: { useState, useEffect } from "react", Link from "next/link", { PasswordInput } from "@/components/auth/PasswordInput"...
- **Child Components**: RegisterFormData, Sparkles, PasswordInput, Link, ArrowRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### AdminDashboard
- **File**: apps/main-site/src/app/(portal)/admin/dashboard/page.tsx
- **Lines**: 66
- **Imports**: React from "react"
- **Child Components**: None
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### LeadsDashboard
- **File**: apps/main-site/src/app/(portal)/admin/leads/page.tsx
- **Lines**: 41
- **Imports**: fs from "fs", path from "path", LeadsList from "@/components/LeadsList"...
- **Child Components**: LogoutButton, LeadsList
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### PropertyManagementPage
- **File**: apps/main-site/src/app/(portal)/admin/properties/page.tsx
- **Lines**: 78
- **Imports**: { getAllProperties } from "@home4stay/data", PropertyForm from "@/components/PropertyForm", LogoutButton from "@/components/LogoutButton"...
- **Child Components**: LogoutButton, PropertyForm, Link
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### ImageManagementPage
- **File**: apps/main-site/src/app/(portal)/admin/properties/[slug]/images/page.tsx
- **Lines**: 67
- **Imports**: OptimizedImage from "@/components/OptimizedImage", { getPropertyOrThrow } from "@home4stay/data", ImageForm from "@/components/ImageForm"...
- **Child Components**: Link, LogoutButton, ImageForm, OptimizedImage
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### AdminSecurityPage
- **File**: apps/main-site/src/app/(portal)/admin/security/page.tsx
- **Lines**: 258
- **Imports**: React, { useState, useEffect } from "react"
- **Child Components**: AuditLog, ShieldAlert, RefreshCw, Search, Filter, Info, ChevronRight, Clock, User, Globe, MapPin, MoreVertical
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### BookingsPage
- **File**: apps/main-site/src/app/(portal)/partner/bookings/page.tsx
- **Lines**: 749
- **Imports**: React, { useState, useEffect, useCallback } from "react", { Loader2 } from "lucide-react", { cn } from "@/lib/utils"...
- **Child Components**: Icon, BookingStatus, Booking, AlertCircle, VolumeX, Volume2, RefreshCcw, StatusTab, Loader2, CheckCircle2, BookingCard, GlassCard, ActivityItem, TrendingUp, SourceBadge, Home, Calendar, Zap, Badge, ActionButtonIcon, MoreVertical
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### CalendarPage
- **File**: apps/main-site/src/app/(portal)/partner/calendar/page.tsx
- **Lines**: 564
- **Imports**: React, { useState, useEffect, useMemo, useCallback } from "react", { cn } from "@/lib/utils", { format, isWithinInterval, isSameDay, areIntervalsOverlapping, addDays, isBefore } from "date-fns"...
- **Child Components**: Reservation, RoomGroup, Date, Address, DayView, WeekView, MonthView, CalendarToolbar, InsightCard, VerifiedBadge, DetailBox, Badge, ShieldCheck, CheckCircle2, CustomDropdown, CustomDatePicker, AnimatePresence, AadhaarOTPVerification, GlassCard, ChevronRight, Icon
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### BillingDashboard
- **File**: apps/main-site/src/app/(portal)/partner/dashboard/billing/page.tsx
- **Lines**: 1227
- **Imports**: React, { useState, useEffect } from "react", { useRouter } from "next/navigation", Link from "next/link"...
- **Child Components**: Icon, Subscription, Usages, Plan, Provider, Transaction, Invoice, File, HTMLInputElement, GlassCard, AlertCircle, CheckCircle2, WidgetHeader, ShieldCheck, UsageMeter, Info, Phone, Mail, UploadCloud, Link, Loader2, ArrowUpRight, Filter, Clock, ChevronLeft, ChevronRight, FileText, Download
- **API Calls**: fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### TransactionTimelinePage
- **File**: apps/main-site/src/app/(portal)/partner/dashboard/billing/transactions/[id]/page.tsx
- **Lines**: 403
- **Imports**: React, { useState, useEffect } from "react", { useRouter, useParams } from "next/navigation", { cn } from "@/lib/utils"
- **Child Components**: CheckCircle2, XCircle, TransactionDetails, GlassCard, AlertCircle, ArrowLeft, TimelineStep, Eye, HelpCircle, Phone, Mail
- **API Calls**: fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerDashboard
- **File**: apps/main-site/src/app/(portal)/partner/dashboard/page.tsx
- **Lines**: 283
- **Imports**: React, { useState, useEffect } from "react", { cn } from "@/lib/utils"
- **Child Components**: Icon, GlassCard, TrendingUp, WidgetHeader, OpIcon, ChevronRight, Loader2, Booking, DashboardStats, Clock, HeroRevenue, OccupancyRing, TodayOperations, PendingApprovals, ActivityFeed
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerReferralPage
- **File**: apps/main-site/src/app/(portal)/partner/dashboard/referrals/page.tsx
- **Lines**: 568
- **Imports**: React, { useState, useEffect } from "react", { cn } from "@/lib/utils"
- **Child Components**: Icon, ReferralProfile, ReferralEvent, LedgerEntry, Redemption, CheckCircle, Clock, AlertTriangle, XCircle, HelpCircle, RefreshCw, GlassCard, Gift, Check, Copy, WidgetHeader, TrendingUp, Award, Users, FileText
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerExperiencesPage
- **File**: apps/main-site/src/app/(portal)/partner/experiences/page.tsx
- **Lines**: 263
- **Imports**: React, { useState, useEffect, useCallback } from "react", { useAuth } from "@/context/AuthContext", { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary"...
- **Child Components**: Experience, Sparkles, Plus, Search, Zap, ExperienceCard, Info, ExperienceLibrary, Clock, MoreVertical, Edit3, ChevronRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### FinancialsPage
- **File**: apps/main-site/src/app/(portal)/partner/financials/page.tsx
- **Lines**: 343
- **Imports**: React, { useState, useEffect } from "react", { cn } from "@/lib/utils"
- **Child Components**: Transaction, Invoice, FinancialStats, Download, Plus, Zap, StatWidget, GlassCard, BarChart3, StatusBadge, FileText, Printer, Clock, CheckCircle2, Icon, ArrowUpRight, ArrowDownRight
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### GuestsPage
- **File**: apps/main-site/src/app/(portal)/partner/guests/page.tsx
- **Lines**: 353
- **Imports**: React, { useState } from "react", { cn } from "@/lib/utils"
- **Child Components**: Icon, Guest, Search, UserPlus, StatWidget, GuestListItem, LoyaltyBadge, InfoBox, Home, CheckCircle2, TagBadge, TimelineItem, GlassCard, MessageSquare, ChevronRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### PartnerMealPlansPage
- **File**: apps/main-site/src/app/(portal)/partner/meal-plans/page.tsx
- **Lines**: 46
- **Imports**: React from "react", { Utensils, Plus } from "lucide-react"
- **Child Components**: Plus, Utensils
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### NotificationsPage
- **File**: apps/main-site/src/app/(portal)/partner/notifications/page.tsx
- **Lines**: 332
- **Imports**: React, { useState, useEffect } from "react", { cn } from "@/lib/utils"
- **Child Components**: Priority, AutomationStatus, Search, Zap, StatWidget, History, NotificationCard, GlassCard, AutomationStatusBadge, Pause, Play, ApprovalItem, InboxItem, MessageSquare, Icon, CheckCircle2, CreditCard, AlertTriangle, PriorityBadge, ChevronRight, ArrowUpRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### AmenitiesStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/amenities/page.tsx
- **Lines**: 227
- **Imports**: React, { useState } from "react", { ArrowRight, Sparkles, Heart, Loader2, Check } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: Sparkles, Loader2, Check, MultiSelect, Heart, ArrowRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### ExperiencesStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/experiences/page.tsx
- **Lines**: 230
- **Imports**: React, { useState } from "react", { ArrowRight, Compass, Star, Sparkles, Loader2, Check } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: ExperienceItem, Compass, Sparkles, Loader2, Check, MultiSelect, Star, ArrowRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### GalleryStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/gallery/page.tsx
- **Lines**: 608
- **Imports**: React, { useState, useEffect, useRef } from "react", { useOnboarding } from "@/context/OnboardingContext", { cn } from "@/lib/utils"...
- **Child Components**: MediaAsset, UploadTask, HTMLInputElement, ImageIcon, ValidationMessage, Upload, Loader2, Check, RefreshCw, Layers, Crown, Trash2, Info, ArrowRight
- **API Calls**: fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### LaunchStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/launch/page.tsx
- **Lines**: 624
- **Imports**: React, { useState, useEffect } from "react", { useRouter } from "next/navigation", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: LaunchReadinessReport, Loader2, Sparkles, Award, Smartphone, ShieldCheck, ExternalLink, ArrowRight, Globe, XCircle, CheckCircle2, AlertTriangle, Rocket, Eye, Check, TextField, TextArea
- **API Calls**: fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### OnboardingBasePage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/page.tsx
- **Lines**: 87
- **Imports**: React, { useEffect } from "react", { useRouter } from "next/navigation", { useAuth } from "@/context/AuthContext"...
- **Child Components**: Logo, Lock, ArrowRight, ArrowUpRight
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### PoliciesStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/policies/page.tsx
- **Lines**: 102
- **Imports**: React from "react", { ArrowRight, ShieldAlert, Clock, ShieldCheck } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: ShieldAlert, StepCard, TextField, Clock, SelectField, ShieldCheck, ArrowRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### PricingStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/pricing/page.tsx
- **Lines**: 265
- **Imports**: React from "react", { ArrowRight, Tag, Check, Lock, Sparkles, Receipt } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: HTMLInputElement, Tag, ValidationMessage, Check, Sparkles, Receipt, Lock, ArrowRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### PropertyStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/property/page.tsx
- **Lines**: 262
- **Imports**: React, { useState } from "react", { ArrowRight, Building2, MapPin, ShieldCheck, Sparkles, Loader2, Check, X } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: Building2, StepCard, TextField, MapPin, Sparkles, TextArea, Loader2, Check, ShieldCheck, ArrowRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### RoomsStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx
- **Lines**: 111
- **Imports**: React from "react", { ArrowRight, Bed, Hotel, Key } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: Hotel, StepCard, TextField, Bed, Key, ArrowRight
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### ThemeStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/theme/page.tsx
- **Lines**: 268
- **Imports**: React, { useState } from "react", { ArrowRight, Palette, Waves, Mountain, ShieldCheck, Sparkles, Check, Loader2 } from "lucide-react", { useOnboarding } from "@/context/OnboardingContext"...
- **Child Components**: Palette, ValidationMessage, Sparkles, Loader2, Check, ThemeIcon, ArrowRight
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### WelcomeStepPage
- **File**: apps/main-site/src/app/(portal)/partner/onboarding/welcome/page.tsx
- **Lines**: 87
- **Imports**: React from "react", { useRouter } from "next/navigation", { Sparkles, Star, ArrowRight, Zap, Shield, Globe } from "lucide-react"
- **Child Components**: Sparkles, ArrowRight, Star
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### OperationalPanelPage
- **File**: apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx
- **Lines**: 331
- **Imports**: React from "react", Link from "next/link", { cookies } from "next/headers"...
- **Child Components**: Link, Database, Mail, Activity, FileSpreadsheet, AlertTriangle, Clock, RefreshCcw
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### PartnerPromotionsPage
- **File**: apps/main-site/src/app/(portal)/partner/promotions/page.tsx
- **Lines**: 304
- **Imports**: React, { useState, useEffect, useCallback } from "react", { motion, AnimatePresence } from "framer-motion", { cn } from "@/lib/utils"...
- **Child Components**: PromotionOffer, RefreshCcw, Zap, Plus, MetricCard, OfferCard, Tag, AnimatePresence, Input, Icon, Ticket, Percent, IndianRupee, Calendar, CheckCircle2, Trash2
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PropertiesPage
- **File**: apps/main-site/src/app/(portal)/partner/properties/page.tsx
- **Lines**: 418
- **Imports**: React, { useState } from "react", Image from "next/image", { cn } from "@/lib/utils"
- **Child Components**: Property, Plus, StatWidget, PropertyCard, Settings, RoomTypeCard, Badge, Camera, AmenityChip, RatePlanItem, GlassCard, Icon, Image, Star, MapPin, Edit3, Bed, CheckCircle2
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### PartnerCmsPage
- **File**: apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx
- **Lines**: 495
- **Imports**: React, { useState, useEffect } from "react", { motion, AnimatePresence } from "framer-motion", { cn } from "@/lib/utils"...
- **Child Components**: TabType, RefreshCcw, Globe, Eye, CheckCircle2, Save, ChevronRight, AlertCircle, AnimatePresence, IdentitySection, HeroSection, AmenitiesSection, FaqSection, SeoSection, GallerySection, SectionHeader, CmsInput, Plus, Trash2, Type, Search
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerReviewsPage
- **File**: apps/main-site/src/app/(portal)/partner/reviews/page.tsx
- **Lines**: 359
- **Imports**: React, { useState, useEffect, useCallback } from "react", { motion } from "framer-motion", { cn } from "@/lib/utils"...
- **Child Components**: Review, ReviewStats, RefreshCcw, TrendingUp, StatCard, FilterTab, Search, ReviewItem, MessageSquare, Icon, User, ShieldCheck, Star, Sparkles, Eye, EyeOff, Reply, CheckCircle2
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PartnerRoomsPage
- **File**: apps/main-site/src/app/(portal)/partner/rooms/page.tsx
- **Lines**: 116
- **Imports**: React, { useState, useEffect } from "react", { BedDouble, Plus, X, Loader2 } from "lucide-react", RoomForm from "@/components/RoomForm"...
- **Child Components**: RoomGroup, Plus, Loader2, RoomForm, BedDouble
- **API Calls**: fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### StaffPage
- **File**: apps/main-site/src/app/(portal)/partner/staff/page.tsx
- **Lines**: 452
- **Imports**: React, { useState, useEffect } from "react", { cn } from "@/lib/utils"
- **Child Components**: ShiftStatus, StaffMember, Search, UserPlus, StatWidget, Filter, Settings, StaffListItem, GlassCard, History, Shield, SecurityItem, RoleBadge, ShiftBadge, Building2, Plus, PermissionItem, Laptop, Smartphone, Trash2, Edit3, Icon, Mail, ChevronRight, Unlock, Lock
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### SubscriptionRedirectPage
- **File**: apps/main-site/src/app/(portal)/partner/subscription/page.tsx
- **Lines**: 6
- **Imports**: { redirect } from "next/navigation"
- **Child Components**: None
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### SuperAdminAutomationPage
- **File**: apps/main-site/src/app/(portal)/super-admin/automation/page.tsx
- **Lines**: 592
- **Imports**: React, { useState, useEffect } from "react", AdminLayout from "@/components/layouts/AdminLayout", { cn } from "@/lib/utils"
- **Child Components**: Icon, JobLog, AuditLog, AdminLayout, RefreshCw, Play, GlassCard, WidgetHeader, CheckCircle, XCircle, Activity, Bell, AlertTriangle, Search, Filter, Database, Mail, MessageSquare, ChevronLeft, ChevronRight
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### FinanceDashboardPage
- **File**: apps/main-site/src/app/(portal)/super-admin/finance/page.tsx
- **Lines**: 986
- **Imports**: React, { useState, useEffect, useCallback } from "react"
- **Child Components**: Stats, Transaction, Settlement, ReconLog, TrendingUp, RefreshCw, PlusCircle, CheckCircle2, AlertCircle, Coins, Scale, AlertTriangle, Activity, Info, FileSpreadsheet, FileDown, Layers
- **API Calls**: fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### FinancialSettingsPage
- **File**: apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx
- **Lines**: 896
- **Imports**: React, { useState, useEffect, useCallback } from "react"
- **Child Components**: HTMLInputElement, Receipt, RefreshCw, CheckCircle2, AlertCircle, Building2, PiggyBank, FileText, PhoneCall, Percent, Scale, ShieldAlert, Save
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### SuperAdminLegalDocumentsPage
- **File**: apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx
- **Lines**: 947
- **Imports**: React, { useState, useEffect, useCallback } from "react", AdminLayout from "@/components/layouts/AdminLayout", { sanitizeHtml } from "@/lib/legal/sanitizer"...
- **Child Components**: LegalDocument, LegalDocumentType, AuditLog, AdminLayout, CheckCircle, AlertTriangle, Shield, RefreshCw, FileText, Users, Globe, BookOpen, Plus, History, Search, Download
- **API Calls**: fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### SuperAdminPaymentSettingsPage
- **File**: apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx
- **Lines**: 850
- **Imports**: React, { useState, useEffect, useCallback } from "react"
- **Child Components**: PaymentProvider, HTMLInputElement, CheckCircle, XCircle, Settings, RefreshCw, ListOrdered, QrCode, Upload, Shield, AlertTriangle
- **API Calls**: fetch(, fetch(, fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### SuperAdminPaymentsPage
- **File**: apps/main-site/src/app/(portal)/super-admin/payments/page.tsx
- **Lines**: 1121
- **Imports**: React, { useState, useEffect, useCallback } from "react", AdminLayout from "@/components/layouts/AdminLayout"
- **Child Components**: FinanceMetrics, PendingPayment, HistoricPayment, ExpiringSub, Subscription, AuditLog, AdminLayout, CheckCircle, XCircle, DollarSign, RefreshCw, Clock, User, AlertTriangle, Shield, Plus
- **API Calls**: fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### SuperAdminReferralsPage
- **File**: apps/main-site/src/app/(portal)/super-admin/referrals/page.tsx
- **Lines**: 512
- **Imports**: React, { useState, useEffect, useCallback } from "react", AdminLayout from "@/components/layouts/AdminLayout", { cn } from "@/lib/utils"
- **Child Components**: Icon, ReferralEvent, TopReferrer, AdminLayout, RefreshCw, GlassCard, Activity, Users, ShieldAlert, CheckCircle, Search, Filter, BookOpen, MessageSquare, WidgetHeader
- **API Calls**: fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### SuperAdminSubscriptionPlansPage
- **File**: apps/main-site/src/app/(portal)/super-admin/subscription-plans/page.tsx
- **Lines**: 706
- **Imports**: React, { useState, useEffect, useCallback } from "react"
- **Child Components**: SubscriptionPlan, CheckCircle, XCircle, Layers, Plus, RefreshCw, Star, Globe, ImageIcon, Video, Bookmark, Calendar, Edit, Trash2, DollarSign, Sliders, ShieldCheck
- **API Calls**: fetch(, fetch(, fetch(
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### CheckoutPage
- **File**: apps/main-site/src/app/booking/checkout/page.tsx
- **Lines**: 1423
- **Imports**: React, { useState, useEffect, useRef } from "react", { cn } from "@/lib/utils", { VerifiedBadge } from "@/components/ui/VerifiedBadge"...
- **Child Components**: PaymentMethod, Record, BookingMode, AadhaarData, PropertyData, CheckoutStep, PaymentIntent, NodeJS, AlertTriangle, SuccessView, Clock, GlassCard, Zap, QrCode, CheckCircle2, Copy, RefreshCcw, ArrowRight, ShieldCheck, VerifiedBadge, InputGroup, ConciergeUpsell, PaymentTab, Wallet, Lock, MessageCircle, BookingSummaryCard, ReassuranceWidget, AnimatePresence, AadhaarOTPVerification, BookingSummaryContent, ChevronUp, HTMLInputElement, Icon, Building, MapPin, SummaryItem, Ticket, Info, Tag, Receipt, Star, SuccessCard
- **API Calls**: fetch(, fetch(, fetch(, fetch(, fetch(, fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### DocumentCenterPage
- **File**: apps/main-site/src/app/booking/documents/[bookingId]/page.tsx
- **Lines**: 280
- **Imports**: React from "react", Link from "next/link", { redirect } from "next/navigation"...
- **Child Components**: Link, ArrowLeft, ShieldCheck, MapPin, Calendar, CreditCard, CheckCircle, Download, Clock, FileText, User
- **API Calls**: None
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: Mock Data
- **Completion**: 60%

### CheckoutSimulatorPage
- **File**: apps/main-site/src/app/payments/checkout/page.tsx
- **Lines**: 384
- **Imports**: React, { useState, Suspense } from "react", { useSearchParams, useRouter } from "next/navigation"
- **Child Components**: Suspense, CheckoutSimulatorContent
- **API Calls**: fetch(
- **Hardcoded Data**: Yes
- **TODO/FIXME**: None
- **Integration Status**: API Connected
- **Completion**: 90%

### PropertyPage
- **File**: apps/main-site/src/app/property/[slug]/page.tsx
- **Lines**: 265
- **Imports**: crypto from "crypto", { notFound } from "next/navigation", Gallery from "@/components/property/Gallery"...
- **Child Components**: Metadata, Sparkles, BrandedHero, NarrativeCardStack, Gallery, Icon, RoomSelection, MealPlans, CustomizeStaySection, PolicyAndFAQSection, Star, ReviewsSection, HostSection, ContactSection, FloatingBookingBar
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### Home
- **File**: apps/property-site/src/app/page.tsx
- **Lines**: 8
- **Imports**: None
- **Child Components**: None
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### AboutPage
- **File**: apps/property-site/src/app/[slug]/about/page.tsx
- **Lines**: 8
- **Imports**: None
- **Child Components**: None
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### BookingPage
- **File**: apps/property-site/src/app/[slug]/booking/page.tsx
- **Lines**: 104
- **Imports**: { Suspense } from "react", BookingForm from "../../../components/BookingForm", { getProperty } from "@home4stay/data"...
- **Child Components**: Link, Suspense, BookingForm
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### ContactPage
- **File**: apps/property-site/src/app/[slug]/contact/page.tsx
- **Lines**: 8
- **Imports**: None
- **Child Components**: None
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 20%

### PropertyHomePage
- **File**: apps/property-site/src/app/[slug]/page.tsx
- **Lines**: 374
- **Imports**: Link from "next/link", Image from "next/image", { getProperty } from "@home4stay/data"...
- **Child Components**: Link, Image
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

### RoomsPage
- **File**: apps/property-site/src/app/[slug]/rooms/page.tsx
- **Lines**: 126
- **Imports**: Link from "next/link", { getProperty } from "@home4stay/data", RoomsList from "../../../components/RoomsList"...
- **Child Components**: Link, RoomsList
- **API Calls**: None
- **Hardcoded Data**: No
- **TODO/FIXME**: None
- **Integration Status**: Static
- **Completion**: 60%

## SECTION 3 — Component Inventory

| Component | Location | Purpose | Mock | Connected | Complete % |
|---|---|---|---|---|---|
| AmenitiesEditor | apps/main-site/src/components/admin/cms/AmenitiesEditor.tsx | UI Component | No | No | 80% |
| CarouselEditor | apps/main-site/src/components/admin/cms/CarouselEditor.tsx | UI Component | Yes | No | 80% |
| FAQEditor | apps/main-site/src/components/admin/cms/FAQEditor.tsx | UI Component | Yes | No | 80% |
| GalleryEditor | apps/main-site/src/components/admin/cms/GalleryEditor.tsx | UI Component | Yes | No | 80% |
| HeroEditor | apps/main-site/src/components/admin/cms/HeroEditor.tsx | UI Component | Yes | No | 80% |
| LivePreview | apps/main-site/src/components/admin/cms/LivePreview.tsx | UI Component | No | No | 80% |
| MediaLibraryModal | apps/main-site/src/components/admin/cms/MediaLibraryModal.tsx | UI Component | Yes | Yes | 100% |
| NarrativeEditor | apps/main-site/src/components/admin/cms/NarrativeEditor.tsx | UI Component | Yes | No | 80% |
| PageStructureEditor | apps/main-site/src/components/admin/cms/PageStructureEditor.tsx | UI Component | No | No | 80% |
| SectionRenderer | apps/main-site/src/components/admin/cms/SectionRenderer.tsx | UI Component | No | No | 80% |
| SeoEditor | apps/main-site/src/components/admin/cms/SeoEditor.tsx | UI Component | Yes | No | 80% |
| TestimonialsEditor | apps/main-site/src/components/admin/cms/TestimonialsEditor.tsx | UI Component | Yes | No | 80% |
| types | apps/main-site/src/components/admin/cms/types.ts | UI Component | No | No | 80% |
| UniversalSectionToolbar | apps/main-site/src/components/admin/cms/UniversalSectionToolbar.tsx | UI Component | Yes | No | 80% |
| AmenitiesSectionView | apps/main-site/src/components/admin/cms/views/AmenitiesSectionView.tsx | UI Component | No | No | 80% |
| CarouselSectionView | apps/main-site/src/components/admin/cms/views/CarouselSectionView.tsx | UI Component | No | No | 80% |
| FAQSectionView | apps/main-site/src/components/admin/cms/views/FAQSectionView.tsx | UI Component | No | No | 80% |
| GallerySectionView | apps/main-site/src/components/admin/cms/views/GallerySectionView.tsx | UI Component | No | No | 80% |
| HeroSectionView | apps/main-site/src/components/admin/cms/views/HeroSectionView.tsx | UI Component | No | No | 80% |
| NarrativeSectionView | apps/main-site/src/components/admin/cms/views/NarrativeSectionView.tsx | UI Component | No | No | 80% |
| TestimonialsSectionView | apps/main-site/src/components/admin/cms/views/TestimonialsSectionView.tsx | UI Component | No | No | 80% |
| PasswordInput | apps/main-site/src/components/auth/PasswordInput.tsx | UI Component | Yes | No | 80% |
| PasswordStrengthIndicator | apps/main-site/src/components/auth/PasswordStrengthIndicator.tsx | UI Component | No | No | 80% |
| PhoneInput | apps/main-site/src/components/auth/PhoneInput.tsx | UI Component | Yes | No | 80% |
| ConciergeUpsell | apps/main-site/src/components/booking/ConciergeUpsell.tsx | UI Component | Yes | No | 80% |
| FloatingBookingBar | apps/main-site/src/components/booking/FloatingBookingBar.tsx | UI Component | No | No | 80% |
| BookingCard | apps/main-site/src/components/calendar/BookingCard.tsx | UI Component | No | No | 80% |
| calendar-utils | apps/main-site/src/components/calendar/calendar-utils.ts | UI Component | No | No | 80% |
| CalendarToolbar | apps/main-site/src/components/calendar/CalendarToolbar.tsx | UI Component | No | No | 80% |
| CustomDatePicker | apps/main-site/src/components/calendar/CustomDatePicker.tsx | UI Component | Yes | No | 80% |
| CustomDropdown | apps/main-site/src/components/calendar/CustomDropdown.tsx | UI Component | Yes | No | 80% |
| DayView | apps/main-site/src/components/calendar/DayView.tsx | UI Component | No | No | 80% |
| MonthView | apps/main-site/src/components/calendar/MonthView.tsx | UI Component | No | No | 80% |
| MonthYearSelector | apps/main-site/src/components/calendar/MonthYearSelector.tsx | UI Component | No | No | 80% |
| types | apps/main-site/src/components/calendar/types.ts | UI Component | No | No | 80% |
| useCalendarDates | apps/main-site/src/components/calendar/useCalendarDates.ts | UI Component | No | No | 80% |
| WeekView | apps/main-site/src/components/calendar/WeekView.tsx | UI Component | Yes | No | 80% |
| ContactForm | apps/main-site/src/components/ContactForm.tsx | UI Component | Yes | Yes | 100% |
| ExperienceForm | apps/main-site/src/components/ExperienceForm.tsx | UI Component | Yes | No | 80% |
| ExperienceLibrary | apps/main-site/src/components/experiences/ExperienceLibrary.tsx | UI Component | No | No | 80% |
| FilterPanel | apps/main-site/src/components/FilterPanel.tsx | UI Component | No | No | 80% |
| Footer | apps/main-site/src/components/Footer.tsx | UI Component | No | No | 80% |
| ImageForm | apps/main-site/src/components/ImageForm.tsx | UI Component | Yes | Yes | 100% |
| AadhaarOTPVerification | apps/main-site/src/components/kyc/AadhaarOTPVerification.tsx | UI Component | Yes | No | 80% |
| AdminLayout | apps/main-site/src/components/layouts/AdminLayout.tsx | UI Component | No | No | 80% |
| PartnerLayout | apps/main-site/src/components/layouts/PartnerLayout.tsx | UI Component | No | No | 80% |
| LeadsList | apps/main-site/src/components/LeadsList.tsx | UI Component | No | No | 80% |
| LogoutButton | apps/main-site/src/components/LogoutButton.tsx | UI Component | No | No | 80% |
| Navbar.original | apps/main-site/src/components/Navbar.original.tsx | UI Component | No | No | 80% |
| Navbar | apps/main-site/src/components/Navbar.tsx | UI Component | No | No | 80% |
| FormComponents | apps/main-site/src/components/onboarding/FormComponents.tsx | UI Component | No | No | 80% |
| PreviewRenderer | apps/main-site/src/components/onboarding/PreviewRenderer.tsx | UI Component | No | No | 80% |
| OptimizedImage | apps/main-site/src/components/OptimizedImage.tsx | UI Component | Yes | No | 80% |
| ConciergePortal | apps/main-site/src/components/portal/ConciergePortal.tsx | UI Component | Yes | No | 80% |
| LegalWall | apps/main-site/src/components/portal/LegalWall.tsx | UI Component | No | Yes | 100% |
| BookingCard | apps/main-site/src/components/property/BookingCard.tsx | UI Component | No | No | 80% |
| BrandedHero | apps/main-site/src/components/property/BrandedHero.tsx | UI Component | No | No | 80% |
| ContactSection | apps/main-site/src/components/property/ContactSection.tsx | UI Component | Yes | No | 80% |
| CustomizeStaySection | apps/main-site/src/components/property/CustomizeStaySection.tsx | UI Component | No | Yes | 100% |
| Gallery | apps/main-site/src/components/property/Gallery.tsx | UI Component | No | No | 80% |
| HostSection | apps/main-site/src/components/property/HostSection.tsx | UI Component | No | No | 80% |
| MealPlans | apps/main-site/src/components/property/MealPlans.tsx | UI Component | No | No | 80% |
| MobileBookingBar | apps/main-site/src/components/property/MobileBookingBar.tsx | UI Component | No | No | 80% |
| NarrativeCardStack | apps/main-site/src/components/property/NarrativeCardStack.tsx | UI Component | No | No | 80% |
| PolicyAndFAQSection | apps/main-site/src/components/property/PolicyAndFAQSection.tsx | UI Component | No | No | 80% |
| PromotionalBanner | apps/main-site/src/components/property/PromotionalBanner.tsx | UI Component | No | No | 80% |
| ReviewsSection | apps/main-site/src/components/property/ReviewsSection.tsx | UI Component | No | Yes | 100% |
| RoomSelection | apps/main-site/src/components/property/RoomSelection.tsx | UI Component | Yes | No | 80% |
| SleepingArrangements | apps/main-site/src/components/property/SleepingArrangements.tsx | UI Component | No | No | 80% |
| StickyHeader | apps/main-site/src/components/property/StickyHeader.tsx | UI Component | No | No | 80% |
| PropertyCard | apps/main-site/src/components/PropertyCard.tsx | UI Component | No | No | 80% |
| PropertyForm | apps/main-site/src/components/PropertyForm.tsx | UI Component | Yes | Yes | 100% |
| RoomForm | apps/main-site/src/components/RoomForm.tsx | UI Component | Yes | Yes | 100% |
| SearchBar | apps/main-site/src/components/SearchBar.tsx | UI Component | Yes | No | 80% |
| ThemeProvider | apps/main-site/src/components/theme/ThemeProvider.tsx | UI Component | No | No | 80% |
| ThemeSwitcher | apps/main-site/src/components/ThemeSwitcher.tsx | UI Component | Yes | No | 80% |
| EmptyState | apps/main-site/src/components/ui/EmptyState.tsx | UI Component | No | No | 80% |
| Logo | apps/main-site/src/components/ui/Logo.tsx | UI Component | No | No | 80% |
| VerifiedBadge | apps/main-site/src/components/ui/VerifiedBadge.tsx | UI Component | No | No | 80% |
| Button | packages/ui/Button.tsx | UI Component | No | No | 80% |
| Card | packages/ui/Card.tsx | UI Component | No | No | 20% |
| index | packages/ui/index.ts | UI Component | No | No | 20% |
| Input | packages/ui/Input.tsx | UI Component | No | No | 80% |
| cn | packages/ui/utils/cn.ts | UI Component | No | No | 20% |

## SECTION 4 — Forms

### Form in apps/main-site/src/app/(marketing)/profile/change-password/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(marketing)/profile/edit/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: No
- **Working**: No

### Form in apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/(auth)/auth/login/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: No
- **Working**: No

### Form in apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/(auth)/partner/login/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: No
- **Working**: No

### Form in apps/main-site/src/app/(portal)/(auth)/partner/register/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/partner/dashboard/billing/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/partner/operational-panel/page.tsx
- **Validation**: None detected
- **Submit Handler**: No
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/super-admin/finance/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/(portal)/super-admin/subscription-plans/page.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/app/booking/checkout/page.tsx
- **Validation**: None detected
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/components/ContactForm.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/components/ExperienceForm.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: No
- **Working**: No

### Form in apps/main-site/src/components/ImageForm.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/components/PropertyForm.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

### Form in apps/main-site/src/components/RoomForm.tsx
- **Validation**: Yes (Zod/HTML5/RHF)
- **Submit Handler**: Yes
- **Backend Connected**: Yes
- **Working**: Yes

## SECTION 5 — API Usage

### File: apps/main-site/src/app/(marketing)/profile/change-password/page.tsx
- **Fetch Endpoints**: /api/auth/change-password
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(marketing)/profile/edit/page.tsx
- **Fetch Endpoints**: /api/auth/profile/image, /api/auth/profile
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx
- **Fetch Endpoints**: /api/auth/forgot-password
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx
- **Fetch Endpoints**: /api/auth/register
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx
- **Fetch Endpoints**: /api/auth/reset-password
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/(auth)/partner/register/page.tsx
- **Fetch Endpoints**: /api/legal/active, /api/auth/partner/register
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/admin/security/page.tsx
- **Fetch Endpoints**: /api/admin/security/logs, /api/admin/security/logs
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/bookings/page.tsx
- **Fetch Endpoints**: /api/bookings
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/calendar/page.tsx
- **Fetch Endpoints**: /api/partner/calendar
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/dashboard/billing/page.tsx
- **Fetch Endpoints**: /api/legal/active, /api/payments/manual-upi/submit
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/dashboard/page.tsx
- **Fetch Endpoints**: /api/bookings, /api/partner/dashboard
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/dashboard/referrals/page.tsx
- **Fetch Endpoints**: /api/partner/referrals, /api/partner/referrals
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/experiences/page.tsx
- **Fetch Endpoints**: /api/property/experiences
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/financials/page.tsx
- **Fetch Endpoints**: /api/partner/financials
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/amenities/page.tsx
- **Fetch Endpoints**: /api/partner/ai, /api/partner/ai
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/experiences/page.tsx
- **Fetch Endpoints**: /api/partner/ai, /api/partner/ai
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/gallery/page.tsx
- **Fetch Endpoints**: /api/partner/media, /api/partner/media, /api/partner/media
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/launch/page.tsx
- **Fetch Endpoints**: /api/partner/onboarding/launch, /api/partner/ai, /api/partner/ai, /api/partner/onboarding/launch
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/property/page.tsx
- **Fetch Endpoints**: /api/partner/ai, /api/partner/ai
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/onboarding/theme/page.tsx
- **Fetch Endpoints**: /api/partner/ai, /api/partner/ai
- **Loading State**: No
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/promotions/page.tsx
- **Fetch Endpoints**: /api/property/promotions
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx
- **Fetch Endpoints**: /api/property/cms
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/reviews/page.tsx
- **Fetch Endpoints**: /api/property/reviews, /api/property/reviews
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/partner/rooms/page.tsx
- **Fetch Endpoints**: /api/partner/rooms
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/automation/page.tsx
- **Fetch Endpoints**: /api/admin/automation/logs, /api/admin/automation/logs
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/finance/page.tsx
- **Fetch Endpoints**: /api/admin/finance/dashboard, /api/admin/finance/dashboard, /api/admin/finance/reconcile, /api/admin/finance/reconcile
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx
- **Fetch Endpoints**: /api/admin/financial-settings, /api/admin/financial-settings, /api/admin/financial-settings
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx
- **Fetch Endpoints**: /api/admin/legal-documents, /api/admin/legal-documents, /api/admin/legal-documents, /api/admin/legal-documents, /api/admin/legal-documents
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/payment-settings/page.tsx
- **Fetch Endpoints**: /api/admin/payment-settings/providers, /api/admin/payment-settings/providers, /api/admin/payment-settings/providers/upload-qr
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/payments/page.tsx
- **Fetch Endpoints**: /api/admin/payments/dashboard, /api/admin/payments/audit-logs
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/referrals/page.tsx
- **Fetch Endpoints**: /api/admin/referrals, /api/admin/referrals
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/(portal)/super-admin/subscription-plans/page.tsx
- **Fetch Endpoints**: /api/admin/subscription-plans
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/app/booking/checkout/page.tsx
- **Fetch Endpoints**: /api/property/promotions/validate-coupon, /api/bookings
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/admin/cms/MediaLibraryModal.tsx
- **Fetch Endpoints**: /api/media/upload
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/ContactForm.tsx
- **Fetch Endpoints**: /api/contact
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/ImageForm.tsx
- **Fetch Endpoints**: /api/property/image
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/portal/LegalWall.tsx
- **Fetch Endpoints**: /api/auth/legal-status, /api/auth/legal-accept
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/PropertyForm.tsx
- **Fetch Endpoints**: /api/property
- **Loading State**: Yes
- **Error Handling**: Yes

### File: apps/main-site/src/components/RoomForm.tsx
- **Fetch Endpoints**: /api/property/room
- **Loading State**: Yes
- **Error Handling**: Yes

## SECTION 6 — Dummy Data

- **apps/main-site/src/app/(marketing)/profile/change-password/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(marketing)/profile/edit/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/admin/login/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/auth/forgot-password/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/auth/login/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/auth/register/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/auth/reset-password/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/partner/login/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/(auth)/partner/register/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/admin/security/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/calendar/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/dashboard/billing/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/experiences/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/financials/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/guests/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/notifications/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/onboarding/launch/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/onboarding/policies/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/onboarding/pricing/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/onboarding/property/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/onboarding/rooms/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/promotions/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/properties/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/reviews/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/partner/staff/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/automation/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/finance/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/financial-settings/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/legal-documents/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/payments/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/(portal)/super-admin/referrals/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/booking/checkout/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/booking/documents/[bookingId]/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/app/payments/checkout/page.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/CarouselEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/FAQEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/GalleryEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/HeroEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/MediaLibraryModal.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/NarrativeEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/SeoEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/TestimonialsEditor.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/admin/cms/UniversalSectionToolbar.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/auth/PasswordInput.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/auth/PhoneInput.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/booking/ConciergeUpsell.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/calendar/CustomDatePicker.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/calendar/CustomDropdown.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/calendar/WeekView.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/ContactForm.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/ExperienceForm.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/ImageForm.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/kyc/AadhaarOTPVerification.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/OptimizedImage.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/portal/ConciergePortal.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/property/ContactSection.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/property/RoomSelection.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/PropertyForm.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/RoomForm.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/SearchBar.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/components/ThemeSwitcher.tsx**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/lib/auth/auth.service.ts**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/lib/cms/hooks/useCmsQuery.ts**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/lib/database/backup.ts**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/lib/mock/tenantData.ts**: Contains terms 'mock', 'dummy', or 'placeholder'.
- **apps/main-site/src/lib/tenant/contextResolver.ts**: Contains terms 'mock', 'dummy', or 'placeholder'.

## SECTION 7 — Runtime Risk

Based on the deep file scan, pages containing the word 'mock' or missing try/catch around API calls are at high risk of failing when integrated with live backends. Files like `start-dev.js`, `stripe.ts`, and `tenantData.ts` actively inject mock context. If these bypasses are removed without full backend data, pages using `AuthContext` or `properties-data` will throw undefined errors.

## SECTION 8 — Missing Screens

- **Advanced Booking Flow**: Only basic checkout structure exists.
- **Host Analytics Dashboard**: Partial UI, no real chart components found.
- **Messaging System**: No inbox/messaging components found for host-guest communication.

## SECTION 9 — Feature Matrix

| Feature | Completion % | Evidence |
|---|---|---|
| Landing Page | 80% | /page.tsx exists with layouts |
| Authentication | 90% | /(auth) pages complete with JWT integration |
| Owner Dashboard | 40% | Partner pages exist but lack deep data binding |
| Admin Dashboard | 20% | /admin routes exist but heavily placeholder |
| Booking Flow | 30% | Checkout route exists but relies on mock stripe |
| Property CMS | 40% | Dynamic /[slug] routes exist but data is mocked |
| Payments | 10% | Gateways return mock URLs, no live processing |
