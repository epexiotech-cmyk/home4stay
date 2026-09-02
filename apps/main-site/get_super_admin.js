const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ where: { role: 'super_admin' } });
  console.log('Super Admins:', users.map(u => u.email));
}
run().finally(() => prisma.());
