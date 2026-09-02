import { SystemHealthService } from "@/lib/services/systemHealthService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";

export const GET = withErrorHandler(async () => {
  const result = await SystemHealthService.getReadinessStatus();
  return successResponse(result, { status: 200 });
});
