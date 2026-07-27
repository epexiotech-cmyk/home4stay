const fs = require('fs');
const path = require('path');
const libDir = 'apps/mobile-app/lib';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.dart')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(libDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // fix print
  content = content.replace(/\bprint\(/g, 'debugPrint(');
  if (content !== originalContent && !content.includes('import \'package:flutter/foundation.dart\';')) {
    const importStr = 'import \'package:flutter/foundation.dart\';\n';
    if (!content.includes(importStr)) {
      content = importStr + content;
    }
  }

  // fix empty catch
  content = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{\s*\}/g, 'catch ($1) { /* ignored */ }');
  content = content.replace(/catch\s*\{\s*\}/g, 'catch (e) { /* ignored */ }');

  // fix withOpacity
  content = content.replace(/\.withOpacity\(\s*([0-9]*\.?[0-9]+)\s*\)/g, '.withValues(alpha: $1)');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
