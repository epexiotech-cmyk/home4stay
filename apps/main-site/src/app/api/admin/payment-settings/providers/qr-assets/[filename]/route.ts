import { NextRequest, NextResponse } from "next/server";
import { LocalStorageDriver } from "@/lib/server/storageDriver";
import path from "path";

const assetsStorage = new LocalStorageDriver(
  path.join(process.cwd(), "storage", "payments", "assets")
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    try {
      const { stream, mimeType } = await assetsStorage.getFileStream(filename);
      
      const webStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk: any) => controller.enqueue(chunk));
          stream.on("end", () => controller.close());
          stream.on("error", (err: any) => controller.error(err));
        }
      });

      return new Response(webStream, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400" // Streamed QR configs can be cached for daily reuse
        }
      });

    } catch (err) {
      return NextResponse.json({ error: "QR asset not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("[ADMIN_QR_ASSETS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
