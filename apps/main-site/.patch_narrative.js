const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/NarrativeCardStack.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('DEFAULT_FALLBACK_IMAGE')) {
  content = content.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport { DEFAULT_FALLBACK_IMAGE, getValidImageUrl, normalizeImages } from "@/lib/tenant/contextResolver";'
  );
}

const targetImages = `const displayImages = images.length >= 3 ? images : [...images, ...images, ...images].slice(0, 4);`;

const replacementImages = `const validImages = normalizeImages(images);
  const safeImages = validImages.length > 0 ? validImages : [DEFAULT_FALLBACK_IMAGE];
  const displayImages = safeImages.length >= 3 ? safeImages : [...safeImages, ...safeImages, ...safeImages].slice(0, 4);`;

if (content.includes(targetImages)) {
  content = content.replace(targetImages, replacementImages);
  
  // also wrap src={src} in the map just to be absolutely sure
  content = content.replace(/<Image\s*src=\{src\}/g, `<Image\n              src={getValidImageUrl(src) || DEFAULT_FALLBACK_IMAGE}`);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated NarrativeCardStack.tsx');
} else {
  console.log('Target string not found in NarrativeCardStack.tsx');
}
