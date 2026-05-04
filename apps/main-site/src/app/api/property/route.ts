import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/observability/logger";
import { requireRole } from "@/lib/auth/rbac";

const PropertySchema = z.object({
  name: z.string().min(3).max(100),
  location: z.string().min(3),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // 1. RBAC Check (Admin Only)
    const { authorized, response, userId } = await requireRole(request, ["admin", "super_admin"]);
    
    if (!authorized) return response!;

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
      message: `Property ${name} in ${location} (₹${price}) created by user ${userId}`,
      userId: userId!,
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
