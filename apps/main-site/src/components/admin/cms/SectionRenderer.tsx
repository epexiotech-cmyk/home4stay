import React from "react";
import { SECTION_REGISTRY } from "@/lib/cms/sectionRegistry";
import { 
  RenderSectionBlock, 
  DynamicPropertyPagePayload,
  CmsHeroState,
  CmsNarrativeState,
  CmsCarouselCard,
  CmsGalleryImage
} from "./types";

interface SectionRendererProps {
  section: RenderSectionBlock;
  globalPayload?: DynamicPropertyPagePayload;
}

export default function SectionRenderer({ section, globalPayload }: SectionRendererProps) {
  // Extract Component dynamically out of universal module dictionary
  const Component = SECTION_REGISTRY[section.type];

  if (!Component) {
    console.warn(`SectionRenderer missing mapped registry key component implementation for node type: ${section.type}`);
    return null;
  }

  // Gracefully merge section specific payload override configurations alongside global baseline state fallback properties
  let mergedData = { ...(section.data || {}) };

  if (globalPayload) {
    if (section.type === "hero" && !(mergedData as Partial<CmsHeroState>).title) {
      mergedData = { ...globalPayload.hero, ...mergedData };
    } else if (section.type === "narrative" && !(mergedData as Partial<CmsNarrativeState>).mainHeading) {
      mergedData = { ...globalPayload.narrative, ...mergedData };
    } else if (section.type === "carousel" && !(mergedData as { cards?: CmsCarouselCard[] }).cards) {
      mergedData = { cards: globalPayload.carousel, ...mergedData };
    } else if (section.type === "gallery" && !(mergedData as { images?: CmsGalleryImage[] }).images) {
      mergedData = { images: globalPayload.gallery, ...mergedData };
    }
  }

  // Inject theme variant context from future SaaS CSS injection profiles
  const themeProps = {
    themeVariant: globalPayload?.themePreset || "Mountain Luxury",
    spacingPreset: globalPayload?.themeCustomizations?.spacing || "relaxed-luxury",
    animationPreset: globalPayload?.themeCustomizations?.animationPreset || "cinematic-fade-physics",
  };

  return <Component {...mergedData} {...themeProps} />;
}
