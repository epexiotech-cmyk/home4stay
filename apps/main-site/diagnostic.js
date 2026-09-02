const http = require('http');

async function runTest() {
  console.log('1. Logging in as Super Admin...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super_admin@home4stay.homes', password: 'Admin123!' })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    return;
  }

  const rawCookies = loginRes.headers.get('set-cookie');
  console.log('Received Cookies from Login:', rawCookies);

  // Extract cookies
  let cookiesToPass = '';
  if (rawCookies) {
    const cookiesArray = rawCookies.split(',').map(c => c.split(';')[0].trim());
    cookiesToPass = cookiesArray.join('; ');
  }
  console.log('Passing Cookies:', cookiesToPass);

  console.log('\n2. Hitting /api/admin/database ...');
  const dbRes = await fetch('http://localhost:3000/api/admin/database', {
    headers: { 'Cookie': cookiesToPass }
  });

  console.log('DB API Status:', dbRes.status);
  const dbText = await dbRes.text();
  console.log('DB API Body:', dbText);

  console.log('\n3. Hitting /api/auth/me ...');
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Cookie': cookiesToPass }
  });
  console.log('Me API Status:', meRes.status);
  const meText = await meRes.text();
  console.log('Me API Body:', meText);
}

runTest();
