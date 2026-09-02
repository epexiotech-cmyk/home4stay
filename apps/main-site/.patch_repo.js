const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/repositories/propertyRepository.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  async findById(id: string) {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        amenities: true,
        policies: true,
        pricing: true,
        rooms: true,
        experiences: true,
        mediaAssets: true,
      },
    });
  }`;

const replacement = `  async findById(id: string) {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        amenities: true,
        policies: true,
        pricing: true,
        rooms: true,
        experiences: true,
        mediaAssets: true,
      },
    });
  }

  async findBySubdomain(subdomain: string) {
    return await prisma.property.findUnique({
      where: { subdomain },
    });
  }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully added findBySubdomain to propertyRepository');
} else {
    console.log('Target string not found');
}
