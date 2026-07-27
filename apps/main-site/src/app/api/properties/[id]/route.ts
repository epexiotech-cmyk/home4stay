import { NextRequest } from 'next/server';
import { propertyService } from '@/lib/services/propertyService';
import { updatePropertySchema } from '@/lib/validators/property.validators';
import { withErrorHandler, AppError } from '@/lib/errors/handler';
import { successResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const GET = withErrorHandler(async (
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params;
  const { id } = idParamSchema.parse(resolvedParams);

  const property = await propertyService.getPropertyById(id);
  if (!property) throw new AppError("Property not found", 404, "NOT_FOUND");
  return successResponse(property);
});

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params;
  const { id } = idParamSchema.parse(resolvedParams);

  const body = await request.json();
  const validatedData = updatePropertySchema.parse(body);

  const updatedProperty = await propertyService.updateProperty(id, validatedData);
  return successResponse(updatedProperty);
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params;
  const { id } = idParamSchema.parse(resolvedParams);

  await propertyService.deleteProperty(id);
  return successResponse({ success: true, message: 'Property deleted successfully' });
});
