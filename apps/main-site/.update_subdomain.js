const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'rural-risk-fc46' }
  });
  
  if (property) {
    await prisma.property.update({
      where: { id: property.id },
      data: { subdomain: 'ruralrisk' }
    });
    console.log('Successfully updated subdomain for rural-risk-fc46');
  } else {
    console.log('Property rural-risk-fc46 not found');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
