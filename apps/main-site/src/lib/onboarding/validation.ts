import { z } from "zod";

// Step 2: Property Identity
export const propertyIdentitySchema = z.object({
  title: z.string()
    .min(3, "Property Name must be at least 3 characters long")
    .max(100, "Property Name is too long")
    .trim(),
  location: z.string()
    .min(3, "Geographic Coordinates must be at least 3 characters long")
    .trim(),
  description: z.string()
    .min(10, "Aspirational Description must be at least 10 characters long")
    .trim(),
  tagline: z.string().nullable().optional().transform(val => val ?? ""),
  slug: z.string().nullable().optional().transform(val => val ?? ""),
});

// Step 3: Property Theme Config
export const themeConfigSchema = z.object({
  themeId: z.string().nullish().transform(val => val || "coastal"),
});

// Step 4: Rooms & Inventory Draft
export const roomItemSchema = z.object({
  roomName: z.string().min(1, "Room name is required").trim(),
  price: z.coerce.number()
    .min(1, "Starting rate must be a positive price")
    .max(1000000, "Starting rate exceeds realistic thresholds"),
  capacity: z.string().min(1, "Guest capacity is required").trim(),
  view: z.string().min(1, "Room view is required").trim(),
});

export const roomDraftsSchema = z.object({
  roomName: z.string().min(1, "Room name is required").trim(),
  price: z.coerce.number()
    .min(1, "Starting rate must be a positive price")
    .max(1000000, "Starting rate exceeds realistic thresholds")
});

// Step 5: Amenities Selection
export const amenitySelectionsSchema = z.array(z.string()).min(1, "Please select at least one primary staying amenity");

// Step 6: Experiences Selection
export const experienceSelectionsSchema = z.array(z.string()); // Optional

// Step 7: Media Gallery Selection
export const galleryDraftsSchema = z.array(z.string()).min(1, "Please select at least one signature visual stay photo");

// Step 8: Stay Policies
export const policyConfigSchema = z.object({
  checkIn: z.string().min(1, "Check-in time is required").trim(),
  checkOut: z.string().min(1, "Check-out time is required").trim(),
  cancellation: z.enum(["flexible", "moderate", "strict"], {
    message: "Please choose a valid cancellation policy tier",
  }),
});

// Step 9: SaaS Plan Subscription Pricing
export const pricingConfigSchema = z.object({
  plan: z.enum(["core", "pro"], {
    message: "Please select a valid subscription setup tier",
  }),
  enableBusinessBilling: z.boolean().optional().default(false),
  legalBusinessName: z.string().optional(),
  gstin: z.string().optional(),
  billingAddress: z.string().optional(),
  billingState: z.string().optional(),
  billingPincode: z.string().optional(),
  billingContact: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.enableBusinessBilling) {
    if (!data.legalBusinessName || data.legalBusinessName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Legal Business Name must be at least 3 characters",
        path: ["legalBusinessName"],
      });
    }
    if (!data.gstin || data.gstin.trim().length !== 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GSTIN must be exactly 15 characters",
        path: ["gstin"],
      });
    }
    if (!data.billingAddress || data.billingAddress.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing Address must be at least 5 characters",
        path: ["billingAddress"],
      });
    }
    if (!data.billingState || data.billingState.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State is required",
        path: ["billingState"],
      });
    }
    if (!data.billingPincode || !/^\d{6}$/.test(data.billingPincode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pincode must be exactly 6 digits",
        path: ["billingPincode"],
      });
    }
    if (!data.billingContact || data.billingContact.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing contact must be at least 10 digits",
        path: ["billingContact"],
      });
    }
  }
});


// Step 10: Launch Configuration
export const launchConfigSchema = z.object({
  domain: z.string()
    .trim()
    .refine((val) => {
      if (!val) return true; // Optional custom domain
      return /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i.test(val);
    }, { message: "Invalid custom domain mapping structure (e.g. resort.com)" }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogCopy: z.string().optional(),
});

// Overall wizard draft validation schema index
export const stepSchemas: Record<string, z.ZodTypeAny> = {
  property: propertyIdentitySchema,
  theme: themeConfigSchema,
  rooms: roomDraftsSchema,
  amenities: amenitySelectionsSchema,
  experiences: experienceSelectionsSchema,
  gallery: galleryDraftsSchema,
  policies: policyConfigSchema,
  pricing: pricingConfigSchema,
  launch: launchConfigSchema,
};

// Map step identifier names to normalized schema fields
export const STEP_TO_DRAFT_MAP: Record<string, string> = {
  welcome: "welcome",
  property: "propertyIdentity",
  theme: "themeConfig",
  rooms: "roomDrafts",
  amenities: "amenitySelections",
  experiences: "experienceSelections",
  gallery: "galleryDrafts",
  policies: "policyConfig",
  pricing: "pricingConfig",
  launch: "launchConfig",
};

// Unified TS types for structural checking
export type PropertyIdentityDraft = z.infer<typeof propertyIdentitySchema>;
export type ThemeConfigDraft = z.infer<typeof themeConfigSchema>;
export type RoomItemDraft = z.infer<typeof roomItemSchema>;
export type RoomDraftsDraft = z.infer<typeof roomDraftsSchema>;
export type AmenitySelectionsDraft = z.infer<typeof amenitySelectionsSchema>;
export type ExperienceSelectionsDraft = z.infer<typeof experienceSelectionsSchema>;
export type GalleryDraftsDraft = z.infer<typeof galleryDraftsSchema>;
export type PolicyConfigDraft = z.infer<typeof policyConfigSchema>;
export type PricingConfigDraft = z.infer<typeof pricingConfigSchema>;
export type LaunchConfigDraft = z.infer<typeof launchConfigSchema>;

export interface OnboardingDrafts {
  welcome?: Record<string, unknown>;
  propertyIdentity?: PropertyIdentityDraft;
  themeConfig?: ThemeConfigDraft;
  roomDrafts?: RoomDraftsDraft;
  amenitySelections?: AmenitySelectionsDraft;
  experienceSelections?: ExperienceSelectionsDraft;
  galleryDrafts?: GalleryDraftsDraft;
  policyConfig?: PolicyConfigDraft;
  pricingConfig?: PricingConfigDraft;
  launchConfig?: LaunchConfigDraft;
}

export interface OnboardingStepDrafts {
  welcome?: Record<string, unknown>;
  property?: PropertyIdentityDraft;
  theme?: ThemeConfigDraft;
  rooms?: RoomDraftsDraft;
  amenities?: AmenitySelectionsDraft;
  experiences?: ExperienceSelectionsDraft;
  gallery?: GalleryDraftsDraft;
  policies?: PolicyConfigDraft;
  pricing?: PricingConfigDraft;
  launch?: LaunchConfigDraft;
}
