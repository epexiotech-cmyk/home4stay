import { getRedis } from "../server/redis";
import { logger } from "../observability/logger";

const redis = getRedis();

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes

/**
 * Account Lockout Utility
 * Tracks failed login attempts in Redis to prevent brute-force attacks.
 * Strategy: email + IP combination to prevent distributed lockout abuse.
 */

export async function checkLockout(email: string, ip: string, requestId: string): Promise<{ locked: boolean; remainingSeconds: number }> {
  // BYPASS LOCKOUT IN DEVELOPMENT
  if (process.env.NODE_ENV === "development") {
    return { locked: false, remainingSeconds: 0 };
  }
  
  try {
    const key = `@home4stay:lockout:${email}:${ip}`;
    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts) >= LOCKOUT_THRESHOLD) {
      const ttl = await redis.ttl(key);
      
      await logger({
        level: 'warn',
        event: 'AUTH_LOCKOUT_CHECK',
        message: `Locked user ${email} attempted login from ${ip}`,
        requestId,
        ip,
        userId: email,
      });

      return { locked: true, remainingSeconds: Math.max(0, ttl) };
    }

    return { locked: false, remainingSeconds: 0 };
  } catch (error) {
    await logger({
      level: 'error',
      event: 'REDIS_LOCKOUT_FAILURE',
      message: `Failed to check lockout: ${error instanceof Error ? error.message : error}`,
      requestId,
      ip,
    });
    // STRICT MODE: Block login if security infrastructure is down
    return { locked: true, remainingSeconds: 60 }; 
  }
}

export async function recordFailure(email: string, ip: string, requestId: string) {
  try {
    const key = `@home4stay:lockout:${email}:${ip}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      await redis.expire(key, LOCKOUT_DURATION);
    }
    
    if (attempts >= LOCKOUT_THRESHOLD) {
      await logger({
        level: 'fatal',
        event: 'AUTH_LOCKOUT_TRIGGERED',
        message: `Account ${email} locked out from ${ip} after ${attempts} failures`,
        requestId,
        ip,
        userId: email,
      });
    } else {
      await logger({
        level: 'warn',
        event: 'AUTH_LOGIN_FAILURE_RECORDED',
        message: `Failed attempt ${attempts}/${LOCKOUT_THRESHOLD} for ${email} from ${ip}`,
        requestId,
        ip,
        userId: email,
      });
    }
    
    return attempts;
  } catch (error) {
    await logger({
      level: 'error',
      event: 'REDIS_RECORD_FAILURE_ERROR',
      message: `Failed to record failure: ${error instanceof Error ? error.message : error}`,
      requestId,
      ip,
    });
    return 0;
  }
}

export async function resetLockout(email: string, ip: string) {
  const key = `@home4stay:lockout:${email}:${ip}`;
  await redis.del(key);
}
