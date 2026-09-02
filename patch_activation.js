const fs = require('fs');
const file = '/home/apurv_patel/home4stay/apps/main-site/src/app/api/partner/activation/route.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
\  // also mark property as published if it was in draft
  await prisma.property.update({
    where: { id: propertyId },
    data: { 
      status: \" LIVE\\\,
