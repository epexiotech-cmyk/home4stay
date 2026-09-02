import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const email = "owner@shivay.com";
  const password = "Home@4971";

  try {
    console.log("1. Finding user by email:", email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log("User found:", user);

    if (!user) {
      console.log("No user found.");
      return;
    }

    // Attempt bcrypt check
    console.log("2. Comparing password hash...");
    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValid);

    // Attempt property mapping
    console.log("3. Mapping property...");
    const property = await prisma.property.findFirst({
      where: { ownerId: user.id }
    });
    console.log("Property mapped:", property);

  } catch (err) {
    console.error("❌ Diagnostic run failed with error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
