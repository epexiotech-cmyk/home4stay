import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain");

  if (!subdomain) {
    return NextResponse.json({ error: "Missing subdomain parameter" }, { status: 400 });
  }

  try {
    const property = await prisma.property.findUnique({
      where: { subdomain },
      select: { slug: true }
    });

    if (!property) {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
    }

    return NextResponse.json({ slug: property.slug });
  } catch (error) {
    console.error("Error resolving subdomain:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
