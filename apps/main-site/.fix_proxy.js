const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/proxy.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  }\`;
    response = NextResponse.rewrite(url);
  }`;

if (content.includes(target)) {
    content = content.replace(target, '');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully fixed proxy.ts');
} else {
    console.log('Target string not found');
}
