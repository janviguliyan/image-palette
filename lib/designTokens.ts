// ── Typography ───────────────────────────────────────────────────────────────

export interface TypographyToken {
  name: string;
  token: string;
  sizeDesktop: string;
  sizeMobile: string;
  lineHeight: string;
  weight: number;
  letterSpacing: string;
  usage: string;
  family: "sans" | "mono";
  textCase: "none" | "uppercase";
}

export const TYPOGRAPHY_SCALE: TypographyToken[] = [
  { name: "Display",    token: "--text-display",  sizeDesktop: "clamp(3rem, 6vw, 5rem)",           sizeMobile: "3rem",     lineHeight: "0.9",  weight: 900, letterSpacing: "-0.04em", usage: "Hero headlines, landing page titles",   family: "sans", textCase: "none"      },
  { name: "H1",         token: "--text-h1",       sizeDesktop: "clamp(2.25rem, 4vw, 3.5rem)",      sizeMobile: "2.25rem",  lineHeight: "0.95", weight: 800, letterSpacing: "-0.03em", usage: "Page-level primary headers",            family: "sans", textCase: "none"      },
  { name: "H2",         token: "--text-h2",       sizeDesktop: "clamp(1.75rem, 3vw, 2.5rem)",      sizeMobile: "1.75rem",  lineHeight: "1.0",  weight: 700, letterSpacing: "-0.02em", usage: "Section headers, feature titles",        family: "sans", textCase: "none"      },
  { name: "H3",         token: "--text-h3",       sizeDesktop: "clamp(1.375rem, 2.5vw, 1.875rem)", sizeMobile: "1.375rem", lineHeight: "1.1",  weight: 700, letterSpacing: "-0.01em", usage: "Card titles, sidebar headers",           family: "sans", textCase: "none"      },
  { name: "H4",         token: "--text-h4",       sizeDesktop: "1.25rem",                          sizeMobile: "1.125rem", lineHeight: "1.2",  weight: 600, letterSpacing: "0em",     usage: "Form group labels, table headers",       family: "sans", textCase: "none"      },
  { name: "Body Large", token: "--text-body-lg",  sizeDesktop: "1.125rem",                         sizeMobile: "1.125rem", lineHeight: "1.65", weight: 400, letterSpacing: "0em",     usage: "Lead paragraphs, introductions",         family: "sans", textCase: "none"      },
  { name: "Body",       token: "--text-body",     sizeDesktop: "1rem",                             sizeMobile: "1rem",     lineHeight: "1.7",  weight: 400, letterSpacing: "0em",     usage: "Primary readable copy, descriptions",    family: "sans", textCase: "none"      },
  { name: "Body Small", token: "--text-body-sm",  sizeDesktop: "0.875rem",                         sizeMobile: "0.875rem", lineHeight: "1.6",  weight: 400, letterSpacing: "0em",     usage: "Secondary copy, helper text",            family: "sans", textCase: "none"      },
  { name: "Button",     token: "--text-button",   sizeDesktop: "0.875rem",                         sizeMobile: "0.875rem", lineHeight: "1",    weight: 600, letterSpacing: "0.02em",  usage: "Button labels, interactive CTAs",        family: "sans", textCase: "uppercase" },
  { name: "Caption",    token: "--text-caption",  sizeDesktop: "0.75rem",                          sizeMobile: "0.75rem",  lineHeight: "1.5",  weight: 400, letterSpacing: "0.01em",  usage: "Image captions, timestamps, metadata",   family: "sans", textCase: "none"      },
  { name: "Label",      token: "--text-label",    sizeDesktop: "0.75rem",                          sizeMobile: "0.75rem",  lineHeight: "1",    weight: 600, letterSpacing: "0.08em",  usage: "Form field labels, chip text, badges",   family: "mono", textCase: "uppercase" },
  { name: "Code",       token: "--text-code",     sizeDesktop: "0.875rem",                         sizeMobile: "0.875rem", lineHeight: "1.7",  weight: 400, letterSpacing: "0em",     usage: "Code blocks, variable names, tokens",    family: "mono", textCase: "none"      },
];

// ── Spacing ───────────────────────────────────────────────────────────────────

export interface SpacingToken {
  name: string;
  token: string;
  value: string;
  px: number;
  tailwind: string;
}

