const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const drafts = await prisma.wizardDraft.findMany({
    where: { stepId: 'gallery' }
  });
  console.log("GALLERY DRAFTS:", JSON.stringify(drafts, null, 2));
  process.exit(0);
}

run().catch(console.error);
