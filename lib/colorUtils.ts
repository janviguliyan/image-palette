/** Normalize hex: expand 3-char (#abc → #aabbcc), ensure leading #, lowercase */
export function normalizeHex(hex: string): string {
  if (!hex) return "#000000";
  let h = hex.trim();
  if (!h.startsWith("#")) h = "#" + h;
  h = h.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  return h;
}

/** Convert hex color to RGB components */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = normalizeHex(hex).replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return { r, g, b };
}

/** Convert hex to HSL (h: 0-360, s: 0-1, l: 0-1) */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

/** Convert HSL (h: 0-360, s: 0-1, l: 0-1) to hex */
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const hk = h / 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hk * 6) % 2 - 1));
  const m = l - c / 2;
  let rn = 0, gn = 0, bn = 0;
  if (hk < 1 / 6)      { rn = c; gn = x; bn = 0; }
  else if (hk < 2 / 6) { rn = x; gn = c; bn = 0; }
  else if (hk < 3 / 6) { rn = 0; gn = c; bn = x; }
  else if (hk < 4 / 6) { rn = 0; gn = x; bn = c; }
  else if (hk < 5 / 6) { rn = x; gn = 0; bn = c; }
  else                  { rn = c; gn = 0; bn = x; }
  const toH = (v: number) =>
    Math.round(Math.max(0, Math.min(255, (v + m) * 255))).toString(16).padStart(2, "0");
  return `#${toH(rn)}${toH(gn)}${toH(bn)}`;
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

/** WCAG contrast ratio between two colors */
export function getWcagContrast(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG conformance level */
export function getWcagLevel(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
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

export const SCALE_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

/**
 * Generate a full 50–900 design-system scale from a single hex color.
 * The input color becomes the 500 stop.
 */
export function generateScale(hex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hex);

  const TARGET_LIGHT_L = 0.97;
  const TARGET_LIGHT_S = Math.min(s, 0.12);
  const TARGET_DARK_L = 0.10;
  const TARGET_DARK_S = s * 0.85;

  // [key, tl (toward light, 0=500, 1=50), td (toward dark, 0=500, 1=900)]
  const stops: [string, number, number][] = [
    ["50",  1.00, 0],
    ["100", 0.85, 0],
    ["200", 0.68, 0],
    ["300", 0.50, 0],
    ["400", 0.28, 0],
    ["500", 0,    0],
    ["600", 0,    0.22],
    ["700", 0,    0.45],
    ["800", 0,    0.64],
    ["900", 0,    0.80],
  ];

  const scale: Record<string, string> = {};
  for (const [key, tl, td] of stops) {
    if (tl === 0 && td === 0) {
      scale[key] = hex;
    } else if (tl > 0) {
      const newL = l + (TARGET_LIGHT_L - l) * tl;
      const newS = s + (TARGET_LIGHT_S - s) * tl;
      scale[key] = hslToHex(h, newS, newL);
    } else {
      const newL = l + (TARGET_DARK_L - l) * td;
      const newS = s + (TARGET_DARK_S - s) * td;
      scale[key] = hslToHex(h, newS, newL);
    }
  }
  return scale;
}

/** Determine if a color temperature is warm, cool, or neutral */
export function getPaletteTemperature(hex: string): "warm" | "cool" | "neutral" {
  const { h, s } = hexToHsl(hex);
  if (s < 0.08) return "neutral";
  if ((h >= 0 && h <= 70) || h >= 330) return "warm";
  if (h >= 150 && h <= 300) return "cool";
  return "neutral";
}

/** Generate a neutral grey scale slightly tinted to match palette temperature */
export function generateNeutralScale(paletteHex: string): Record<string, string> {
  const temp = getPaletteTemperature(paletteHex);
  const hue = temp === "warm" ? 35 : temp === "cool" ? 215 : 0;
  const sat = temp === "neutral" ? 0 : 0.06;

  const lightnessStops: [string, number][] = [
    ["50",  0.98],
    ["100", 0.96],
    ["200", 0.91],
    ["300", 0.84],
    ["400", 0.72],
    ["500", 0.57],
    ["600", 0.42],
    ["700", 0.31],
    ["800", 0.20],
    ["900", 0.11],
  ];

  const scale: Record<string, string> = {};
  for (const [key, l] of lightnessStops) {
    scale[key] = hslToHex(hue, sat, l);
  }
  return scale;
}

/**
 * Generate a semantic color scale (success / error / warning / info),
 * with the hue very slightly nudged toward the palette's primary hue.
 */
export function generateSemanticScale(
  semanticHex: string,
  paletteHex: string
): Record<string, string> {
  const { h: baseH, s, l } = hexToHsl(semanticHex);
  const { h: paletteH } = hexToHsl(paletteHex);
  const diff = ((paletteH - baseH + 540) % 360) - 180; // shortest path
  const nudge = Math.sign(diff) * Math.min(Math.abs(diff), 20) * 0.15;
  return generateScale(hslToHex(baseH + nudge, s, l));
}

/** Map extracted colors array to semantic design-system roles */
export function mapColorsToRoles(colors: string[]): {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
} {
  if (colors.length === 0) return { primary: "#6366f1", secondary: "#8b5cf6", tertiary: "#a855f7", accent: "#ec4899" };
  // Sort by saturation descending — most saturated = primary
  const sorted = [...colors].sort((a, b) => hexToHsl(b).s - hexToHsl(a).s);
  return {
    primary:   sorted[0],
    secondary: sorted[1] ?? sorted[0],
    tertiary:  sorted[2] ?? sorted[0],
    accent:    sorted[3] ?? sorted[0],
  };
}

export interface DesignSystem {
  roles: { primary: string; secondary: string; tertiary: string; accent: string };
  scales: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    tertiary: Record<string, string>;
    accent: Record<string, string>;
  };
  neutral: Record<string, string>;
  semantic: {
    success: Record<string, string>;
    error: Record<string, string>;
    warning: Record<string, string>;
    info: Record<string, string>;
  };
}

/** Build the full design system from roles */
/**
 * Generate a harmonious secondary/tertiary/accent from a single primary color.
 * Uses split-complementary + analogous color theory.
 */
export function generateHarmoniousColors(primaryHex: string): {
  secondary: string;
  tertiary: string;
  accent: string;
} {
  const { h, s, l } = hexToHsl(primaryHex);
  const sat = Math.max(0.4, s);
  return {
    secondary: hslToHex((h + 210) % 360, sat * 0.85, Math.max(0.35, l * 0.95)),
    tertiary:  hslToHex((h + 150) % 360, sat * 0.75, Math.max(0.38, l * 1.05)),
    accent:    hslToHex((h + 30)  % 360, Math.min(1, sat * 1.1), l),
  };
}

export function buildDesignSystem(roles: {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}): DesignSystem {
  return {
    roles,
    scales: {
      primary:   generateScale(roles.primary),
      secondary: generateScale(roles.secondary),
      tertiary:  generateScale(roles.tertiary),
      accent:    generateScale(roles.accent),
    },
    neutral: generateNeutralScale(roles.primary),
    semantic: {
      success: generateSemanticScale("#16a34a", roles.primary),
      error:   generateSemanticScale("#dc2626", roles.primary),
      warning: generateSemanticScale("#d97706", roles.primary),
      info:    generateSemanticScale("#2563eb", roles.primary),
    },
  };
}
