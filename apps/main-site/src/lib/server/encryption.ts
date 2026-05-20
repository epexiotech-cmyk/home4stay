import crypto from "crypto";

// Derive 32-byte key from environment or fallback database url key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest()
  : crypto.createHash("sha256").update(process.env.DATABASE_URL || "home4stay-platform-fallback-key").digest();

const IV_LENGTH = 16;

/**
 * Encrypts a plain text string using AES-256-CBC
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return IV joined with cipherText
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a cipher text string back to plain text
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  
  const parts = cipherText.split(":");
  if (parts.length !== 2) {
    // Secret is not encrypted (legacy or plain sandbox credential)
    return cipherText;
  }

  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
