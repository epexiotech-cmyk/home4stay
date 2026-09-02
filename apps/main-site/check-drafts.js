const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drafts = await prisma.wizardDraft.findMany({
    where: { userId: { not: null } }
  });
  console.log("Drafts:");
  for (const d of drafts) {
     const user = await prisma.user.findUnique({where:{id:d.userId}});
     console.log(`- ${user?.email}: ${Object.keys(d.data || {})}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
