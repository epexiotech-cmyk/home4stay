import { PartnerService } from './src/lib/services/partnerService';
import { prisma } from './src/lib/database/prisma';

async function runTests() {
  const propertyTitle = 'Royal Homes';
  
  const property = await prisma.property.findFirst({
    where: { title: propertyTitle }
  });

  if (!property) {
    console.error('Property not found');
    process.exit(1);
  }

  const propertyId = property.id;
  
  console.log(`\n--- Royal Homes AFTER FIX (Initial State) ---`);
  let session = await PartnerService.getOnboardingSession(propertyId);
  console.log(`DB Progress Records: ${session.progress.length} / 10`);

  console.log(`\n--- One-Step Completion Test ---`);
  await PartnerService.updateOnboardingSession(propertyId, {
    stepId: 'welcome',
    data: {},
    status: 'COMPLETED',
    currentStep: 'welcome'
  });
  
  session = await PartnerService.getOnboardingSession(propertyId);
  console.log(`DB Progress Records: ${session.progress.length} / 10`);
  console.log(`Steps Completed: ${session.progress.map(p => p.stepId).join(', ')}`);

  console.log(`\n--- Two-Step Completion Test ---`);
  await PartnerService.updateOnboardingSession(propertyId, {
    stepId: 'property',
    data: { title: 'Royal Homes Updated' },
    status: 'COMPLETED',
    currentStep: 'property'
  });
  
  session = await PartnerService.getOnboardingSession(propertyId);
  console.log(`DB Progress Records: ${session.progress.length} / 10`);
  console.log(`Steps Completed: ${session.progress.map(p => p.stepId).join(', ')}`);

  console.log(`\n--- Refresh / Logout / Login Test (Simulated by Re-fetching) ---`);
  session = await PartnerService.getOnboardingSession(propertyId);
  console.log(`DB Progress Records: ${session.progress.length} / 10`);
  
  // Cleanup test data to not leave database dirty
  console.log(`\n--- Cleaning up test records ---`);
  await prisma.propertySetupProgress.deleteMany({
    where: { session: { propertyId } }
  });
  await prisma.wizardDraft.deleteMany({
    where: { session: { propertyId } }
  });
  
  console.log("Cleanup complete");
}

runTests().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
