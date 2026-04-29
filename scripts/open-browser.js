const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { exec } = require('child_process');
const waitOn = require('wait-on');

const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

const opts = {
  resources: [url],
  timeout: 30000, // 30 seconds
};

console.log(`🚀 Waiting for server at ${url}...`);

waitOn(opts)
  .then(() => {
    console.log(`✅ Server is up! Opening browser...`);
    exec(`${start} ${url}`);
  })
  .catch((err) => {
    console.error(`❌ Error waiting for server:`, err);
    process.exit(1);
  });
