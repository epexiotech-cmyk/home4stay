import 'server-only';
import { getRedis } from "./redis";

const redis = getRedis();
const REVOCATION_PREFIX = "user_revocation:";

/**
 * Revokes all sessions for a specific user by setting a revocation timestamp in Redis.
 * Any token issued BEFORE this timestamp will be considered invalid.
 */
export async function revokeAllSessionsForUser(userId: string) {
  const key = `${REVOCATION_PREFIX}${userId}`;
  // Store current timestamp (seconds)
  const now = Math.floor(Date.now() / 1000);
  await redis.set(key, now.toString(), "EX", 7 * 24 * 60 * 60); // Keep for 7 days
}

/**
 * Checks if a token (based on its iat) is still valid for the user.
 */
export async function isUserSessionValid(userId: string, iat: number) {
  const key = `${REVOCATION_PREFIX}${userId}`;
  const revocationTime = await redis.get(key);
  
  if (!revocationTime) return true;
  
  // If token was issued before the revocation timestamp, it's invalid
  return iat > parseInt(revocationTime);
}
