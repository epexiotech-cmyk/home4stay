const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({
     where: { email: 'Apurav.rural@gmail.com' },
     include: { properties: true }
  });
  console.log("User properties:", u.properties.map(x => x.slug + ':' + x.onboardingStatus));
}

main().catch(console.error).finally(() => prisma.$disconnect());
