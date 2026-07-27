import { NextResponse } from 'next/server';
import { propertyService } from '@/lib/services/propertyService';
import { updatePropertySchema } from '@/lib/validators/property.validators';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const property = await propertyService.getPropertyById(id);

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error('Error fetching property:', error);
    if (error.message === 'Property not found') {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const body = await req.json();
    const validatedData = updatePropertySchema.parse(body);

    const updatedProperty = await propertyService.updateProperty(id, validatedData);

    return NextResponse.json({ success: true, data: updatedProperty });
  } catch (error: any) {
    console.error('Error updating property:', error);

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

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    await propertyService.deleteProperty(id);

    return NextResponse.json({ success: true, message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    if (error.message === 'Property not found') {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    if (error.message === 'Cannot delete a live property. Suspend it first.') {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
