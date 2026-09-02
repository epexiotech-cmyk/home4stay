const http = require('http');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  
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

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Cookie': 'token=' + accessToken + '; access-token=' + accessToken
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response from /api/auth/me:', data);
    });
  });
  req.end();
}
test();
