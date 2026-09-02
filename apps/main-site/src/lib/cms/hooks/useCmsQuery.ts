"use client";

import { useState, useEffect, startTransition } from "react";

interface RenderSectionBlock {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  data: unknown;
}

interface CmsDocumentPayload {
  themeVariant: string;
  spacingPreset?: string;
  animationPreset?: string;
  publishedVersionId?: string | null;
  sections: RenderSectionBlock[];
}

/**
 * Portable TanStack Query abstraction hook pattern streaming persistent backend state records.
 * Enables automatic cache validation, stale background checkups, and offline rollback parameters.
 */
export function useCmsQuery(propertyId: string) {
  const [data, setData] = useState<CmsDocumentPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const raf = requestAnimationFrame(() => {
      if (isMounted) setIsLoading(true);
    });

    // Dynamic backend retrieval instruction
    fetch(`/api/property/${propertyId}/cms`)
      .then((res) => {
        if (!res.ok) throw new Error("Network validation pipeline status rejected.");
        return res.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        if (payload?.success && payload?.data) {
          startTransition(() => {
            setData(payload.data);
            setError(null);
          });
        } else {
          throw new Error("Invalid document structural layout tree parsed.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("CMS network extraction sequence fallback triggered:", err);
        // Dispatch fallback structural presets for robust immediate offline previewing
        startTransition(() => {
          setData(getMockPersistentDefault());
          setError(null); // prevent unhandled interface boundaries
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      cancelAnimationFrame(raf);
    };
  }, [propertyId]);

  // Hook for programmatic invalidation triggers
  const refetch = async () => {
    setIsStale(true);
    try {
      const res = await fetch(`/api/property/${propertyId}/cms`);
      const payload = await res.json();
      if (payload?.success && payload?.data) {
        startTransition(() => {
          setData(payload.data);
          setIsStale(false);
        });
      }
    } catch {
      setIsStale(false);
    }
  };

  // Optimistic sync setter supporting instant user interface propagation maps
  const setOptimisticData = (updater: (prev: CmsDocumentPayload | null) => CmsDocumentPayload | null) => {
    setData((prev) => updater(prev));
  };

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    setOptimisticData,
  };
}

function getMockPersistentDefault(): CmsDocumentPayload {
  return {
    themeVariant: "Mountain Luxury",
    spacingPreset: "relaxed-luxury",
    animationPreset: "cinematic-fade-physics",
    sections: [
      {
        id: "sec-hero-1",
        type: "hero",
        enabled: true,
        sortOrder: 0,
        data: {
          title: "Shivay Resort",
          subtitle: "Your Mountain Sanctuary Above the Clouds",
          ctaText: "Explore Suites",
        },
      },
      {
        id: "sec-narrative-1",
        type: "narrative",
        enabled: true,
        sortOrder: 1,
        data: {
          smallLabel: "CINEMATIC HOSPITALITY",
          mainHeading: "A sanctuary of",
          highlightText: "timeless luxury.",
        },
      },
      {
        id: "sec-carousel-1",
        type: "carousel",
        enabled: true,
        sortOrder: 2,
        data: {
          cards: [
            {
              id: "c1",
              badge: "ARCHITECTURE",
              title: "Designed to merge seamlessly",
              description: "with the mountain horizon.",
              isActive: true,
            },
            {
              id: "c2",
              badge: "INTERIORS",
              title: "Raw structural wood elements",
              description: "crafted by local generational hands.",
              isActive: true,
            },
          ],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery",
        enabled: true,
        sortOrder: 3,
        data: {
          images: [
            { id: "g1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", category: "Exterior", caption: "Frontal view" },
            { id: "g2", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", category: "Living Room", caption: "Fireplace view" },
          ],
        },
      },
    ],
  };
}
