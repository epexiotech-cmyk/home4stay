content = """const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const user = await prisma.user.findFirst({
    where: { role: 'partner' },
    include: { propertyAccesses: true }
  });
  
  if (!user) {
    console.log('No partner user found!');
    process.exit(1);
  }
  
  const propertyId = (user.propertyAccesses && user.propertyAccesses.length > 0) ? user.propertyAccesses[0].propertyId : null;
  
  if (!propertyId) {
     console.log('User has no property attached!');
     process.exit(1);
  }
  
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
  
  console.log('USER_EMAIL=' + user.email);
  console.log('PROPERTY_ID=' + propertyId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
"""

from pathlib import Path
Path('/home/apurv_patel/home4stay/apps/main-site/test-setup.js').write_text(content, encoding='utf-8')
