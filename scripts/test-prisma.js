const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking if Prisma client query engine supports new fields...");
    
    // Attempt a findFirst filtering by our new fields
    const booking = await prisma.booking.findFirst({
      where: {
        paymentStatus: "PENDING",
        paymentMode: null,
        paymentReference: null,
        utrNumber: null
      },
      select: {
        id: true,
        amount: true
      }
    });

    console.log("SUCCESS! Prisma Client accepts all new database columns! Booking query result:", booking);
  } catch (err) {
    console.error("❌ FAILURE! Prisma Client does not recognize fields:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
