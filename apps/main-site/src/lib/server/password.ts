import 'server-only';
import argon2 from "argon2";
import bcrypt from "bcryptjs";

/**
 * Password validation utility (Note: In a real app, you might want to import the regex from the client version to stay DRY)
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Enterprise Hashing Strategy:
 * Uses Argon2 by default. Detects and verifies Bcrypt for backward compatibility.
 */

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function comparePasswords(password: string, hash: string): Promise<{ isValid: boolean; needsUpgrade: boolean }> {
  const isArgon2 = hash.startsWith("$argon2");
  const isBcrypt = hash.startsWith("$2a$") || hash.startsWith("$2b$");

  if (isArgon2) {
    const isValid = await argon2.verify(hash, password);
    return { isValid, needsUpgrade: false };
  }

  if (isBcrypt) {
    const isValid = await bcrypt.compare(password, hash);
    return { isValid, needsUpgrade: true }; 
  }

  return { isValid: false, needsUpgrade: false };
}
