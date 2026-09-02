import os
import re

utils_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/utils.ts'
with open(utils_path, 'r') as f:
    utils_content = f.read()

image_helpers = """
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
"""

if 'DEFAULT_FALLBACK_IMAGE' not in utils_content:
    with open(utils_path, 'w') as f:
        f.write(utils_content + '\n' + image_helpers)

def patch_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r') as f:
        content = f.read()
    
    # We replace import { X, Y, Z } from "@/lib/tenant/contextResolver";
    pattern = re.compile(r'import\s*\{\s*(.*?)\s*\}\s*from\s*["\']@/lib/tenant/contextResolver["\'];')
    
    def repl(match):
        imports = [x.strip() for x in match.group(1).split(',')]
        resolver_imports = []
        util_imports = []
        for imp in imports:
            if imp in ['DEFAULT_FALLBACK_IMAGE', 'getValidImageUrl', 'normalizeImages']:
                util_imports.append(imp)
            else:
                resolver_imports.append(imp)
                
        res = []
        if resolver_imports:
            res.append(f'import {{ {", ".join(resolver_imports)} }} from "@/lib/tenant/contextResolver";')
        if util_imports:
            res.append(f'import {{ {", ".join(util_imports)} }} from "@/lib/utils";')
        return '\n'.join(res)
        
    content = pattern.sub(repl, content)
    
    if file_path.endswith('contextResolver.ts'):
        # Remove the export of these functions from contextResolver.ts
        content = re.sub(r'export const DEFAULT_FALLBACK_IMAGE[\s\S]*?export function normalizeImages[\s\S]*?\n\}', '', content)
        if 'import { DEFAULT_FALLBACK_IMAGE' not in content:
            content = 'import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl, normalizeImages } from "@/lib/utils";\n' + content
            
    with open(file_path, 'w') as f:
        f.write(content)

files = [
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
]

for file in files:
    patch_file(file)

print('Fixed imports for client components')
