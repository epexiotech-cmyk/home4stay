
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const propertyId = '275d806a-f76f-4f2b-8cda-b7a25af83d23'; // ID from earlier
  
  const session = await prisma.onboardingSession.findFirst({
    where: { propertyId },
    include: { drafts: true }
  });
  
  if (!session) {
    console.log("No onboarding session found.");
    return;
  }
  
  console.log(JSON.stringify(session.drafts, null, 2));
}

inspect().catch(console.error).finally(() => process.exit(0));
