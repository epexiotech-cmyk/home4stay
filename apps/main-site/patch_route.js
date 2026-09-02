const fs = require('fs');
const file = 'src/app/api/admin/database/route.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('const token = request.cookies.get(" token\)?.value;',
