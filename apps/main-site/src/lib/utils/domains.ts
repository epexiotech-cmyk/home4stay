/**
 * Utility to extract subdomain from host
 */
export const getSubdomain = (host: string | null) => {
  if (!host) return null;

  // List of reserved subdomains that should NOT be treated as property slugs
  const reservedSubdomains = ["www", "api", "admin", "partner", "app", "dev"];

  // Handle localhost (e.g., tajvilla.localhost:3000)
  if (host.includes(".localhost")) {
    const parts = host.split(".localhost");
    const subdomain = parts[0];
    return reservedSubdomains.includes(subdomain) ? null : subdomain;
  }

  // Handle production domain (e.g., tajvilla.home4stay.homes)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "home4stay.homes";
  
  // Clean host (remove port if present)
  const cleanHost = host.split(":")[0];
  
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const subdomain = cleanHost.replace(`.${rootDomain}`, "");
    // Check for nested subdomains or reserved ones
    if (subdomain.includes(".") || reservedSubdomains.includes(subdomain)) {
      return null;
    }
    return subdomain;
  }

  return null;
};

/**
 * Utility to generate the URL for a property based on its slug.
 * Supports subdomain routing for both development and production.
 */
export const getPropertyUrl = (slug: string) => {
  // In development, default to localhost if NEXT_PUBLIC_APP_URL isn't explicitly set to a production domain
  let appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes";
  
  if (process.env.NODE_ENV === "development" && !appUrl.includes("localhost")) {
    appUrl = "http://localhost:3000";
  }
  
  try {
    const url = new URL(appUrl);
    const protocol = url.protocol; // e.g. "http:"
    const hostname = url.hostname; // e.g. "localhost" or "home4stay.homes"
    const port = url.port;

    // Handle localhost (e.g., http://localhost:3000 -> http://slug.localhost:3000)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const portSuffix = port ? `:${port}` : "";
      // Use http for localhost by default unless specified otherwise
      const safeProtocol = hostname === "localhost" ? "http:" : protocol;
      return `${safeProtocol}//${slug}.localhost${portSuffix}`;
    }

    // Handle production (e.g., https://home4stay.homes -> https://slug.home4stay.homes)
    return `${protocol}//${slug}.${hostname}`;
  } catch (error) {
    console.error("[getPropertyUrl] Error generating URL:", error);
    return `/property/${slug}`; // Final fallback
  }
};
