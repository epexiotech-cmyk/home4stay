import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { SectionType } from "@/components/admin/cms/types";

// Asynchronously mounted client views via Next.js Dynamic code splitting module boundaries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_REGISTRY: Record<SectionType, ComponentType<any>> = {
  hero: dynamic(() => import("@/components/admin/cms/views/HeroSectionView"), { ssr: false }),
  narrative: dynamic(() => import("@/components/admin/cms/views/NarrativeSectionView"), { ssr: false }),
  carousel: dynamic(() => import("@/components/admin/cms/views/CarouselSectionView"), { ssr: false }),
  gallery: dynamic(() => import("@/components/admin/cms/views/GallerySectionView"), { ssr: false }),
  testimonials: dynamic(() => import("@/components/admin/cms/views/TestimonialsSectionView"), { ssr: false }),
  faq: dynamic(() => import("@/components/admin/cms/views/FAQSectionView"), { ssr: false }),
  amenities: dynamic(() => import("@/components/admin/cms/views/AmenitiesSectionView"), { ssr: false }),
  seo: () => null, // Invisible layout adapter module handling meta updates directly
};

// Asynchronously mounted administrative state management editing node factories
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EDITOR_REGISTRY: Record<SectionType, ComponentType<any>> = {
  hero: dynamic(() => import("@/components/admin/cms/HeroEditor"), { ssr: false }),
  narrative: dynamic(() => import("@/components/admin/cms/NarrativeEditor"), { ssr: false }),
  carousel: dynamic(() => import("@/components/admin/cms/CarouselEditor"), { ssr: false }),
  gallery: dynamic(() => import("@/components/admin/cms/GalleryEditor"), { ssr: false }),
  seo: dynamic(() => import("@/components/admin/cms/SeoEditor"), { ssr: false }),
  testimonials: dynamic(() => import("@/components/admin/cms/TestimonialsEditor"), { ssr: false }),
  faq: dynamic(() => import("@/components/admin/cms/FAQEditor"), { ssr: false }),
  amenities: dynamic(() => import("@/components/admin/cms/AmenitiesEditor"), { ssr: false }),
};