export const SPACING_SCALE: SpacingToken[] = [
  { name: "0.5", token: "--space-0-5", value: "0.125rem", px: 2,   tailwind: "0.5" },
  { name: "1",   token: "--space-1",   value: "0.25rem",  px: 4,   tailwind: "1"   },
  { name: "2",   token: "--space-2",   value: "0.5rem",   px: 8,   tailwind: "2"   },
  { name: "3",   token: "--space-3",   value: "0.75rem",  px: 12,  tailwind: "3"   },
  { name: "4",   token: "--space-4",   value: "1rem",     px: 16,  tailwind: "4"   },
  { name: "5",   token: "--space-5",   value: "1.25rem",  px: 20,  tailwind: "5"   },
  { name: "6",   token: "--space-6",   value: "1.5rem",   px: 24,  tailwind: "6"   },
  { name: "8",   token: "--space-8",   value: "2rem",     px: 32,  tailwind: "8"   },
  { name: "10",  token: "--space-10",  value: "2.5rem",   px: 40,  tailwind: "10"  },
  { name: "12",  token: "--space-12",  value: "3rem",     px: 48,  tailwind: "12"  },
  { name: "16",  token: "--space-16",  value: "4rem",     px: 64,  tailwind: "16"  },
  { name: "20",  token: "--space-20",  value: "5rem",     px: 80,  tailwind: "20"  },
  { name: "24",  token: "--space-24",  value: "6rem",     px: 96,  tailwind: "24"  },
  { name: "32",  token: "--space-32",  value: "8rem",     px: 128, tailwind: "32"  },
];

// ── Border Radius ─────────────────────────────────────────────────────────────

export interface RadiusToken {
  name: string;
  token: string;
  value: string;
  usage: string;
  tailwind: string;
}

export const RADIUS_SCALE: RadiusToken[] = [
  { name: "None", token: "--radius-none", value: "0px",    usage: "Sharp corners, brutalist",     tailwind: "none" },
  { name: "XS",   token: "--radius-xs",   value: "2px",    usage: "Subtle rounding, dense UI",    tailwind: "xs"   },
  { name: "SM",   token: "--radius-sm",   value: "4px",    usage: "Chips, tags, badges",           tailwind: "sm"   },
  { name: "MD",   token: "--radius-md",   value: "8px",    usage: "Cards, inputs — default",       tailwind: "md"   },
  { name: "LG",   token: "--radius-lg",   value: "12px",   usage: "Modals, panels, dialogs",       tailwind: "lg"   },
  { name: "XL",   token: "--radius-xl",   value: "16px",   usage: "Feature cards, drawers",        tailwind: "xl"   },
  { name: "2XL",  token: "--radius-2xl",  value: "24px",   usage: "Large sections, hero cards",    tailwind: "2xl"  },
  { name: "Pill", token: "--radius-pill", value: "9999px", usage: "Status dots, rounded buttons",  tailwind: "full" },
];

// ── Shadows ───────────────────────────────────────────────────────────────────

export interface ShadowToken {
  name: string;
  token: string;
  value: string;
  usage: string;
  tailwind: string;
}

