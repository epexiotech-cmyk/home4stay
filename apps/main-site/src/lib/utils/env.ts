import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("A valid DATABASE_URL is required").optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long for security").optional(),
});

let parsedEnv: z.infer<typeof envSchema> | null = null;

/**
 * Lazy environment validation.
 * Validates the environment variables on the first call, throwing an error if invalid.
 */
export function getEnv() {
  if (parsedEnv) return parsedEnv;
  
  const _env = envSchema.safeParse(process.env);
  
  if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
  }
  
  parsedEnv = _env.data;
  return parsedEnv;
}
