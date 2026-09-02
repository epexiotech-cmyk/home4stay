const http = require('http');
const req = http.request('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  const cookies = res.headers['set-cookie'];
  console.log('Cookies:', cookies);
  if (!cookies) return;
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
  const req2 = http.request('http://localhost:3000/api/admin/database?model=User', {
    headers: { 'Cookie': cookieStr }
  }, (res2) => {
    console.log('API Status:', res2.statusCode);
  });
  req2.end();
});
req.write(JSON.stringify({email:'super_admin@home4stay.homes', password:'Admin123!'}));
req.end();
