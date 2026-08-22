const fs = require('fs');
const file = '/home/apurv_patel/home4stay/apps/main-site/src/context/OnboardingContext.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /console\.error\(\`Failed to sync draft for step \$\{stepId\}\`\);/g,
  'const errorText = await res.text().catch(() => ""); console.error(`Failed to sync draft for step ${stepId}:`, res.status, errorText);'
);
fs.writeFileSync(file, code);
