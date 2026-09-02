const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'rural-risk-fc46' },
    include: {
      policies: true,
      rooms: true,
      mealPlans: true,
      amenities: true,
      mediaAssets: true,
      owner: {
        include: { hostProfile: true }
      },
      pageContent: {
        include: { sections: true }
      }
    }
  });

  console.log(JSON.stringify(property, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
