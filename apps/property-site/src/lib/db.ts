import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Use global variable to prevent hot-reloading from opening too many DB connections
  const globalNode = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  if (!globalNode.prisma) {
    globalNode.prisma = new PrismaClient();
  }
  prisma = globalNode.prisma;
}

export { prisma };

export async function getPropertySubscriptionState(slug: string) {
  try {
    const dbProperty = await prisma.property.findUnique({
      where: { slug },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!dbProperty) {
      return null;
    }

    const latestSub = dbProperty.subscriptions[0] || null;
    return {
      id: dbProperty.id,
      title: dbProperty.title,
      status: dbProperty.status, // LIVE, SUSPENDED, DRAFT, etc.
      subscriptionStatus: latestSub ? latestSub.status : "INACTIVE",
      expiresAt: latestSub ? latestSub.expiresAt : null
    };
  } catch (error) {
    console.error("Failed to fetch property subscription state in property-site:", error);
    return null;
  }
}
