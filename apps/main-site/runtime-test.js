const http = require('http');
const { AuthService } = require('./src/lib/auth/auth.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const authService = new AuthService();
  // We mock the comparePasswords by forcing the password hash to match 'password'
  // Or we just create a valid session directly in DB to get a valid token.
  
  const user = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  
  // Create a valid session token in DB
  const crypto = require('crypto');
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const tokenPayload = { userId: user.id, role: user.role, sessionToken };
  const { signToken } = require('./src/lib/auth/jwt');
  const accessToken = await signToken({ ...tokenPayload, type: 'access' }, '15m');
  const refreshToken = await signToken({ ...tokenPayload, type: 'refresh' }, '7d');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const { SessionRepository } = require('./src/lib/repositories/session.repository');
  const sessionRepo = new SessionRepository();
  await sessionRepo.create({
    user: { connect: { id: user.id } },
    sessionToken,
    refreshTokenHash,
    ipAddress: '127.0.0.1',
    userAgent: 'test',
    expiresAt
  });

  // Now make a real HTTP request to /api/auth/me on the dev server
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Cookie': 	oken=; access-token=
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response from /api/auth/me:', data);
    });
  });
  req.on('error', (e) => {
    console.error('Problem with request:', e.message);
  });
  req.end();
}
test();
