const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
async function run() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'super_admin@home4stay.homes' },
    update: { password: hashedPassword, role: 'super_admin' },
    create: {
      email: 'super_admin@home4stay.homes',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'super_admin'
    }
  });
  console.log('Super Admin ready:', user.email);
}
run().finally(() => prisma.$disconnect());
