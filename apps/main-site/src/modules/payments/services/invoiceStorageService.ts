import 'server-only';
import fs from "fs";
import path from "path";
import { logger } from "@/lib/observability/logger";

const INVOICE_DIR = path.join(process.cwd(), "storage", "invoices");

/**
 * Service to manage secure localized physical storage, retrieval, and isolation of compiled PDF invoices.
 */
export class InvoiceStorageService {
  /**
   * Ensures the storage directories exist cleanly on the server instance.
   */
  private static ensureStorageDirectory() {
    if (!fs.existsSync(INVOICE_DIR)) {
      fs.mkdirSync(INVOICE_DIR, { recursive: true });
      logger({
        level: "info",
        event: "STORAGE_DIRECTORY_CREATED",
        message: `Initialized secure local invoice storage directory at: ${INVOICE_DIR}`,
        requestId: "storage-system"
      });
    }
  }

  /**
   * Saves a compiled PDF invoice buffer to the local storage folder.
   * Guarantees path isolation by enforcing rigid UUID validation on booking IDs to block directory traversal attacks.
   */
  static async saveInvoicePdf(bookingId: string, pdfBuffer: Buffer): Promise<string> {
    this.ensureStorageDirectory();

    // 1. Production Hardening: Strictly validate bookingId structure to fully block path traversal
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const simpleAlphanumeric = /^[a-zA-Z0-9-]+$/;
    if (!uuidRegex.test(bookingId) && !simpleAlphanumeric.test(bookingId)) {
      throw new Error(`Security Exception: Forbidden characters in file identity request: "${bookingId}"`);
    }

    const targetFilename = `${bookingId}.pdf`;
    const targetFilePath = path.join(INVOICE_DIR, targetFilename);

    // Verify resolving isolation
    const resolvedPath = path.resolve(targetFilePath);
    if (!resolvedPath.startsWith(path.resolve(INVOICE_DIR))) {
      throw new Error(`Security Exception: Directory traversal boundary crossed for: ${resolvedPath}`);
    }

    try {
      await fs.promises.writeFile(targetFilePath, pdfBuffer);
      logger({
        level: "info",
        event: "INVOICE_PDF_SAVED",
        message: `Successfully wrote invoice PDF locally for booking: ${bookingId}`,
        requestId: "storage-system"
      });
      return resolvedPath;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger({
        level: "error",
        event: "INVOICE_PDF_SAVE_FAILED",
        message: `Failed saving local invoice statement: ${msg}`,
        requestId: "storage-system"
      });
      throw err;
    }
  }

  /**
   * Retrieves the raw buffer of a saved PDF invoice.
   */
  static async getInvoicePdf(bookingId: string): Promise<Buffer> {
    const targetFilePath = path.join(INVOICE_DIR, `${bookingId}.pdf`);
    const resolvedPath = path.resolve(targetFilePath);
    
    // Directory isolation check
    if (!resolvedPath.startsWith(path.resolve(INVOICE_DIR))) {
      throw new Error("Security Exception: Illegal document access path requested.");
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Document not found: No invoice is registered locally for booking ID: ${bookingId}`);
    }

    return fs.promises.readFile(resolvedPath);
  }

  /**
   * Checks if an invoice PDF already exists locally for this booking.
   */
  static exists(bookingId: string): boolean {
    const targetFilePath = path.join(INVOICE_DIR, `${bookingId}.pdf`);
    const resolvedPath = path.resolve(targetFilePath);
    return resolvedPath.startsWith(path.resolve(INVOICE_DIR)) && fs.existsSync(resolvedPath);
  }
}
