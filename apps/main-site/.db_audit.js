const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== EXACT PROPERTY LOOKUP ===");
  const p = await prisma.property.findUnique({where: {slug: 'rural-risk-fc46'}});
  console.log(JSON.stringify(p, null, 2));

  console.log("\n=== SEARCH FOR 'ruralrisk' ===");
  const props = await prisma.property.findMany({
    where: { OR: [{ slug: { contains: 'ruralrisk' } }, { title: { contains: 'ruralrisk' } }] }
  });
  console.log(JSON.stringify(props, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
