const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/app/api/partner/activation/route.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  // also mark property as published if it was in draft
  await prisma.property.update({
    where: { id: propertyId },
    data: { 
      status: "LIVE",
      onboardingStatus: "LIVE",
      publishedAt: new Date()
    }
  });

  return successResponse({
    status: activation.status,
    activatedAt: activation.activatedAt
  });`;

const replacement = `  // Ensure subdomain exists
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  let finalSubdomain = property?.subdomain;
  
  if (property && !finalSubdomain) {
    const { propertyService } = require("@/lib/services/propertyService");
    finalSubdomain = await propertyService.generateUniqueSubdomain(property.title);
  }

  // also mark property as published if it was in draft, and save subdomain
  await prisma.property.update({
    where: { id: propertyId },
    data: { 
      status: "LIVE",
      onboardingStatus: "LIVE",
      publishedAt: new Date(),
      ...(finalSubdomain ? { subdomain: finalSubdomain } : {})
    }
  });

  const propertyUrl = finalSubdomain ? \`http://\${finalSubdomain}.localhost:3000\` : \`/property/\${property?.slug}\`;

  return successResponse({
    status: activation.status,
    activatedAt: activation.activatedAt,
    propertyUrl
  });`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated activation route');
} else {
    console.log('Target string not found');
}
