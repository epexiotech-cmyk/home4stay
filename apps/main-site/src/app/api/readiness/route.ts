import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    // A quick lightweight query check to ensure the engine is fully initialized and operational
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      ready: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Readiness check failure:", errorMessage);
    return NextResponse.json({
      ready: false,
      error: "Service is booting or connection pools are exhausted."
    }, { status: 503 });
  }
}
