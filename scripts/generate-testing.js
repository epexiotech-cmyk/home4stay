const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SEED_ROUTES = [
  "/",
  "/admin/properties",
  "/admin/leads",
  "/admin/login"
];

let authCookies = '';
let csrfToken = '';

const routeStatus = []; 
const discoveredRoutes = new Set();
const queue = [...SEED_ROUTES];

async function login() {
  console.log('🔐 Attempting to login (CSRF-Aware)...');
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username: 'admin',
      password: '123456'
    });
    
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      authCookies = cookies.map(c => c.split(';')[0]).join('; ');
      
      // Extract CSRF token from cookie
      const csrfCookie = cookies.find(c => c.startsWith('csrf-token='));
      if (csrfCookie) {
        csrfToken = csrfCookie.split('=')[1].split(';')[0];
      }
      
      console.log('✅ JWT + CSRF Login Success!');
    }
  } catch (error) {
    console.error('❌ Login Failed:', error.response?.data?.error || error.message);
  }
}

async function crawl() {
  console.log('🚀 Starting Hardened QA Crawler...');
  
  await login();

  while (queue.length > 0) {
    const route = queue.shift();
    if (discoveredRoutes.has(route)) continue;

    discoveredRoutes.add(route);
    const url = `${BASE_URL}${route}`;
    console.log('🔍 Testing:', route);

    try {
      const response = await axios.get(url, {
        headers: {
          'Cookie': authCookies,
          'x-csrf-token': csrfToken // Pass CSRF token back
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      });

      const status = response.status;
      let notes = '';

      if (status === 200) {
        notes = 'Working';
        if (route.startsWith('/admin')) notes = 'Role: Admin';
        
        if (response.headers['content-type']?.includes('text/html')) {
          const $ = cheerio.load(response.data);
          $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/') && !href.startsWith('//')) {
              const cleanRoute = href.split('#')[0].split('?')[0];
              if (!discoveredRoutes.has(cleanRoute) && !queue.includes(cleanRoute)) {
                queue.push(cleanRoute);
              }
            }
          });
        }
      } else if (status >= 300 && status < 400) {
        notes = `Redirected to ${response.headers.location || 'unknown'}`;
      } else if (status === 404) {
        notes = 'Not Found';
      }

      routeStatus.push({
        route,
        status: status === 200 ? `✅ ${status}` : status < 400 ? `⚠️ ${status}` : `❌ ${status}`,
        notes
      });

    } catch (error) {
      console.error(`❌ Error testing ${route}:`, error.message);
      routeStatus.push({
        route,
        status: '❌ Error',
        notes: error.message
      });
    }
  }

  generateMarkdown();
}

function generateMarkdown() {
  const sortedStatus = routeStatus.sort((a, b) => a.route.localeCompare(b.route));
  
  const total = sortedStatus.length;
  const success = sortedStatus.filter(s => s.status.includes('✅')).length;
  const errors = sortedStatus.filter(s => s.status.includes('❌')).length;

  const content = `# Website Testing Routes (Hardened Auth)

## Base URL
${BASE_URL}

## Coverage Summary
- **Total Routes Discoveried**: ${total}
- **Success (200 OK)**: ${success}
- **Errors/Missing**: ${errors}

## Route Status (CSRF + Rate Limited)

| Route | Status | Notes |
|-------|--------|-------|
${sortedStatus.map(s => `| ${s.route} | ${s.status} | ${s.notes} |`).join('\n')}

## Full URLs List

${sortedStatus.map(s => `- ${BASE_URL}${s.route}`).join('\n')}
`;

  const outputPath = path.join(__dirname, '../testing.md');
  fs.writeFileSync(outputPath, content);
  console.log('✅ Updated testing.md (Hardened Auth) generated successfully!');
}

crawl();
