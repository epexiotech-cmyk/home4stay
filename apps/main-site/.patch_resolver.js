const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts';

let content = fs.readFileSync(path, 'utf8');

const helpers = `
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
`;

if (!content.includes('DEFAULT_FALLBACK_IMAGE')) {
  // Add helpers above getPropertyBranding
  content = content.replace('export function getPropertyBranding', helpers + '\nexport function getPropertyBranding');
  
  // Fix getPropertyBranding
  const targetBackground = `heroBackground: heroBlock?.data?.backgroundImage || (property.images && property.images[0]) || "",`;
  const replacementBackground = `heroBackground: getValidImageUrl(heroBlock?.data?.backgroundImage) || normalizeImages(property.images)[0] || DEFAULT_FALLBACK_IMAGE,`;
  
  const targetOgImage = `ogImage: (property.images && property.images[0]) || ""`;
  const replacementOgImage = `ogImage: normalizeImages(property.images)[0] || DEFAULT_FALLBACK_IMAGE`;
  
  content = content.replace(targetBackground, replacementBackground);
  content = content.replace(targetOgImage, replacementOgImage);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated contextResolver.ts');
} else {
  console.log('contextResolver.ts already updated');
}
