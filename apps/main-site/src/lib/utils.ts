import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";

export function getValidImageUrl(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") {
    const trimmed = image.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof image === "object") {
    const imgObj = image as Record<string, unknown>;
    const url = imgObj.url || imgObj.src || imgObj.href;
    if (typeof url === "string" && url.trim().length > 0) {
      return url.trim();
    }
  }
  return undefined;
}

export function normalizeImages(images: unknown[] | undefined | null): string[] {
  if (!Array.isArray(images)) return [];
  return images.map(getValidImageUrl).filter((url): url is string => url !== undefined);
}
