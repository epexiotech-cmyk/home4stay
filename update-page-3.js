const fs = require('fs');
const file = 'apps/main-site/src/app/(portal)/admin/database/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

const effect = `  useEffect(() => {
    fetchModels();
  }, []);`;

const newEffect = `  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;

content = content.replace(effect, newEffect);
fs.writeFileSync(file, content);
console.log('Done page.tsx 3 patch');
