import { NextRequest } from "next/server";
import { eventBroadcaster } from "@/modules/payments/services/eventBroadcaster";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingId = searchParams.get("bookingId");

  // Authentication & Security Boundary Check
  let isAuthorized = false;
  let authorizedPropertyIds: string[] = [];

  const auth = await requireAuth(request);
  if (auth.authorized && auth.userId) {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId }
    });
    if (user) {
      isAuthorized = true;
      // Fetch properties the host user has access to
      if (["owner", "manager", "partner", "receptionist", "billing"].includes(user.role)) {
        const accesses = await prisma.propertyUserAccess.findMany({
          where: { userId: user.id }
        });
        authorizedPropertyIds = accesses.map(a => a.propertyId);
      } else if (["admin", "super_admin"].includes(user.role)) {
        // Administrative roles have unbounded access
        const props = await prisma.property.findMany({ select: { id: true } });
        authorizedPropertyIds = props.map(p => p.id);
      }
    }
  }

  // Define HTTP headers for Server-Sent Events (SSE)
  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  const encoder = new TextEncoder();

  // Create ReadableStream to stream real-time events to the browser
  const stream = new ReadableStream({
    start(controller) {
      // Send initial handshake success packet
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ connected: true, timestamp: new Date().toISOString() })}\n\n`));

      // Keep-Alive interval to prevent load-balancers or routers from terminating idle connections
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive pulse\n\n"));
        } catch {
          clearInterval(keepAliveInterval);
        }
      }, 15000);

      // Subscribe to global in-memory broadcaster
      const unsubscribe = eventBroadcaster.subscribe(({ type, payload }) => {
        try {
          let shouldPush = false;

          // Guest Checkout Stream Validation
          if (bookingId && payload.bookingId === bookingId) {
            shouldPush = true;
          }

          // Owner Dashboard Stream Validation (Multi-Tenant Isolation)
          if (isAuthorized && !bookingId) {
            if (payload.propertyId && authorizedPropertyIds.includes(payload.propertyId)) {
              shouldPush = true;
            }
          }

          if (shouldPush) {
            const data = JSON.stringify({ type, ...payload });
            controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
          }
        } catch (err) {
          console.error("[RealtimeSSE] Failed to stream message packet", err);
          unsubscribe();
          clearInterval(keepAliveInterval);
          controller.close();
        }
      });

      // Cleanup subscription on stream close / abort
      request.signal.addEventListener("abort", () => {
        console.log("[RealtimeSSE] Client connection closed or aborted.");
        unsubscribe();
        clearInterval(keepAliveInterval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    }
  });

  return new Response(stream, { headers: responseHeaders });
}
