import fs from 'fs';
import path from 'path';

const file = 'src/lib/database/prisma.ts';
const filePath = path.join('d:/Epexio Project/home4stay/apps/main-site', file);
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = 180; i < 200; i++) {
  const line = lines[i];
  if (line === undefined) continue;
  console.log(`Line ${i + 1}: ${line}`);
  let hex = '';
  for (let j = 0; j < line.length; j++) {
    hex += line.charCodeAt(j).toString(16).padStart(2, '0') + ' ';
  }
  console.log(`  Hex: ${hex}`);
}
