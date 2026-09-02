const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { role: 'super_admin' } });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
