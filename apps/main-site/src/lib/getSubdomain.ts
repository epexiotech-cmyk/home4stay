/**
 * Detects the current subdomain from the window location.
 * Safely handles localhost and production environments.
 */
export function getSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;

  // Handle localhost development
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    // Check if there is a subdomain in localhost (e.g., shivay.localhost)
    const parts = host.split(".");
    if (parts.length > 1 && parts[parts.length - 1] === "localhost") {
       // shivay.localhost -> shivay
       return parts[0];
    }
    // Return null if no subdomain is present in localhost
    return null; 
  }

  // Handle production: [subdomain].[domain].[tld]
  const parts = host.split(".");
  
  // If we have at least 3 parts (e.g., shivay.home4stay.com), the first is the subdomain
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}
