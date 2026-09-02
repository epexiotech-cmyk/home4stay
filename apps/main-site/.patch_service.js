const fs = require('fs');
const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/services/propertyService.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  public generateSlug(title: string): string {`;

const replacement = `  public async generateUniqueSubdomain(title: string): Promise<string> {
    const baseSubdomain = title
      .toLowerCase()
      .replace(/\\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    if (!baseSubdomain) {
      throw new Error("Invalid property title for subdomain generation");
    }

    let subdomain = baseSubdomain;
    let counter = 2;
    
    while (true) {
      const existing = await propertyRepository.findBySubdomain(subdomain);
      if (!existing) {
        return subdomain;
      }
      subdomain = \`\${baseSubdomain}-\${counter}\`;
      counter++;
    }
  }

  public generateSlug(title: string): string {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully added generateUniqueSubdomain');
} else {
    console.log('Target string not found');
}
