const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'partner' }});
  if (user) {
    console.log('Found partner user:', user.email);
  } else {
    console.log('No partner user found');
  }
}
main().catch(console.error).finally(() => prisma.());
