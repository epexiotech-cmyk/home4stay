/**
 * Robust HTML sanitizer to protect against XSS attacks.
 * Strips dangerous HTML tags and dynamic event-handler attributes from administrative rich-text input.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  let sanitized = rawHtml;

  // 1. Remove script tags completely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove style tags completely (to prevent css hijacking)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Remove dangerous HTML tags
  const dangerousTags = [
    "iframe", "object", "embed", "frame", "frameset", "html", "body", "head", 
    "title", "link", "meta", "form", "input", "button", "select", "textarea", 
    "svg", "canvas", "audio", "video", "applet", "base"
  ];
  
  for (const tag of dangerousTags) {
    const regOpen = new RegExp(`<${tag}\\b[^>]*>`, "gi");
    const regClose = new RegExp(`<\/${tag}>`, "gi");
    sanitized = sanitized.replace(regOpen, "").replace(regClose, "");
  }

  // 4. Strip dynamic event-handler attributes (e.g., onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/<([^>]*?)\b(on[a-z]+)\s*=\s*(['"])(.*?)\3([^>]*?)>/gi, "<$1$5>");
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 5. Remove javascript: and vbscript: URIs in href and src attributes
  sanitized = sanitized.replace(/\bhref\s*=\s*['"]\s*(javascript|vbscript):/gi, 'href="#');
  sanitized = sanitized.replace(/\bsrc\s*=\s*['"]\s*(javascript|vbscript):/gi, 'src="#');

  return sanitized;
}
