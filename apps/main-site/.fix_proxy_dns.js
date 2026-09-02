const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/proxy.ts';

let content = fs.readFileSync(path, 'utf8');

const regex = /const protocol = request\.headers\.get\("x-forwarded-proto"\) \|\| "http";[\s\n]+const hostUrl = `\$\{protocol\}:\/\/\$\{request\.headers\.get\("host"\)\}`;/;

const replacement = `const hostHeader = request.headers.get("host") || "";
      const isLocalhost = hostHeader.includes("localhost");
      const portMatch = hostHeader.match(/:(\\d+)$/);
      const port = portMatch ? \`:\${portMatch[1]}\` : "";
      const fetchHost = isLocalhost ? \`127.0.0.1\${port}\` : hostHeader;
      const protocol = isLocalhost ? "http" : (request.headers.get("x-forwarded-proto") || "https");
      const hostUrl = \`\${protocol}://\${fetchHost}\`;`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated proxy.ts localhost resolution');
} else {
    console.log('Target regex not found in proxy.ts');
}
