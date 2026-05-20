import { prisma } from "../../../lib/database/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export interface PlanEntitlements {
  maxProperties: number;
  maxImagesPerProperty: number;
  maxVideosPerProperty: number;
  maxRoomListings: number;
  maxBookingsPerMonth: number;
  supportPriority: string;
  customBadge: string | null;
  features: {
    featuredListing: boolean;
    analyticsAccess: boolean;
    premiumSupport: boolean;
    whatsappInquiry: boolean;
    aiContentGeneration: boolean;
    priorityRanking: boolean;
    [key: string]: boolean;
  };
}

/**
 * Returns baseline safe tier limits if a custom plan is not resolved in database.
 */
const DEFAULT_LIMITS: PlanEntitlements = {
  maxProperties: 1,
  maxImagesPerProperty: 10,
  maxVideosPerProperty: 1,
  maxRoomListings: 5,
  maxBookingsPerMonth: 100,
  supportPriority: "NORMAL",
  customBadge: null,
  features: {
    featuredListing: false,
    analyticsAccess: false,
    premiumSupport: false,
    whatsappInquiry: true,
    aiContentGeneration: false,
    priorityRanking: false
  }
};

/**
 * Resolves active, non-deleted plans sorted by display order.
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  return await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
      deletedAt: null
    },
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "desc" }
    ]
  });
}

/**
 * Parses database subscription plans dynamic entitlements.
 */
export async function getPlanEntitlements(planIdOrSlug: string): Promise<PlanEntitlements> {
  if (!planIdOrSlug) return DEFAULT_LIMITS;

  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      OR: [
        { id: planIdOrSlug },
        { slug: planIdOrSlug }
      ],
      deletedAt: null
    }
  });

  if (!plan) return DEFAULT_LIMITS;

  // Safe parsing dynamic feature flags JSON
  const rawFlags = typeof plan.featureFlags === "string" 
    ? JSON.parse(plan.featureFlags) 
    : (plan.featureFlags || {});

  return {
    maxProperties: plan.maxProperties,
    maxImagesPerProperty: plan.maxImagesPerProperty,
    maxVideosPerProperty: plan.maxVideosPerProperty,
    maxRoomListings: plan.maxRoomListings,
    maxBookingsPerMonth: plan.maxBookingsPerMonth,
    supportPriority: plan.supportPriority,
    customBadge: plan.customBadge,
    features: {
      featuredListing: !!rawFlags.featuredListing,
      analyticsAccess: !!rawFlags.analyticsAccess,
      premiumSupport: !!rawFlags.premiumSupport,
      whatsappInquiry: !!rawFlags.whatsappInquiry,
      aiContentGeneration: !!rawFlags.aiContentGeneration,
      priorityRanking: !!rawFlags.priorityRanking,
      ...rawFlags
    }
  };
}

/**
 * Resolves properties current active entitlements adjusted for subscription lifecycle status.
 */
export async function getPropertyEntitlements(propertyId: string): Promise<PlanEntitlements> {
  const sub = await prisma.propertySubscription.findFirst({
    where: { propertyId },
    orderBy: { createdAt: "desc" }
  });

  if (!sub) {
    return DEFAULT_LIMITS;
  }

  const baseEntitlements = await getPlanEntitlements(sub.selectedPlanId);

  // 1. If suspended overdue, completely block/zero all entitlements
  if (
    sub.status === SubscriptionStatus.SUSPENDED_OVERDUE ||
    sub.status === SubscriptionStatus.SUSPENDED ||
    sub.status === SubscriptionStatus.EXPIRED ||
    sub.status === SubscriptionStatus.INACTIVE
  ) {
    return {
      maxProperties: 0,
      maxImagesPerProperty: 0,
      maxVideosPerProperty: 0,
      maxRoomListings: 0,
      maxBookingsPerMonth: 0,
      supportPriority: "LOW",
      customBadge: null,
      features: {
        featuredListing: false,
        analyticsAccess: false,
        premiumSupport: false,
        whatsappInquiry: false,
        aiContentGeneration: false,
        priorityRanking: false
      }
    };
  }

  // 2. If in grace period, enforce downgraded limits and features
  if (sub.status === SubscriptionStatus.IN_GRACE_PERIOD) {
    return {
      ...baseEntitlements,
      maxImagesPerProperty: 3, // Hard cap image gallery
      features: {
        ...baseEntitlements.features,
        featuredListing: false,
        aiContentGeneration: false,
        priorityRanking: false,
        whatsappInquiry: false
      }
    };
  }

  // 3. Otherwise (ACTIVE, RENEWED, RENEWAL_DUE, PENDING_PAYMENT), standard plan rights
  return baseEntitlements;
}

