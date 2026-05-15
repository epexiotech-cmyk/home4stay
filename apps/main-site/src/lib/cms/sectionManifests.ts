import { SectionType } from "@/components/admin/cms/types";

export interface SectionMetadataConfig {
  type: SectionType;
  label: string;
  category: "Header" | "Storytelling" | "Media" | "Social Proof" | "Information" | "Facilities";
  defaultData: Record<string, unknown>;
  supportedLayouts: string[];
  previewImage?: string;
}

export const SECTION_MANIFESTS: Record<SectionType, SectionMetadataConfig> = {
  hero: {
    type: "hero",
    label: "Cinematic Hero Backdrop",
    category: "Header",
    defaultData: {
      title: "Alpine Sanctuary",
      subtitle: "Immersive atmosphere curated above cloud horizon pathways.",
      ctaText: "Reserve Stay",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      overlayOpacity: 0.4,
      textAlign: "left",
    },
    supportedLayouts: ["Full Bleed", "Split View", "Floating Overlay"],
  },
  narrative: {
    type: "narrative",
    label: "Concierge Narrative Storytelling",
    category: "Storytelling",
    defaultData: {
      smallLabel: "BESPOKE ENVIRONMENT",
      mainHeading: "A timeless encounter with",
      highlightText: "elevated luxury.",
      description: "Crafted out of native spruce frameworks and raw structural stone blocks to envelope incoming guests in uninterrupted silence.",
      stats: [{ id: "1", value: "100%", label: "Absolute Privacy" }],
    },
    supportedLayouts: ["Standard Grid", "Centered Statement"],
  },
  carousel: {
    type: "carousel",
    label: "Shuffling Poker Card Stack",
    category: "Media",
    defaultData: {
      cards: [
        {
          id: "card-demo-1",
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
          badge: "ARCHITECTURE",
          title: "Merged seamlessly with peaks",
          description: "wrapped in soft warm gold pathways.",
          isActive: true,
          sortOrder: 0,
        },
      ],
    },
    supportedLayouts: ["Fanned Stack", "Horizontal Track"],
  },
  gallery: {
    type: "gallery",
    label: "Curated Categorized Gallery Map",
    category: "Media",
    defaultData: {
      images: [
        {
          id: "gal-demo-1",
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          category: "Exterior",
          caption: "Breathtaking frontal view across misty morning pine routes.",
        },
      ],
    },
    supportedLayouts: ["Dynamic Masonry", "Symmetric 3x3 Grid"],
  },
  testimonials: {
    type: "testimonials",
    label: "VIP Customer Quotes",
    category: "Social Proof",
    defaultData: {
      quote: "The private mountain access tracks provide absolute escape. Every bespoke touch warms the soul.",
      author: "Generational Elite Patron",
      role: "Concierge Guestbook",
    },
    supportedLayouts: ["Minimal Blockquote", "Carousel Shelf"],
  },
  faq: {
    type: "faq",
    label: "Common Inquiries (FAQ)",
    category: "Information",
    defaultData: {
      questions: [
        {
          q: "Are the private helicopter access modules exclusive?",
          a: "Yes, our operational staff pre-clears specific perimeter intervals upon landing assignment.",
        },
      ],
    },
    supportedLayouts: ["Expandable Accordion", "Two Column Flow"],
  },
  amenities: {
    type: "amenities",
    label: "Bespoke Premium Facilities",
    category: "Facilities",
    defaultData: {
      facilities: ["Infinity Horizon Thermal Pool", "Underground Timber Spa", "24/7 Dedicated Concierge", "Heliport Strip"],
    },
    supportedLayouts: ["Grid Chips", "Detailed Cards"],
  },
  seo: {
    type: "seo",
    label: "Search Metadata & Absolute Indexing",
    category: "Information",
    defaultData: {
      metaTitle: "Premium Property Hub — Bespoke High Fidelity Ecosystem",
      metaDescription: "Tailored private luxury destination ensuring pristine guest hospitality metrics.",
    },
    supportedLayouts: ["Invisible Controller"],
  },
};
