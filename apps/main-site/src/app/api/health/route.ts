import { SystemHealthService } from "@/lib/services/systemHealthService";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler, AppError } from "@/lib/errors/handler";

export const GET = withErrorHandler(async () => {
  const result = await SystemHealthService.getHealthStatus();
  
  if (!result.success) {
    throw new AppError("Health Check Failed", 503, "UNAVAILABLE");
  }

  return successResponse(result, { status: 200 });
});
