/**
 * Utility to manipulate hex colors for dynamic theme generation.
 */

/**
 * Lightens or darkens a hex color by a given percentage.
 * @param hex The hex color string (e.g., "#3b82f6")
 * @param percent Positive for lighter, negative for darker (-1 to 1)
 */
export function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * (percent * 100));
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * Adds alpha transparency to a hex color.
 * @param hex The hex color string
 * @param opacity Opacity from 0 to 1
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
