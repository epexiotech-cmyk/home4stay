const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const property = await prisma.property.findUnique({
    where: { id: '275d806a-f76f-4f2b-8cda-b7a25af83d23' },
    include: { 
      onboardingSession: {
        include: {
          progress: true,
          drafts: true
        }
      }
    }
  });
  console.log(JSON.stringify(property, null, 2));
}
main().then(() => prisma.$disconnect());
