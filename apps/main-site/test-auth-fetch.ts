import { prisma } from './src/lib/database/prisma';
import { SignJWT } from 'jose';

async function run() {
  const property = await prisma.property.findFirst({ include: { owner: true } });
  if (!property) return;
  
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_me');
  const sessionToken = 'test-token-auth-' + Date.now();
  
  await prisma.session.create({
    data: {
      userId: property.ownerId,
      sessionToken: sessionToken,
      refreshTokenHash: 'hash-' + Date.now(),
      expiresAt: new Date(Date.now() + 86400000),
      isActive: true
    }
  });

  const jti = crypto.randomUUID();
  const token = await new SignJWT({
    userId: property.ownerId,
    role: property.owner.role,
    propertyId: property.id,
    propertySlug: property.slug,
    sessionToken,
    jti
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(jti)
    .setIssuer('home4stay')
    .setAudience('home4stay-users')
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const res = await fetch('http://localhost:3000/api/partner/onboarding/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'access-token=' + token
    },
    body: JSON.stringify({
      stepId: 'property',
      data: { title: 'Test from CLI', location: 'CLI', description: '', slug: 'cli', tagline: '' },
      currentStep: 'property'
    })
  });
  
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', await res.text());
}
run().catch(console.error);
