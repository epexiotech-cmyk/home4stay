const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'rural-risk-fc46' },
    include: {
      pageContent: { include: { sections: true } },
      rooms: true,
      mediaAssets: true,
      amenities: true,
      experiences: true,
      owner: true
    }
  });

  console.log(JSON.stringify(property, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
