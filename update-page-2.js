const fs = require('fs');
const file = 'apps/main-site/src/app/(portal)/admin/database/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Move useEffect below fetchModels
const effect = `  useEffect(() => {
    fetchModels();
  }, []);

`;
content = content.replace(effect, '');
const handleModelSelectEnd = `  const handleModelSelect = (modelName: string) => {
    setRecords([]);
    fetchRecords(modelName, 1);
  };`;
content = content.replace(handleModelSelectEnd, handleModelSelectEnd + '\n\n' + effect);

// Remove err
content = content.replace(/catch \(err\)/g, 'catch');

fs.writeFileSync(file, content);
console.log('Done page.tsx 2 patch');
