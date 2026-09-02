const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/prisma/schema.prisma';

let content = fs.readFileSync(path, 'utf8');

const target = `  slug        String    @unique
  title       String`;

const replacement = `  slug        String    @unique
  subdomain   String?   @unique @map("subdomain")
  title       String`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully added subdomain to schema.prisma');
} else {
    console.log('Target string not found in schema.prisma');
}
