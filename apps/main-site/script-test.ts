import { prisma } from './src/lib/database/prisma';

async function test() {
  const property = await prisma.property.findFirst({
    include: { owner: true }
  });
  if (!property) { console.log('No property'); return; }

  const sessionToken = 'test-token-12345';
  
  await prisma.session.create({
    data: {
      userId: property.ownerId,
      sessionToken: sessionToken,
      refreshTokenHash: 'hash-12345',
      expiresAt: new Date(Date.now() + 86400000),
      isActive: true
    }
  });
  
  console.log('SESSION_CREATED:', sessionToken);
}
test().catch(console.error);
