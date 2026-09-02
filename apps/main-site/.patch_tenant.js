const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/tenantUtils.ts';

let content = fs.readFileSync(path, 'utf8');

const regex = /export async function getPropertyBySlug\(slug: string\) \{[\s\S]*?\}[\s\n]*\/\*\*/;

const replacement = `export async function getPropertyBySlug(slug: string) {
  try {
    const exact = await prisma.property.findUnique({
      where: { slug },
    });
    return exact;
  } catch (error) {
    console.error(\`Failed to retrieve property by slug \${slug}:\`, error);
    return null;
  }
}

/**
 * getPropertyBySubdomain
 * Retrieves a property safely by subdomain.
 */
export async function getPropertyBySubdomain(subdomain: string) {
  try {
    const exact = await prisma.property.findUnique({
      where: { subdomain },
    });
    return exact;
  } catch (error) {
    console.error(\`Failed to retrieve property by subdomain \${subdomain}:\`, error);
    return null;
  }
}

/**`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated tenantUtils.ts');
} else {
    console.log('Target regex not found in tenantUtils.ts');
}
