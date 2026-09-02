const fs = require('fs');
const file = './src/components/layouts/AdminLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{userRole === "super_admin" && (', '');
content = content.replace('            </Link>\n          )}', '            </Link>');

fs.writeFileSync(file, content);
