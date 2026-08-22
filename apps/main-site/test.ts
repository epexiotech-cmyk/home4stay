import { PartnerService } from './src/lib/services/partnerService';
import { prisma } from './src/lib/database/prisma';

async function run() {
  try {
    const prop = await prisma.property.findFirst();
    if (!prop) { console.log('no prop'); return; }
    await PartnerService.updateOnboardingSession(prop.id, { stepId: 'property', data: { title: 'test' }, currentStep: 'property' });
    console.log('Success!');
  } catch(e) {
    console.error('ERROR OCCURRED:', e);
  }
}
run();
