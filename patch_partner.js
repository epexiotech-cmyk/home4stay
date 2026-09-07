const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/repositories/partnerRepository.ts';
let content = fs.readFileSync(path, 'utf8');
const search = `      prisma.property.update({
        where: { id: propertyId },
        data: {
          status: "LIVE",
          publishedAt: new Date(),
          title: propertyDraft.title || undefined
        }
      }),`;
const replace = `      prisma.property.update({
        where: { id: propertyId },
        data: {
          status: "LIVE",
          publishedAt: new Date(),
          title: propertyDraft.title || undefined,
          onboardingStatus: "COMPLETED"
        }
      }),`;
if(content.includes(search)) {
  fs.writeFileSync(path, content.replace(search, replace));
  console.log('Patched');
} else {
  console.log('Not found');
}
