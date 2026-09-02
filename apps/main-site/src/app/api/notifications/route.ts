import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { NotificationService } from "@/lib/services/notificationService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Retrieves notifications list and unread counts for the active authenticated session
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const result = await NotificationService.getUserNotifications(auth.userId);

  return successResponse({
    unreadCount: result.unreadCount,
    notifications: result.notifications
  });
});

/**
 * POST /api/notifications
 * Marks specific notification or all notifications as read
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    if (auth.response) return auth.response;
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const body = await request.json();
  const { notificationId, markAll } = body;

  if (markAll) {
    const result = await NotificationService.markAllAsRead(auth.userId);
    return successResponse(result);
  }

  const result = await NotificationService.markAsRead(auth.userId, notificationId);
  return successResponse(result);
});