export const SHADOW_SCALE: ShadowToken[] = [
  { name: "XS",    token: "--shadow-xs",    value: "0 1px 2px 0 rgba(0,0,0,0.05)",                                              usage: "Subtle depth, hover states",           tailwind: "xs"    },
  { name: "SM",    token: "--shadow-sm",    value: "0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)",           usage: "Cards at rest, dropdown menus",        tailwind: "sm"    },
  { name: "MD",    token: "--shadow-md",    value: "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)",        usage: "Elevated cards, active popovers",      tailwind: "md"    },
  { name: "LG",    token: "--shadow-lg",    value: "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)",      usage: "Modals, side panels, tooltips",        tailwind: "lg"    },
  { name: "XL",    token: "--shadow-xl",    value: "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)",     usage: "Floating actions, overlays",           tailwind: "xl"    },
  { name: "2XL",   token: "--shadow-2xl",   value: "0 25px 50px -12px rgba(0,0,0,0.25)",                                       usage: "Full-page overlays, complex dialogs",  tailwind: "2xl"   },
  { name: "Inner", token: "--shadow-inner", value: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",                                       usage: "Inset inputs, pressed states",          tailwind: "inner" },
];

// ── Shared override types (used by TypographySystem + ExportTriggers) ─────────

export type EditableField = "sizeDesktop" | "weight" | "lineHeight" | "letterSpacing" | "textCase";

export type OverrideMap = {
  [token: string]: Partial<Pick<TypographyToken, EditableField>>;
};

// ── Export build functions ────────────────────────────────────────────────────

export function buildTypographyCss(
  primaryFont = "Inter",
  secondaryFont = "Roboto",
  overrides: OverrideMap = {}
): string {
  const lines: string[] = ["\n  /* ─── Typography ─────────────────────────────────── */"];
  lines.push(`  --font-primary: '${primaryFont}', sans-serif;`);
  lines.push(`  --font-secondary: '${secondaryFont}', sans-serif;`);
  lines.push(`  --font-mono: 'JetBrains Mono', monospace;`);
  for (const t of TYPOGRAPHY_SCALE) {
    const ov = overrides[t.token] ?? {};
    const size    = (ov.sizeDesktop as string)  ?? t.sizeDesktop;
    const weight  = (ov.weight as number)        ?? t.weight;
    const leading = (ov.lineHeight as string)    ?? t.lineHeight;
    const tracking = (ov.letterSpacing as string) ?? t.letterSpacing;
    lines.push(`  ${t.token}: ${size};`);
    lines.push(`  ${t.token}-mobile: ${t.sizeMobile};`);
    lines.push(`  ${t.token}-weight: ${weight};`);
    lines.push(`  ${t.token}-leading: ${leading};`);
    lines.push(`  ${t.token}-tracking: ${tracking};`);
  }
  return lines.join("\n");
}

export function buildSpacingCss(): string {
  const lines: string[] = ["\n  /* ─── Spacing ────────────────────────────────────── */"];
  for (const s of SPACING_SCALE) lines.push(`  ${s.token}: ${s.value};`);
  return lines.join("\n");
}

export function buildRadiusCss(): string {
  const lines: string[] = ["\n  /* ─── Border Radius ──────────────────────────────── */"];
  for (const r of RADIUS_SCALE) lines.push(`  ${r.token}: ${r.value};`);
  return lines.join("\n");
}

export function buildShadowCss(): string {
  const lines: string[] = ["\n  /* ─── Shadows ────────────────────────────────────── */"];
  for (const s of SHADOW_SCALE) lines.push(`  ${s.token}: ${s.value};`);
  return lines.join("\n");
}

export function buildTypographyTailwind(
  primaryFont = "Inter",
  secondaryFont = "Roboto",
  overrides: OverrideMap = {}
): string {
  const lines: string[] = ["\n  // Typography"];
  lines.push("  fontFamily: {");
  lines.push(`    primary: ["'${primaryFont}'", "sans-serif"],`);
  lines.push(`    secondary: ["'${secondaryFont}'", "sans-serif"],`);
  lines.push(`    mono: ["'JetBrains Mono'", "monospace"],`);
  lines.push("  },");
  lines.push("  fontSize: {");
  for (const t of TYPOGRAPHY_SCALE) {
    const ov  = overrides[t.token] ?? {};
    const key = t.name.toLowerCase().replace(/\s+/g, "-");
    const size    = (ov.sizeDesktop as string) ?? t.sizeDesktop;
    const leading = (ov.lineHeight  as string) ?? t.lineHeight;
    const tracking = (ov.letterSpacing as string) ?? t.letterSpacing;
    const weight   = (ov.weight as number)     ?? t.weight;
    lines.push(`    "${key}": ["${size}", { lineHeight: "${leading}", letterSpacing: "${tracking}", fontWeight: "${weight}" }],`);
    lines.push(`    "${key}-mobile": ["${t.sizeMobile}", { lineHeight: "${leading}", letterSpacing: "${tracking}", fontWeight: "${weight}" }],`);
  }
  lines.push("  },");
  return lines.join("\n");
}

export function buildSpacingTailwind(): string {
  const lines: string[] = ["\n  // Spacing"];
  lines.push("  spacing: {");
  for (const s of SPACING_SCALE) lines.push(`    "${s.name}": "${s.value}",`);
  lines.push("  },");
  return lines.join("\n");
}

export function buildRadiusTailwind(): string {
  const lines: string[] = ["\n  // Border Radius"];
  lines.push("  borderRadius: {");
  for (const r of RADIUS_SCALE) lines.push(`    "${r.tailwind}": "${r.value}",`);
  lines.push("  },");
  return lines.join("\n");
}

export function buildShadowTailwind(): string {
  const lines: string[] = ["\n  // Box Shadow"];
  lines.push("  boxShadow: {");
  for (const s of SHADOW_SCALE) lines.push(`    "${s.tailwind}": "${s.value}",`);
  lines.push("  },");
  return lines.join("\n");
}

export function buildFoundationFigmaTokens(
  primaryFont = "Inter",
  secondaryFont = "Roboto",
  overrides: OverrideMap = {}
): Record<string, string> {
  const tokens: Record<string, string> = {};
  tokens["font.primary"]   = `${primaryFont}, sans-serif`;
  tokens["font.secondary"] = `${secondaryFont}, sans-serif`;
  tokens["font.mono"]      = "JetBrains Mono, monospace";
  for (const t of TYPOGRAPHY_SCALE) {
    const ov  = overrides[t.token] ?? {};
    const key = t.name.toLowerCase().replace(/\s+/g, ".");
    tokens[`typography.${key}.size`]        = (ov.sizeDesktop as string) ?? t.sizeDesktop;
    tokens[`typography.${key}.size-mobile`] = t.sizeMobile;
    tokens[`typography.${key}.weight`]      = String((ov.weight as number) ?? t.weight);
    tokens[`typography.${key}.leading`]     = (ov.lineHeight as string) ?? t.lineHeight;
    tokens[`typography.${key}.tracking`]    = (ov.letterSpacing as string) ?? t.letterSpacing;
    tokens[`typography.${key}.family`]      = t.family === "mono"
      ? "JetBrains Mono, monospace"
      : ["Display","H1","H2","H3","H4"].includes(t.name)
        ? `${primaryFont}, sans-serif`
        : `${secondaryFont}, sans-serif`;
  }
  for (const s of SPACING_SCALE) tokens[`spacing.${s.name}`]    = s.value;
  for (const r of RADIUS_SCALE)  tokens[`radius.${r.tailwind}`] = r.value;
  for (const s of SHADOW_SCALE)  tokens[`shadow.${s.tailwind}`] = s.value;
  return tokens;
}
