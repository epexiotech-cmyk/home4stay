import { NextRequest } from "next/server";
import { propertyInventoryService } from "@/lib/services/propertyInventoryService";
import { requireRole } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const inventoryParamSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

const updateRoomInventorySchema = z.object({
  newCount: z.number().int().min(0, "Inventory count cannot be negative"),
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const resolvedParams = await params;
  const { roomId } = inventoryParamSchema.parse(resolvedParams);

  const body = await request.json();
  const { newCount } = updateRoomInventorySchema.parse(body);

  const updatedInventory = await propertyInventoryService.syncRoomInventory(roomId, newCount);
  return successResponse(updatedInventory);
});
