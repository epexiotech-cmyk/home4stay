const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { id: '490d9ea4-6833-4130-9568-1efcd167d755' },
    select: { email: true }
  });
  console.log(JSON.stringify(user));
}
main().then(() => prisma.$disconnect());
