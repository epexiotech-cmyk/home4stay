const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/onboarding/layout.tsx';

let content = fs.readFileSync(path, 'utf8');

const target = `        const propertyUrl = \`/property/\${(draftData?.property?.slug || "not-found")}\`;
        
        if (res.ok) {
           await completeStep(activeStep.id);
           router.push(propertyUrl);
        } else {
           const json = await res.json();
           if (json.error?.message?.includes("already active") || json.status === "ACTIVE") {
              await completeStep(activeStep.id);
              router.push(propertyUrl);
           }`;

const replacement = `        let finalPropertyUrl = \`/property/\${(draftData?.property?.slug || "not-found")}\`;
        
        if (res.ok) {
           const json = await res.json();
           if (json.data && json.data.propertyUrl) {
             finalPropertyUrl = json.data.propertyUrl;
           }
           await completeStep(activeStep.id);
           window.location.href = finalPropertyUrl; // use window.location.href for external subdomain
        } else {
           const json = await res.json();
           if (json.data && json.data.propertyUrl) {
             finalPropertyUrl = json.data.propertyUrl;
           } else if (json.propertyUrl) {
             finalPropertyUrl = json.propertyUrl;
           }
           
           if (json.error?.message?.includes("already active") || json.status === "ACTIVE") {
              await completeStep(activeStep.id);
              window.location.href = finalPropertyUrl;
           }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated onboarding layout');
} else {
    console.log('Target string not found');
}
