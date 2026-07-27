import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { realtimeService } from "@/lib/services/realtimeService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingId = searchParams.get("bookingId");

  const auth = await requireAuth(request);
  const userId = auth.authorized ? auth.userId || null : null;

  const stream = await realtimeService.createEventStream(userId, bookingId, request.signal);

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  return new Response(stream, { headers: responseHeaders });
}
