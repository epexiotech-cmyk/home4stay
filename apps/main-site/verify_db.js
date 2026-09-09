
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const propertyId = 'shivay-resort-101'; // Default test property, or we can just fetch the first property
  const property = await prisma.property.findFirst({
    include: {
      rooms: true,
      experiences: true,
      mealPlans: true,
      pricing: true,
      offers: true,
      pageContent: {
        include: { sections: true }
      },
      policies: true,
      amenities: true,
      mediaAssets: true,
      onboardingSession: {
        include: { drafts: true, progress: true }
      }
    }
  });

  console.log(JSON.stringify(property, null, 2));
}

verify().catch(console.error).finally(() => process.exit(0));
