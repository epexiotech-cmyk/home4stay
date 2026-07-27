import { NextRequest } from "next/server";
import { propertyInventoryService } from "@/lib/services/propertyInventoryService";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const availabilityQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);

  const { startDate, endDate } = availabilityQuerySchema.parse({
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
  });

  const availability = await propertyInventoryService.getRoomAvailability(roomId, startDate, endDate);
  return successResponse(availability);
});
