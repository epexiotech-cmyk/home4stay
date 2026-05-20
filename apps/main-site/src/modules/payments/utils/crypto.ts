import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes is standard for GCM

// Derive a secure 32-byte key from environment or fallback
function getEncryptionKey(): Buffer {
  const secret = process.env.PAYMENT_ENCRYPTION_KEY || process.env.JWT_SECRET || "default_fallback_secure_payment_encryption_secret_key_2026";
  // Always derive a precise 32-byte key using PBKDF2 to satisfy AES-256 requirements
  return crypto.pbkdf2Sync(secret, "home4stay_payment_salt", 100000, 32, "sha256");
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Output is formatted as: ivHex:authTagHex:encryptedHex
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");
    
    return `${iv.toString("hex")}:${tag}:${encrypted}`;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Encryption error:", message);
    throw new Error(`Encryption failed: ${message}`);
  }
}

/**
 * Decrypts an encrypted string formatted as ivHex:authTagHex:encryptedHex
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      // Return raw string if it's not encrypted or legacy
      return encryptedText;
    }
    
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Decryption error:", message);
    // If decryption fails, check if the string was actually encrypted or just a plain string
    if (!encryptedText.includes(":")) {
      return encryptedText;
    }
    throw new Error(`Decryption failed: ${message}`);
  }
}
