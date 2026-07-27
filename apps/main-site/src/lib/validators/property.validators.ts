import { z } from 'zod';

export const PropertyStatusEnum = z.enum(['DRAFT', 'SETUP_IN_PROGRESS', 'READY_TO_LAUNCH', 'LIVE', 'SUSPENDED']);
export const OnboardingStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LIVE']);

export const createPropertySchema = z.object({
  title: z.string().min(3).max(100),
  propertyType: z.string().optional(),
  shortDescription: z.string().optional(),
  status: PropertyStatusEnum.default('DRAFT'),
  ownerId: z.string().uuid(),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  onboardingStatus: OnboardingStatusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const propertyAmenitySchema = z.object({
  category: z.string(),
  name: z.string(),
  isAvailable: z.boolean().default(true),
});

export const propertyPolicySchema = z.object({
  checkInTime: z.string(),
  checkOutTime: z.string(),
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  cancellationPolicy: z.string(),
});

export const propertyPricingSchema = z.object({
  basePrice: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  taxRate: z.number().min(0).max(100).default(0),
});

// Full create payload
export const createFullPropertySchema = createPropertySchema.extend({
  amenities: z.array(propertyAmenitySchema).optional(),
  policies: propertyPolicySchema.optional(),
  pricing: propertyPricingSchema.optional(),
});
