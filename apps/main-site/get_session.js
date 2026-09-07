const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const session = await prisma.session.findFirst({
    where: { userId: '490d9ea4-6833-4130-9568-1efcd167d755', isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(session));
}
main().then(() => prisma['']());
