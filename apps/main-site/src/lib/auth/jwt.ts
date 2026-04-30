import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me"
);

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not defined in environment variables. Using default key.");
}

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("home4stay")
    .setAudience("home4stay-users")
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "home4stay",
      audience: "home4stay-users",
    });
    return payload;
  } catch {
    return null;
  }
}
