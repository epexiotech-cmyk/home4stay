const fs = require('fs');

const utilsPath = '/home/apurv_patel/home4stay/apps/main-site/src/lib/utils.ts';
let utilsContent = fs.readFileSync(utilsPath, 'utf8');

const imageHelpers = `
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

if (!utilsContent.includes('DEFAULT_FALLBACK_IMAGE')) {
  fs.writeFileSync(utilsPath, utilsContent + '\\n' + imageHelpers, 'utf8');
}

// Now replace all imports of these from contextResolver to utils
function patchFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports from contextResolver
    content = content.replace(/import\\s*\\{\\s*(.*?)\\s*\\}\\s*from\\s*["']@\\/lib\\/tenant\\/contextResolver["']/g, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      let resolverImports = [];
      let utilImports = [];
      
      for (const imp of imports) {
        if (['DEFAULT_FALLBACK_IMAGE', 'getValidImageUrl', 'normalizeImages'].includes(imp)) {
          utilImports.push(imp);
        } else {
          resolverImports.push(imp);
        }
      }
      
      let newImportStr = '';
      if (resolverImports.length > 0) {
        newImportStr += 'import { ' + resolverImports.join(', ') + ' } from "@/lib/tenant/contextResolver";\\n';
      }
      if (utilImports.length > 0) {
        newImportStr += 'import { ' + utilImports.join(', ') + ' } from "@/lib/utils";\\n';
      }
      return newImportStr.trim();
    });
    
    // Also remove from contextResolver definition
    if (filePath.endsWith('contextResolver.ts')) {
      content = content.replace(/export const DEFAULT_FALLBACK_IMAGE[\\s\\S]*?export function normalizeImages[\\s\\S]*?\\n\\}/, '');
      if (!content.includes('import { DEFAULT_FALLBACK_IMAGE')) {
        content = 'import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl, normalizeImages } from "@/lib/utils";\\n' + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

const files = [
  '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts',
  '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/BrandedHero.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/NarrativeCardStack.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/Gallery.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/SleepingArrangements.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/HostSection.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/ReviewsSection.tsx',
  '/home/apurv_patel/home4stay/apps/main-site/src/components/property/StickyHeader.tsx'
];

files.forEach(patchFile);
console.log('Fixed imports for client components');
