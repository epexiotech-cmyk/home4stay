import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { registerSchema } from "@/lib/validators/auth.validators";

const authService = new AuthService();

async function registerHandler(request: NextRequest) {
  const body = await request.json();
  
  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message); // Let withErrorHandler map to 400
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const newUser = await authService.registerCustomer(validation.data, ip, userAgent);

  return successResponse(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    { message: "User registered successfully", status: 201 }
  );
}

export const POST = withErrorHandler(registerHandler);
