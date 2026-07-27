import { NextResponse } from 'next/server';
import { propertyService } from '@/lib/services/propertyService';
import { createFullPropertySchema } from '@/lib/validators/property.validators';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate payload
    const validatedData = createFullPropertySchema.parse(body);

    // Call service layer
    const newProperty = await propertyService.createProperty(validatedData);

    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);

    // Handle Zod errors specifically if needed, but generic catch for now
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Validation Error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
