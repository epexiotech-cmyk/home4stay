const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.onboardingSession.findMany({
    include: { drafts: true, user: true }
  });
  console.log("Sessions:");
  for (const s of sessions) {
     console.log(`- ${s.user.email}: status=${s.status}, step=${s.currentStep}`);
     for (const d of s.drafts) {
        console.log(`   - draft step: ${d.stepId}, data keys: ${Object.keys(d.data || {})}`);
     }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
