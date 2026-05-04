import { SignJWT, jwtVerify } from "jose";
import { isUserSessionValid } from "../server/session-manager";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me"
);

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not defined in environment variables. Using default key.");
}

export async function signToken(payload: Record<string, unknown>, expiresIn: string = "7d") {
  const jti = crypto.randomUUID();
  
  return await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(jti)
    .setIssuer("home4stay")
    .setAudience("home4stay-users")
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "home4stay",
      audience: "home4stay-users",
    });

    // Enterprise Security: Check if all sessions for this user were revoked
    if (payload.userId && payload.iat) {
      const isValid = await isUserSessionValid(payload.userId as string, payload.iat);
      if (!isValid) return null;
    }

    return payload;
  } catch {
    return null;
  }
}
