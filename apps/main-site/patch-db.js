const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "Apurav.rural@gmail.com" } });
  const session = await prisma.onboardingSession.findFirst({ where: { propertyId: user.propertyId }, include: { drafts: true } });
  
  const propertyDraft = session.drafts.find(d => d.stepId === "property");
  const updatedData = { title: "Seaside Villa", slug: "seaside-villa", location: "Malibu", description: "Beautiful view" };
  
  if (propertyDraft) {
    await prisma.wizardDraft.update({
      where: { id: propertyDraft.id },
      data: { data: updatedData }
    });
    console.log("Patched property draft to Seaside Villa");
  } else {
    await prisma.wizardDraft.create({
      data: {
        onboardingSessionId: session.id,
        stepId: "property",
        data: updatedData
      }
    });
    console.log("Created property draft to Seaside Villa");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
