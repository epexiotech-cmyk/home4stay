const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/proxy.ts';

let content = fs.readFileSync(path, 'utf8');

const regex = /if \(subdomain && subdomain !== 'www'[^}]+\}[^}]+\}/;

const replacement = `if (subdomain && subdomain !== 'www' && !url.pathname.startsWith(\`/api/\`) && !url.pathname.startsWith(\`/admin\`) && !url.pathname.startsWith(\`/partner\`) && !url.pathname.startsWith(\`/images\`) && !url.pathname.startsWith(\`/property/\`)) {
    try {
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const hostUrl = \`\${protocol}://\${request.headers.get("host")}\`;
      const resolveUrl = new URL(\`/api/edge/resolve-subdomain?subdomain=\${subdomain}\`, hostUrl);
      const resolveRes = await fetch(resolveUrl.toString(), { cache: "no-store" });
      if (resolveRes.ok) {
        const { slug } = await resolveRes.json();
        if (slug) {
          url.pathname = \`/property/\${slug}\${url.pathname === '/' ? '' : url.pathname}\`;
          response = NextResponse.rewrite(url);
        } else {
          url.pathname = \`/property/not-found\`;
          response = NextResponse.rewrite(url);
        }
      } else {
        url.pathname = \`/property/not-found\`;
        response = NextResponse.rewrite(url);
      }
    } catch (err) {
      console.error("Subdomain resolve error:", err);
      url.pathname = \`/property/not-found\`;
      response = NextResponse.rewrite(url);
    }
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated proxy.ts via regex');
