const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('Cattle@123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'Apurav.rural@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'Apurav.rural@gmail.com',
      name: 'Apurav',
      password: hashedPassword,
      role: 'PARTNER'
    }
  });
  console.log('User ready:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
