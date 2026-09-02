import fs from 'fs';
import path from 'path';

const files = [
  'src/context/BookingContext.tsx',
  'src/lib/database/prisma.ts'
];

files.forEach(file => {
  const filePath = path.join('d:/Epexio Project/home4stay/apps/main-site', file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    console.log(`File: ${file}`);
    console.log(`  Braces: {:${openBraces}, }:${closeBraces} (Diff: ${openBraces - closeBraces})`);
    console.log(`  Parens: (:${openParens}, ):${closeParens} (Diff: ${openParens - closeParens})`);
  } catch (e) {
    console.log(`Error reading ${file}: ${e.message}`);
  }
});
