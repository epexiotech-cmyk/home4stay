import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { revokeJti } from "@/lib/auth/blacklist";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Logged out successfully" });
  
  // 1. EXTRACT AND REVOKE JTIs
  const cookies = request.cookies;
  const tokenNames = ["token", "access-token", "refresh-token"];
  
  for (const name of tokenNames) {
    const token = cookies.get(name)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.jti) {
        // Calculate remaining TTL or just use a safe default (e.g., 7 days for refresh tokens)
        // For simplicity and safety, we revoke with a 7-day TTL if it's a refresh token or large expiry
        const expiry = payload.exp ? (payload.exp as number) - Math.floor(Date.now() / 1000) : 3600;
        await revokeJti(payload.jti as string, Math.max(expiry, 60));
      }
      
      // Clear cookie
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/"
      });
    }
  }

  return response;
}
