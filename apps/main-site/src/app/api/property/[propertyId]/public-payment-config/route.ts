import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await props.params;

    // Fetch the active payment configuration for this property
    const activeConfig = await prisma.propertyPaymentConfig.findFirst({
      where: {
        propertyId,
        isActive: true
      }
    });

    if (!activeConfig) {
      return NextResponse.json({
        success: true,
        active: false,
        provider: null
      });
    }

    // Expose only public routing details (Never expose gatewaySecret, key, or webhookSecret)
    return NextResponse.json({
      success: true,
      active: true,
      provider: activeConfig.provider,
      upiId: activeConfig.upiId,
      merchantName: activeConfig.merchantName
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Public payment config lookup failure:", message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
