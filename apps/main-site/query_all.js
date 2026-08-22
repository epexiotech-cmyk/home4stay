const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log("ALL USERS:", users);
  
  process.exit(0);
}

run().catch(console.error);
