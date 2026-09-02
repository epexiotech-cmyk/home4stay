require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  console.log("DB Role:", user.role, "| exact match:", user.role === 'super_admin');
}
check();
