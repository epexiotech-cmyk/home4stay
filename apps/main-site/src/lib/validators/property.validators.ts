import { z } from 'zod';
import { CreatePropertyDto, UpdatePropertyDto, CreateFullPropertyDto } from '../types/property.dto';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomInventoryDto, StructuredCapacityDto } from '../types/room.dto';

export const PropertyStatusEnum = z.enum(['DRAFT', 'SETUP_IN_PROGRESS', 'READY_TO_LAUNCH', 'LIVE', 'SUSPENDED']);
export const OnboardingStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LIVE']);

export const createPropertySchema = z.object({
  title: z.string().min(3).max(100),
  propertyType: z.string().optional(),
  shortDescription: z.string().optional(),
  status: PropertyStatusEnum.default('DRAFT'),
  ownerId: z.string().uuid(),
}) satisfies z.ZodType<CreatePropertyDto>;

export const updatePropertySchema = createPropertySchema.partial().extend({
  onboardingStatus: OnboardingStatusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
}) satisfies z.ZodType<UpdatePropertyDto>;

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
}) satisfies z.ZodType<CreateFullPropertyDto>;

export const createBasicPropertySchema = z.object({
  name: z.string().min(3).max(100),
  location: z.string().min(3),
  price: z.number().positive(),
});

export const propertyRoomSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  // Note: capacity remains string-based pending database schema migration
  capacity: z.string().min(1).max(50), 
  view: z.string().min(1).max(100),
  roomType: z.string().optional(),
  roomCount: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(), // Added for compatibility
}) satisfies z.ZodType<CreateRoomDto>;

export const updateRoomSchema = propertyRoomSchema.omit({ propertyId: true }).partial() satisfies z.ZodType<UpdateRoomDto>;

export const updateRoomInventorySchema = z.object({
  availableCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<UpdateRoomInventoryDto>;

// Prepared structured capacity DTO for future schema migration
export const structuredCapacitySchema = z.object({
  maxGuests: z.number().int().positive(),
  maxAdults: z.number().int().positive().optional(),
  maxChildren: z.number().int().nonnegative().optional(),
}) satisfies z.ZodType<StructuredCapacityDto>;

export const propertyReviewReplySchema = z.object({
  reviewId: z.string(),
  responseMessage: z.string().min(1),
});

export const propertyReviewToggleSchema = z.object({
  reviewId: z.string(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const propertyOfferSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  offerType: z.enum(["discount", "package", "seasonal", "early_bird"]),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number(),
  couponCode: z.string().min(3),
  minimumBookingAmount: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  applicableRooms: z.array(z.string()),
  applicableExperiences: z.array(z.string()),
});

export const propertyExperienceSchema = z.object({
  propertyId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  isComplimentary: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  duration: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  requiresScheduling: z.boolean().default(false),
  availabilityType: z.string().default("always"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updatePropertyExperienceSchema = propertyExperienceSchema
  .omit({ propertyId: true })
  .partial()
  .extend({ customAvailability: z.any().optional() });

export const propertyCmsUpdateSchema = z.object({
  propertyId: z.string(),
  themePreset: z.string().optional(),
  sections: z.array(z.any()).optional(),
  amenities: z.array(z.any()).optional(),
  faqs: z.array(z.any()).optional(),
  policies: z.any().optional(),
  seo: z.any().optional(),
  contact: z.any().optional(),
  branding: z.any().optional(),
});


export const propertyNearbyPlaceSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  category: z.string().max(50, "Category is too long").optional().nullable(),
  distance: z.string().max(50, "Distance is too long").optional().nullable(),
  description: z.string().max(1000, "Description is too long").optional().nullable(),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updatePropertyNearbyPlaceSchema = propertyNearbyPlaceSchema
  .omit({ propertyId: true })
  .partial()
  .extend({
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  });
