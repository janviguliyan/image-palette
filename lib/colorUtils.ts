/** Convert hex color to RGB components */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

/** Relative luminance per WCAG 2.1 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const sRGB = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/** Returns '#000000' or '#ffffff' for best contrast on a given background */
export function getContrastColor(hex: string): string {
  return getLuminance(hex) > 0.35 ? "#000000" : "#ffffff";
}

/** Returns a semi-transparent version as rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Lighten a hex color by a percentage (0–1) */
export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Darken a hex color by a percentage (0–1) */
export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Check if a color is considered "dark" */
export function isDark(hex: string): boolean {
  return getLuminance(hex) < 0.35;
}
