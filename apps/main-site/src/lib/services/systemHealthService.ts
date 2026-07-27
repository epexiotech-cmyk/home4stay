import { prisma } from "@/lib/database/prisma";
import { getRedis } from "@/lib/server/redis";
import { pool } from "@/lib/database/transactions";
import { AppError } from "@/lib/errors/handler";

export class SystemHealthService {
  static async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return "up";
    } catch (err) {
      console.error("❌ Health probe database failure:", err);
      return "down";
    }
  }

  static async checkPool() {
    try {
      await pool.query('SELECT 1');
      return "up";
    } catch (err) {
      console.error("❌ DB Pool Health Check Failed:", err);
      return "down";
    }
  }

  static async checkRedis() {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.ping();
        return "up";
      }
      return "down";
    } catch (err) {
      console.error("❌ Health probe Redis failure:", err);
      return "down";
    }
  }

  static checkEnvVars() {
    const criticalVars = ['JWT_SECRET', 'REDIS_URL', 'DATABASE_URL'];
    return criticalVars.filter(v => !process.env[v]);
  }

  static async getHealthStatus() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();
    
    const hasError = dbStatus === "down" || redisStatus === "down";
    
    return {
      success: !hasError,
      status: {
        database: dbStatus,
        redis: redisStatus,
        timestamp: new Date().toISOString()
      },
      uptime: process.uptime()
    };
  }

  static async getReadyStatus() {
    const redisStatus = await this.checkRedis();
    const dbStatus = await this.checkPool();
    const missingEnv = this.checkEnvVars();

    if (missingEnv.length > 0) {
      throw new AppError(`Missing env vars: ${missingEnv.join(', ')}`, 503, "DEGRADED");
    }

    if (dbStatus === "down") {
      throw new AppError("Primary database connection failed", 503, "DOWN");
    }

    return {
      status: redisStatus === "up" ? "ready" : "ready (with warnings)",
      db: dbStatus,
      redis: redisStatus === "up" ? "ok" : "error (warning)",
      smtp: "checking (see console)"
    };
  }

  static async getReadinessStatus() {
    const dbStatus = await this.checkDatabase();
    
    if (dbStatus === "down") {
      throw new AppError("Service is booting or connection pools are exhausted.", 503, "UNAVAILABLE");
    }
    
    return {
      ready: true,
      timestamp: new Date().toISOString()
    };
  }
}
