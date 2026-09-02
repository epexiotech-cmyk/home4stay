const fs = require('fs');

const FALLBACK_IMPORT = 'import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/tenant/contextResolver";';
const FALLBACK = 'DEFAULT_FALLBACK_IMAGE';

function addImport(content) {
  if (content.includes('DEFAULT_FALLBACK_IMAGE')) return content;
  return content.replace('import React', FALLBACK_IMPORT + '\nimport React');
}

// 1. Gallery.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/Gallery.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = addImport(content);
  content = content.replace(/url,\s*category:/, 'url: getValidImageUrl(url) || ' + FALLBACK + ',\n      category:');
  fs.writeFileSync(file, content);
  console.log('Patched Gallery');
} catch (e) { console.error('Error Gallery', e); }

// 2. RoomSelection.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = addImport(content);
  content = content.replace(/src=\{room\.image\}/g, 'src={getValidImageUrl(room.image) || ' + FALLBACK + '}');
  // There's also some static arrays in RoomSelection, let's fix the src in Image directly
  fs.writeFileSync(file, content);
  console.log('Patched RoomSelection');
} catch (e) { console.error('Error RoomSelection', e); }

// 3. SleepingArrangements.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/SleepingArrangements.tsx';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = addImport(content);
    content = content.replace(/src=\{item\.image\}/g, 'src={getValidImageUrl(item.image) || ' + FALLBACK + '}');
    fs.writeFileSync(file, content);
    console.log('Patched SleepingArrangements');
  }
} catch (e) { console.error('Error SleepingArrangements', e); }

// 4. HostSection.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/HostSection.tsx';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = addImport(content);
    content = content.replace(/src=\{owner\.avatar\}/g, 'src={getValidImageUrl(owner.avatar) || ' + FALLBACK + '}');
    fs.writeFileSync(file, content);
    console.log('Patched HostSection');
  }
} catch (e) { console.error('Error HostSection', e); }

// 5. ReviewsSection.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/ReviewsSection.tsx';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = addImport(content);
    content = content.replace(/src=\{review\.guestAvatar\}/g, 'src={getValidImageUrl(review.guestAvatar) || ' + FALLBACK + '}');
    // Also we need to make sure review.guestAvatar truthy check allows fallback if it's empty
    content = content.replace(/review\.guestAvatar \? <img/g, 'getValidImageUrl(review.guestAvatar) ? <img');
    fs.writeFileSync(file, content);
    console.log('Patched ReviewsSection');
  }
} catch (e) { console.error('Error ReviewsSection', e); }

// 6. StickyHeader.tsx
try {
  let file = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/StickyHeader.tsx';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = addImport(content);
    content = content.replace(/src=\{user\.image_url\}/g, 'src={getValidImageUrl(user.image_url) || ' + FALLBACK + '}');
    fs.writeFileSync(file, content);
    console.log('Patched StickyHeader');
  }
} catch (e) { console.error('Error StickyHeader', e); }

