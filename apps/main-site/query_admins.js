const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { email: true }
  });
  console.log("ADMINS:", admins);
  
  const superAdmins = await prisma.user.findMany({
    where: { role: 'super_admin' },
    select: { email: true }
  });
  console.log("SUPER ADMINS:", superAdmins);
  
  process.exit(0);
}

run().catch(console.error);
