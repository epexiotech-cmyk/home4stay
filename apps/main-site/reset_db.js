const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.property.updateMany({
    where: { slug: 'rural-risk-fc46' }, // The test property
    data: { 
       status: 'DRAFT',
       onboardingStatus: 'NOT_STARTED'
    }
  });
  
  await prisma.propertyActivation.deleteMany({
    where: { property: { slug: 'rural-risk-fc46' } }
  });
  
  console.log("Reset property");
}

main().catch(console.error).finally(() => prisma.$disconnect());
