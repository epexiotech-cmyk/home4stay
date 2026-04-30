/**
 * Generates a cryptographically secure unique identifier for tracking requests.
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments where randomUUID might not be available
  return Math.random().toString(36).substring(2, 15)
}
