const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function run() {
  const user = await prisma.user.findFirst();
  const property = await prisma.property.findFirst({ where: { ownerId: user.id } });
  
  const sessionToken = "test_session_" + Date.now();
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken,
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: "127.0.0.1",
      userAgent: "Test",
      refreshTokenHash: Date.now().toString()
    }
  });

  const { SignJWT } = require('jose');
  const secret = new TextEncoder().encode('super_secret_home4stay_2026_jwt_key_change_me_in_prod');
  const jti = crypto.randomUUID();
  const token = await new SignJWT({
    userId: user.id,
    role: 'owner',
    propertyId: property.id,
    propertySlug: property.slug,
    sessionToken
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(jti)
    .setIssuer("home4stay")
    .setAudience("home4stay-users")
    .setExpirationTime('1h')
    .sign(secret);

  const res = await fetch("http://localhost:3000/api/partner/onboarding/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `access-token=${token}`
    },
    body: JSON.stringify({ 
      stepId: 'gallery', 
      data: [], 
      currentStep: 'gallery' 
    })
  });

  console.log("STATUS:", res.status);
  console.log("BODY:", await res.text());
  process.exit(0);
}

run().catch(console.error);
