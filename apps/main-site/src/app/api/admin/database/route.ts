import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { PrismaClient, Prisma } from "@prisma/client";
import { sanitizeDatabaseRecord } from "@/lib/database/sanitizer";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication & Role
    const token = request.cookies.get("access-token")?.value || request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    // 2. Extract Query Params
    const url = new URL(request.url);
    const modelName = url.searchParams.get("model");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const models = Prisma.dmmf.datamodel.models;

    // 3. Return Schema Metadata if no model is provided
    if (!modelName) {
      return NextResponse.json({
        success: true,
        models: models.map(m => ({
          name: m.name,
          dbName: m.dbName || m.name,
          fields: m.fields.map(f => ({ name: f.name, type: f.type, isId: f.isId }))
        }))
      });
    }

    // 4. Validate Model Name
    const modelMeta = models.find(m => m.name === modelName);
    if (!modelMeta) {
      return NextResponse.json({ error: "Invalid model name" }, { status: 400 });
    }

    // 5. Query the database
    const prismaDelegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[prismaDelegateName];
    
    if (!delegate) {
      return NextResponse.json({ error: "Database delegate not found" }, { status: 500 });
    }

    const [records, total] = await Promise.all([
      delegate.findMany({
        skip,
        take: limit,
      }),
      delegate.count()
    ]);

    // 6. Sanitize Records
    const sanitizedRecords = sanitizeDatabaseRecord(records);

    return NextResponse.json({
      success: true,
      data: sanitizedRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Database API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
