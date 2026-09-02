const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'Apurav.rural@gmail.com' } });
  if (!user) { console.log('User not found.'); return; }
  console.log('User ID:', user.id);
  const drafts = await prisma.wizardDraft.findMany({ where: { userId: user.id } });
  console.log('Drafts found:', drafts.length);
  for (const draft of drafts) {
    console.log("Step:", draft.stepId);
    console.log("Data:", JSON.stringify(draft.draftData));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
