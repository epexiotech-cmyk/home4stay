import { NextRequest } from 'next/server';
import { propertyService } from '@/lib/services/propertyService';
import { createFullPropertySchema } from '@/lib/validators/property.validators';
import { withErrorHandler } from '@/lib/errors/handler';
import { successResponse } from '@/lib/utils/apiResponse';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = createFullPropertySchema.parse(body);

  const newProperty = await propertyService.createProperty(validatedData);
  return successResponse(newProperty, { status: 201 });
});
