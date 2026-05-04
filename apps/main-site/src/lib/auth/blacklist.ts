import { getRedis } from "../server/redis";
import { logger } from "../observability/logger";

const BLACKLIST_PREFIX = "blacklist:";

/**
 * revokeJti
 * Adds a JWT ID (jti) to the Redis blacklist with a TTL.
 */
export async function revokeJti(jti: string, expirySeconds: number, requestId: string = "system") {
  const redis = getRedis();
  if (!redis) {
    console.error("❌ Redis unavailable for token revocation");
    return false;
  }

  try {
    const key = `${BLACKLIST_PREFIX}${jti}`;
    // We store a simple value "1" as the token is revoked.
    // The TTL ensures it's automatically removed after the token would have expired anyway.
    await redis.set(key, "1", "EX", Math.max(expirySeconds, 1));
    
    await logger({
      level: "info",
      event: "AUTH_TOKEN_REVOKED",
      message: `Token JTI ${jti} blacklisted for ${expirySeconds}s`,
      requestId,
    });
    
    return true;
  } catch (error) {
    console.error("❌ Error revoking token JTI:", error);
    return false;
  }
}

/**
 * isJtiRevoked
 * Checks if a JWT ID (jti) is in the Redis blacklist.
 */
export async function isJtiRevoked(jti: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    // If Redis is down, we fail-secure for auth checks
    // But for a simple blacklist check, maybe we should be lenient?
    // Actually, user requested "Fail-Secure Lockout" earlier, so let's be strict.
    console.warn("⚠️ Redis unavailable for blacklist check - defaulting to REVOKED for safety");
    return true; 
  }

  try {
    const exists = await redis.exists(`${BLACKLIST_PREFIX}${jti}`);
    return exists === 1;
  } catch (error) {
    console.error("❌ Blacklist check error:", error);
    return true; // Fail-secure
  }
}
