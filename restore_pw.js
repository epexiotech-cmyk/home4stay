const fs = require('fs');

const p1 = '/home/apurv_patel/home4stay/test-pw/run_pw.js';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/chromium/g, 'webkit');
fs.writeFileSync(p1, c1, 'utf8');

console.log('Restored Playwright back to webkit');
