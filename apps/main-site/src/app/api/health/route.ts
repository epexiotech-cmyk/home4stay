import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getRedis } from "@/lib/server/redis";

export async function GET() {
  const status = {
    database: "down",
    redis: "down",
    timestamp: new Date().toISOString()
  };

  let hasError = false;

  // 1. Validate Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = "up";
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Health probe database failure:", errorMessage);
    hasError = true;
  }

  // 2. Validate Redis connectivity
  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      status.redis = "up";
    } else {
      hasError = true;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Health probe Redis failure:", errorMessage);
    hasError = true;
  }

  const statusCode = hasError ? 503 : 200;
  return NextResponse.json(
    {
      success: !hasError,
      status,
      uptime: process.uptime()
    },
    { status: statusCode }
  );
}
