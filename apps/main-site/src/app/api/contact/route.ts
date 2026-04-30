import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/observability/logger";

const ContactSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  property: z.string(),
  location: z.string(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const body = await request.json();

    // 1. Input Validation
    const validation = ContactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
    }

    const { name, phone, property, location } = validation.data;

    // 2. DATA PERSISTENCE (MOCKED)
    await logger({
      level: 'info',
      event: 'CONTACT_FORM_SUBMITTED',
      message: `Lead from ${name} (${phone}) for ${property} in ${location}`,
      ip,
      requestId,
      route: '/api/contact'
    });

    return NextResponse.json({ message: "Success", success: true }, { status: 200 });
  } catch (err) {
    await logger({
      level: 'error',
      event: 'API_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error',
      ip,
      requestId,
      route: '/api/contact'
    });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
