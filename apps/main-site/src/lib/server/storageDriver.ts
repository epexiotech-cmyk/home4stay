import fs from "fs";
import path from "path";

export interface IStorageDriver {
  uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  getFileStream(filePath: string): Promise<{ stream: fs.ReadStream; mimeType: string }>;
  deleteFile(filePath: string): Promise<void>;
}

export class LocalStorageDriver implements IStorageDriver {
  private baseDir: string;
  private allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  private maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

  constructor(customBaseDir?: string) {
    // Isolated secure storage path under workspace folder
    this.baseDir = customBaseDir || path.join(process.cwd(), "storage", "payments", "proofs");
    
    // Ensure base directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    // 1. Size constraint
    if (buffer.length > this.maxSizeBytes) {
      throw new Error("File size exceeds maximum allowed limit of 5MB");
    }

    // 2. MIME type filtering (images only)
    if (!this.allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new Error(`Unsupported file type: ${mimeType}. Only JPG, JPEG, PNG, and WEBP images are allowed.`);
    }

    // 3. Prevent path traversal using basename sanitization
    const sanitizedFilename = `${Date.now()}-${path.basename(filename).replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const targetPath = path.join(this.baseDir, sanitizedFilename);

    // Double-check path traversal containment
    if (!targetPath.startsWith(this.baseDir)) {
      throw new Error("Invalid storage destination traversal attempt detected");
    }

    // 4. Persist in-memory buffer
    await fs.promises.writeFile(targetPath, buffer);

    // Return the relative filepath within isolated proofs storage
    return sanitizedFilename;
  }

  async getFileStream(filePath: string): Promise<{ stream: fs.ReadStream; mimeType: string }> {
    const sanitizedFilename = path.basename(filePath);
    const targetPath = path.join(this.baseDir, sanitizedFilename);

    // Protect traversal
    if (!targetPath.startsWith(this.baseDir) || !fs.existsSync(targetPath)) {
      throw new Error("Proof screenshot not found or unauthorized path request");
    }

    // Derive simple MIME mapping from file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let mimeType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".png") mimeType = "image/png";
    else if (ext === ".webp") mimeType = "image/webp";

    const stream = fs.createReadStream(targetPath);
    return { stream, mimeType };
  }

  async deleteFile(filePath: string): Promise<void> {
    const sanitizedFilename = path.basename(filePath);
    const targetPath = path.join(this.baseDir, sanitizedFilename);

    if (targetPath.startsWith(this.baseDir) && fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  }
}

// Global configurable storage driver instance
export const storageDriver: IStorageDriver = new LocalStorageDriver();
