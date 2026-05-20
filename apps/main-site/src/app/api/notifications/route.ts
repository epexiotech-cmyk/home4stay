import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Retrieves notifications list and unread counts for the active authenticated session
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch unread notifications count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: auth.userId,
        isRead: false
      }
    });

    // 2. Fetch recent 50 notifications
    const list = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: list
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[NotificationsAPI] Failed to fetch notifications:", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Marks specific notification or all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Mark all notifications for this user as read
      await prisma.notification.updateMany({
        where: {
          userId: auth.userId,
          isRead: false
        },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    // Secure boundary check: Make sure notification belongs to caller
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== auth.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, message: "Notification marked as read." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[NotificationsAPI] Failed to update notifications:", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
