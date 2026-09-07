const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/onboarding/readiness.ts';
let content = fs.readFileSync(path, 'utf8');
const search = `    const isReady = true; // patched for testing`;
const replace = `    const isReady = blockingIssues.length === 0;`;
if(content.includes(search)) {
  fs.writeFileSync(path, content.replace(search, replace));
  console.log('Patched readiness');
} else {
  console.log('Not found');
}
