const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/BrandedHero.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('DEFAULT_FALLBACK_IMAGE')) {
  content = content.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/tenant/contextResolver";'
  );
}

const targetImage = `<Image
          src={image}
          alt={name}
          fill
          priority
          className="object-cover scale-105 animate-slow-zoom"
        />`;

const replacementImage = `const safeImage = getValidImageUrl(image) || DEFAULT_FALLBACK_IMAGE;

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* 1. Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={safeImage}
          alt={name || "Property hero"}
          fill
          priority
          className="object-cover scale-105 animate-slow-zoom"
        />`;

const regexHero = /return \(\s*<section className="relative h-screen min-h-\[700px\] w-full overflow-hidden">\s*{\/\* 1\. Cinematic Background Image \*\/}\s*<div className="absolute inset-0 z-0">\s*<Image\s*src={image}\s*alt={name}\s*fill\s*priority\s*className="object-cover scale-105 animate-slow-zoom"\s*\/>/m;

if (regexHero.test(content)) {
  content = content.replace(regexHero, replacementImage);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated BrandedHero.tsx');
} else {
  console.log('Target string not found in BrandedHero.tsx');
}
