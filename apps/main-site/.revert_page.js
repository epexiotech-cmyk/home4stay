const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx';

let content = fs.readFileSync(path, 'utf8');

const targetDisplayGallery = `const normalizedGallery = normalizeImages(property.gallery);
  const displayGallery = isGrace
    ? normalizedGallery.slice(0, 3)
    : normalizedGallery;`;

const replacementDisplayGallery = `
  const rawGallery = Array.isArray(property.gallery) ? property.gallery : [];
  // Ensure we only pass valid objects with 'url'
  const validGallery = rawGallery.filter(item => item && typeof item === 'object' && typeof item.url === 'string' && item.url.trim() !== '');

  const displayGallery = isGrace
    ? validGallery.slice(0, 3)
    : validGallery;`;

if (content.includes(targetDisplayGallery)) {
  content = content.replace(targetDisplayGallery, replacementDisplayGallery);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated page.tsx (reverted gallery mapping)');
} else {
  console.log('Target string not found in page.tsx');
}
