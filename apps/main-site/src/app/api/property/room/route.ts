import { NextRequest } from "next/server";
import { propertyRoomService } from "@/lib/services/propertyRoomService";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { propertyRoomSchema } from "@/lib/validators/property.validators";

const getRoomsQuerySchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
});

const createRoomSchema = propertyRoomSchema;

const updateRoomSchema = z.object({
  id: z.string().min(1, "Missing ID"),
}).passthrough();

const deleteRoomQuerySchema = z.object({
  id: z.string().min(1, "Missing ID"),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const { propertyId } = getRoomsQuerySchema.parse({ propertyId: searchParams.get("propertyId") });

  // We allow customers to view rooms, but owners/managers require explicit property access validation
  const roleCheck = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager", "customer"]);
  if (!roleCheck.authorized) return roleCheck.response!;
  
  if (roleCheck.role !== "customer") {
    const access = await requirePropertyAccess(request, propertyId);
    if (!access.authorized) return access.response!;
  }

  const rooms = await propertyRoomService.getRooms(propertyId);
  return successResponse(rooms);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const data = createRoomSchema.parse(body);

  const access = await requirePropertyAccess(request, data.propertyId);
  if (!access.authorized) return access.response!;

  const room = await propertyRoomService.createRoom(data as any);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse(room, { status: 201 });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const body = await request.json();
  const { id, ...updateData } = updateRoomSchema.parse(body);

  const updatedRoom = await propertyRoomService.updateRoom(id, updateData as any);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse(updatedRoom);
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(request.url);
  const { id } = deleteRoomQuerySchema.parse({ id: searchParams.get("id") });

  await propertyRoomService.deleteRoom(id);
  try { revalidatePath("/property/[slug]", "page"); } catch (e) {}
  return successResponse({ success: true, deletedId: id });
});
