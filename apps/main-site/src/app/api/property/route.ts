import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { z } from "zod";
import { logger } from "@/lib/observability/logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

const PropertySchema = z.object({
  name: z.string().min(3).max(100),
  location: z.string().min(3),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // 1. AUTHENTICATION (Hard Gate)
    const token = request.cookies.get('access-token')?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let user: { username: string; role: string } | null = null;
    try {
      const { payload } = await jwtVerify(token, encodedSecret, { issuer: "home4stay", audience: "web" }) as { payload: { username: string; role: string } };
      user = payload;
      if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // 2. INPUT VALIDATION
    const body = await request.json();
    const validation = PropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }

    const { name, location, price } = validation.data;

    // 3. DATA PROCESSING (MOCKED)
    const finalSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    await logger({
      level: 'info',
      event: 'CREATE_PROPERTY',
      message: `Property ${name} in ${location} (₹${price}) created by ${user.username}`,
      userId: user.username,
      ip,
      requestId,
      route: '/api/property'
    });

    return NextResponse.json({ success: true, slug: finalSlug }, { status: 201 });
  } catch (err) {
    await logger({
      level: 'error',
      event: 'API_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error',
      ip,
      requestId,
      route: '/api/property'
    });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
