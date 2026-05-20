import { getRedis } from "../server/redis";
import { logger } from "../observability/logger";

const BLACKLIST_PREFIX = "blacklist:";

/**
 * revokeJti
 * Adds a JWT ID (jti) to the Redis blacklist with a TTL.
 * If Redis is offline, logs a warning and fails gracefully, relying on PostgreSQL session deactivation.
 */
export async function revokeJti(jti: string, expirySeconds: number, requestId: string = "system") {
  try {
    const redis = getRedis();
    if (!redis) {
      console.warn("⚠️ Redis offline during token revocation. Relying strictly on DB session deactivation.");
      return false;
    }

    const key = `${BLACKLIST_PREFIX}${jti}`;
    await redis.set(key, "1", "EX", Math.max(expirySeconds, 1));
    
    await logger({
      level: "info",
      event: "AUTH_TOKEN_REVOKED",
      message: `Token JTI ${jti} blacklisted for ${expirySeconds}s in Redis`,
      requestId,
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn("⚠️ Redis exception during token revocation:", errorMessage);
    return false;
  }
}

/**
 * isJtiRevoked
 * Checks if a JWT ID (jti) is in the Redis blacklist.
 * High-resilience fail-open pattern: If Redis is offline or throws an error, return false (fail-open)
 * to let the request fall through to the PostgreSQL DB session check (which serves as our absolute truth).
 */
export async function isJtiRevoked(jti: string): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis) {
      console.warn("⚠️ Redis offline during blacklist check. Falling back fail-open to direct PostgreSQL session check.");
      return false;
    }

    const exists = await redis.exists(`${BLACKLIST_PREFIX}${jti}`);
    return exists === 1;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn("⚠️ Redis exception during blacklist check. Falling back fail-open to PostgreSQL:", errorMessage);
    return false; // Fail-open gracefully to protect site uptime
  }
}
