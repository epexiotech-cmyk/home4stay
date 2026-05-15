export interface CmsHeroState {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  mobileImage: string;
  overlayOpacity: number;
  textAlign: "left" | "center" | "right";
}

export interface CmsStatItem {
  id: string;
  value: string;
  label: string;
}

export interface CmsNarrativeState {
  smallLabel: string;
  mainHeading: string;
  highlightText: string;
  description: string;
  stats: CmsStatItem[];
}

export interface CmsCarouselCard {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CmsGalleryImage {
  id: string;
  url: string;
  category: "Living Room" | "Bedrooms" | "Bathrooms" | "Exterior" | "Pool";
  caption: string;
}

export interface CmsSeoState {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string;
}

export interface CmsTestimonialsState {
  quote: string;
  author: string;
  role: string;
}

// Upgraded Render Section types supporting modular site-building layouts
export type SectionType = "hero" | "narrative" | "carousel" | "gallery" | "seo" | "testimonials" | "faq" | "amenities";

export interface RenderSectionBlock<T = unknown> {
  id: string;
  type: SectionType;
  enabled: boolean;
  sortOrder: number;
  data: T;
}

export type ThemePresetOption = "Mountain Luxury" | "Heritage Royal" | "Scandinavian Minimal" | "Jungle Retreat";

export interface DynamicPropertyPagePayload {
  propertyId: string;
  status: "draft" | "published";
  updatedAt: string;
  publishedAt?: string;
  createdBy: string;
  lastEditedBy: string;
  themePreset: ThemePresetOption;
  themeCustomizations: {
    typography: string;
    spacing: string;
    colorPalette: string;
    animationPreset: string;
  };
  seo: CmsSeoState;
  sections: RenderSectionBlock[];
  
  // Backward compatibility fields mapped to keep component signatures healthy
  hero: CmsHeroState;
  narrative: CmsNarrativeState;
  carousel: CmsCarouselCard[];
  gallery: CmsGalleryImage[];
}
