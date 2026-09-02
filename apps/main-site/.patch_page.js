const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('normalizeImages')) {
  content = content.replace(
    'import { resolvePropertyContext, getPropertyBranding } from "@/lib/tenant/contextResolver";',
    'import { resolvePropertyContext, getPropertyBranding, normalizeImages } from "@/lib/tenant/contextResolver";'
  );
}

const regex = /const displayImages = isGrace\s*\?\s*\(property\.images \|\| \[branding\.heroBackground\]\)\.slice\(0, 3\)\s*:\s*\(property\.images \|\| \[branding\.heroBackground\]\);\s*const displayGallery = isGrace\s*\?\s*\(property\.gallery \|\| \[\]\)\.slice\(0, 3\)\s*:\s*\(property\.gallery \|\| \[\]\);/m;

const replacement = `const normalizedImages = normalizeImages(property.images);
  const displayImages = isGrace
    ? (normalizedImages.length > 0 ? normalizedImages : [branding.heroBackground]).slice(0, 3)
    : (normalizedImages.length > 0 ? normalizedImages : [branding.heroBackground]);

  const normalizedGallery = normalizeImages(property.gallery);
  const displayGallery = isGrace
    ? normalizedGallery.slice(0, 3)
    : normalizedGallery;`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated page.tsx');
} else {
  console.log('Target string not found in page.tsx');
}
