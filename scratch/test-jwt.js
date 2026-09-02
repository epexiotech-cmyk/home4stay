const { signToken, verifyToken } = require('./apps/main-site/src/lib/auth/jwt');

async function test() {
  process.env.JWT_SECRET = 'test_secret';
  const payload = { userId: '123', role: 'admin' };
  const token = await signToken(payload);
  console.log('Token signed:', token);
  
  const decoded = await verifyToken(token);
  console.log('Decoded payload:', decoded);
  
  if (decoded && decoded.jti) {
    console.log('✅ JTI present in token:', decoded.jti);
  } else {
    console.log('❌ JTI missing in token');
  }
}

test();
