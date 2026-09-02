const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.property.findFirst({ where: { slug: 'rural-risk-fc46' }});
  if (p) {
     const s = await prisma.onboardingSession.findFirst({ where: { propertyId: p.id }});
     console.log("Session status:", s?.status, "Current Step:", s?.currentStep);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
