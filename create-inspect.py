import os

script = """
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
"""

with open('/home/apurv_patel/home4stay/apps/main-site/inspect_drafts.js', 'w') as f:
    f.write(script)

print("Created inspect_drafts.js")
