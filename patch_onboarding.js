const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/context/OnboardingContext.tsx';
let content = fs.readFileSync(path, 'utf8');
const search = `      /*
      // Guard: Ensure preceding steps are completed
      const precedingSteps = ONBOARDING_STEPS.filter(s => s.order < currentStepConfig.order);
      const isAuthorized = precedingSteps.every(
        s => completedSteps.includes(s.id) || skippedSteps.includes(s.id)
      );

      console.log("[OnboardingContext Guard] Path:", pathname, "Preceding:", precedingSteps.map(s => s.id), "completedSteps:", completedSteps, "isAuthorized:", isAuthorized);

      if (!isAuthorized) {
        const firstIncomplete = ONBOARDING_STEPS.find(
          s => !completedSteps.includes(s.id) && !skippedSteps.includes(s.id)
        ) || ONBOARDING_STEPS[0];
        
        console.warn("[OnboardingContext Guard] Redirecting from", pathname, "to first incomplete:", firstIncomplete.route);
        router.replace(firstIncomplete.route);
      }
      */`;
const replace = `      // Guard: Ensure preceding steps are completed
      const precedingSteps = ONBOARDING_STEPS.filter(s => s.order < currentStepConfig.order);
      const isAuthorized = precedingSteps.every(
        s => completedSteps.includes(s.id) || skippedSteps.includes(s.id)
      );

      console.log("[OnboardingContext Guard] Path:", pathname, "Preceding:", precedingSteps.map(s => s.id), "completedSteps:", completedSteps, "isAuthorized:", isAuthorized);

      if (!isAuthorized) {
        const firstIncomplete = ONBOARDING_STEPS.find(
          s => !completedSteps.includes(s.id) && !skippedSteps.includes(s.id)
        ) || ONBOARDING_STEPS[0];
        
        console.warn("[OnboardingContext Guard] Redirecting from", pathname, "to first incomplete:", firstIncomplete.route);
        router.replace(firstIncomplete.route);
      }`;
if(content.includes(search)) {
  fs.writeFileSync(path, content.replace(search, replace));
  console.log('Patched');
} else {
  console.log('Not found');
}
