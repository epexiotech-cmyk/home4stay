const fs = require('fs');
const file = 'apps/main-site/src/lib/database/sanitizer.ts';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace('export function sanitizeDatabaseRecord(record: unknown): any {', 'export function sanitizeDatabaseRecord(record: unknown): unknown {');
content = content.replace('const sanitized: Record<string, any> = {};', 'const sanitized: Record<string, unknown> = {};');

fs.writeFileSync(file, content);
console.log('Done sanitizer 2 patch');
