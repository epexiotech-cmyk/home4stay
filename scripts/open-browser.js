const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { exec } = require('child_process');
const waitOn = require('wait-on');

const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

const opts = {
  resources: [`tcp:127.0.0.1:3000`],
  timeout: 60000, // 60 seconds
};

console.log(`🚀 Waiting for server at ${url}...`);

waitOn(opts)
  .then(() => {
    console.log(`✅ Port 3000 is open. Waiting 2s for Next.js to be ready...`);
    setTimeout(() => {
      console.log(`🚀 Opening browser at ${url}...`);
      exec(`${start} ${url}`);
    }, 2000);
  })
  .catch((err) => {
    console.error(`❌ Error waiting for server:`, err);
    process.exit(1);
  });
