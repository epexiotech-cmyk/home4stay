import 'server-only';
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";
import { AppError } from "@/lib/errors/handler";

const KYC_DIR = process.env.KYC_STORAGE_DIR || path.join(process.cwd(), "storage", "kyc");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class KycStorageService {
  private static ensureStorageDirectory() {
    if (!fs.existsSync(KYC_DIR)) {
      fs.mkdirSync(KYC_DIR, { recursive: true });
    }
  }

  /**
   * Generates a cryptographically random filename for secure opaque referencing.
   */
  private static generateStorageKey(extension: string): string {
    return crypto.randomUUID() + extension;
  }

  private static getExtensionFromMime(mimeType: string): string {
    switch (mimeType) {
      case "image/jpeg": return ".jpg";
      case "image/png": return ".png";
      case "image/webp": return ".webp";
      default: return "";
    }
  }

  /**
   * Save a single KYC document securely
   * @param fileBuffer The raw bytes
   * @param mimeType The detected mime type
   */
  static async saveDocument(fileBuffer: Buffer): Promise<string> {
    this.ensureStorageDirectory();

    let mimeType = "";
    if (fileBuffer.length >= 3 && fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF) {
      mimeType = "image/jpeg";
    } else if (fileBuffer.length >= 8 && fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47 && fileBuffer[4] === 0x0D && fileBuffer[5] === 0x0A && fileBuffer[6] === 0x1A && fileBuffer[7] === 0x0A) {
      mimeType = "image/png";
    } else if (fileBuffer.length >= 12 && fileBuffer.subarray(0, 4).toString("ascii") === "RIFF" && fileBuffer.subarray(8, 12).toString("ascii") === "WEBP") {
      mimeType = "image/webp";
    }

    if (!mimeType) {
      throw new AppError("Invalid document type. Only JPEG, PNG, and WebP are allowed.", 400, "BAD_REQUEST");
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new AppError("File too large. Maximum size is 5MB.", 400, "BAD_REQUEST");
    }

    const extension = this.getExtensionFromMime(mimeType);
    const storageKey = this.generateStorageKey(extension);
    const targetFilePath = path.join(KYC_DIR, storageKey);

    const resolvedPath = path.resolve(targetFilePath);
    if (!resolvedPath.startsWith(path.resolve(KYC_DIR))) {
      throw new AppError("Security Exception: Path traversal detected.", 403, "FORBIDDEN");
    }

    await fs.promises.writeFile(targetFilePath, fileBuffer);
    
    return storageKey;
  }

  /**
   * Retrieves a document securely for API streaming
   */
  static async getDocument(storageKey: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!storageKey || storageKey.includes("/") || storageKey.includes("\\")) {
      throw new AppError("Security Exception: Invalid storage key.", 403, "FORBIDDEN");
    }

    const targetFilePath = path.join(KYC_DIR, storageKey);
    const resolvedPath = path.resolve(targetFilePath);

    if (!resolvedPath.startsWith(path.resolve(KYC_DIR))) {
      throw new AppError("Security Exception: Path traversal detected.", 403, "FORBIDDEN");
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new AppError("Document not found.", 404, "NOT_FOUND");
    }

    const buffer = await fs.promises.readFile(resolvedPath);
    let mimeType = "application/octet-stream";
    if (storageKey.endsWith(".jpg") || storageKey.endsWith(".jpeg")) mimeType = "image/jpeg";
    if (storageKey.endsWith(".png")) mimeType = "image/png";
    if (storageKey.endsWith(".webp")) mimeType = "image/webp";

    return { buffer, mimeType };
  }

  /**
   * Deletes a document safely
   */
  static async deleteDocument(storageKey: string): Promise<void> {
    if (!storageKey || storageKey.includes("/") || storageKey.includes("\\")) return;

    const targetFilePath = path.join(KYC_DIR, storageKey);
    const resolvedPath = path.resolve(targetFilePath);

    if (resolvedPath.startsWith(path.resolve(KYC_DIR)) && fs.existsSync(resolvedPath)) {
      await fs.promises.unlink(resolvedPath);
    }
  }
}
