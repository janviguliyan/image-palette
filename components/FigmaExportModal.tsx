"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DesignSystem } from "@/lib/colorUtils";
import { TYPOGRAPHY_SCALE, SHADOW_SCALE, SPACING_SCALE, RADIUS_SCALE } from "@/lib/designTokens";

// ── TypeScript-side helpers (run at script-generation time, NOT in Figma) ─────

function toRgb(hex: string) {
  const c = hex.replace("#", "");
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  return {
    r: r3(parseInt(c.slice(0, 2), 16) / 255),
    g: r3(parseInt(c.slice(2, 4), 16) / 255),
    b: r3(parseInt(c.slice(4, 6), 16) / 255),
  };
}

function isLight(hex: string): boolean {
  const { r, g, b } = toRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.5;
}

function parseShadowCss(css: string) {
  return css.split(/,(?![^(]*\))/).map(p => {
    const inner = p.trim().startsWith("inset");
    const m = p.trim().match(
      /(?:inset\s+)?([\d.-]+)(?:px)?\s+([\d.-]+)(?:px)?(?:\s+([\d.-]+)(?:px)?)?(?:\s+([\d.-]+)(?:px)?)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    );
    if (!m) return null;
    const r3 = (v: number) => Math.round(v * 1000) / 1000;
    return {
      inner,
      x:      parseFloat(m[1]),
      y:      parseFloat(m[2]),
      blur:   parseFloat(m[3] || "0"),
      spread: parseFloat(m[4] || "0"),
      r: r3(parseInt(m[5]) / 255),
      g: r3(parseInt(m[6]) / 255),
      b: r3(parseInt(m[7]) / 255),
      a: parseFloat(m[8]),
    };
  }).filter(Boolean);
}

// ── Build all DS data in TypeScript → embed as JSON in script ─────────────────

function buildFontsToLoad(primaryFont: string, secondaryFont: string) {
  const styles = ["Black", "ExtraBold", "Bold", "SemiBold", "Medium", "Regular"];
  const fonts: { family: string; style: string }[] = [];
  const seen = new Set<string>();
  const add = (family: string, style: string) => {
    const key = `${family}/${style}`;
    if (!seen.has(key)) { seen.add(key); fonts.push({ family, style }); }
  };
  // Always load Inter first — used as fallback for ALL text nodes
  for (const s of ["Regular", "Medium", "SemiBold", "Bold"]) add("Inter", s);
  // User-selected fonts
  for (const s of styles) add(primaryFont, s);
  if (secondaryFont !== primaryFont) for (const s of styles) add(secondaryFont, s);
  add("JetBrains Mono", "Regular");
  add("Material Icons", "Regular");
  return fonts;
}

function buildDS(ds: DesignSystem, primaryFont = "Inter", secondaryFont = "Roboto") {
  const { scales, neutral, semantic } = ds;

  // Colors (hex strings — converted to RGB inside Figma)
  const colors: Record<string, string> = {};
  const colorGroups: [string, Record<string, string>][] = [
    ["Primary", scales.primary],   ["Secondary", scales.secondary],
    ["Tertiary", scales.tertiary], ["Accent",    scales.accent],
    ["Neutral",  neutral],         ["Success",   semantic.success],
    ["Error",    semantic.error],  ["Warning",   semantic.warning],
    ["Info",     semantic.info],
  ];
  for (const [g, scale] of colorGroups)
    for (const [step, hex] of Object.entries(scale))
      colors[`${g}/${step}`] = hex as string;

  // Typography (fully pre-processed — no parsing needed in Figma)
  const HEADING_NAMES = new Set(["Display", "H1", "H2", "H3", "H4"]);
  const typography = TYPOGRAPHY_SCALE.map(t => {
    const style =
      t.family === "mono" ? "Regular" :
      t.weight >= 900 ? "Black" : t.weight >= 800 ? "ExtraBold" :
      t.weight >= 700 ? "Bold"  : t.weight >= 600 ? "SemiBold"  :
      t.weight >= 500 ? "Medium" : "Regular";
    const family = t.family === "mono" ? "JetBrains Mono" : HEADING_NAMES.has(t.name) ? primaryFont : secondaryFont;
    const sizePx = t.sizeDesktop.includes("clamp")
      ? (t.name === "Display" ? 60 : t.name === "H1" ? 48 : t.name === "H2" ? 36 : t.name === "H3" ? 28 : 24)
      : Math.round(parseFloat(t.sizeDesktop) * 16);
    const lhNum = parseFloat(t.lineHeight);
    const lhPx  = Math.round(sizePx * (isNaN(lhNum) ? 1.5 : lhNum));
    const lsNum = parseFloat(t.letterSpacing || "0");
    const lsPct = isNaN(lsNum) ? 0 : Math.round(lsNum * 100 * 10) / 10;
    return { name: t.name, family, style, size: sizePx, lhPx, lsPct };
  });

  // Shadows (pre-parsed — no regex in Figma)
  const shadows = SHADOW_SCALE.map(s => ({
    name:   s.name,
    usage:  s.usage,
    layers: parseShadowCss(s.value),
  }));

  // Spacing & Radius
  const spacing = SPACING_SCALE.map(s => ({ name: s.name, px: s.px }));
  const radius  = RADIUS_SCALE.map(r => ({
    name: r.name,
    px:   Math.min(parseInt(r.value) || 0, 9999),
    show: Math.min(parseInt(r.value) || 0, 28), // visual cap for 56×56 square
  }));

  // Pre-compute all component RGB values
  const p500 = scales.primary["500"],   p50  = scales.primary["50"];
  const p100 = scales.primary["100"],   p200 = scales.primary["200"];
  const p600 = scales.primary["600"],   p700 = scales.primary["700"];
  const e500 = semantic.error["500"],   e50  = semantic.error["50"];
  const e200 = semantic.error["200"],   e600 = semantic.error["600"];
  const e700 = semantic.error["700"];

  const pRgb     = toRgb(p500), p50Rgb = toRgb(p50), p100Rgb = toRgb(p100);
  const p200Rgb  = toRgb(p200), p600Rgb = toRgb(p600), p700Rgb = toRgb(p700);
  const pTextRgb = isLight(p500) ? { r: 0.04, g: 0.04, b: 0.04 } : { r: 1, g: 1, b: 1 };
  const eRgb     = toRgb(e500), e50Rgb = toRgb(e50), e200Rgb = toRgb(e200);
  const e600Rgb  = toRgb(e600), e700Rgb = toRgb(e700);
  const eTextRgb = isLight(e500) ? { r: 0.04, g: 0.04, b: 0.04 } : { r: 1, g: 1, b: 1 };

  // ── Buttons: 4 Types × 2 Sizes × 4 Icon combos × 5 States = 160 variants ──
  // ONE 'Button' component set — Type/Size/LeftIcon/RightIcon/State as Figma variant properties
  type RgbO = { r: number; g: number; b: number };
  type RgbN = RgbO | null;
  type BtnEntry = {
    name: string; bg: RgbN; text: RgbO; border: RgbN;
    padX: number; padY: number; fs: number;
    disabled: boolean; iconLeft: boolean; iconRight: boolean;
    focused: boolean; dangerBtn: boolean;
  };

  // 4 icon combos — text always shown
  const BTN_COMBOS = [
    { l: false, r: false, n: "LeftIcon=Off, RightIcon=Off" },
    { l: true,  r: false, n: "LeftIcon=On, RightIcon=Off"  },
    { l: false, r: true,  n: "LeftIcon=Off, RightIcon=On"  },
    { l: true,  r: true,  n: "LeftIcon=On, RightIcon=On"   },
  ] as const;

  const mkB = (
    type: string, size: "LG"|"SM",
    leftIcon: boolean, rightIcon: boolean, comboName: string,
    state: string,
    bg: RgbN, txt: RgbO, border: RgbN, focused = false, danger = false
  ): BtnEntry => {
    const lg = size === "LG";
    return {
      name:  `Type=${type}, Size=${lg ? "Large" : "Small"}, ${comboName}, State=${state}`,
      bg, text: txt, border,
      padX:  lg ? 28 : 18,
      padY:  lg ? 14 : 10,
      fs:    lg ? 15 : 13,
      disabled:  state === "Disabled",
      iconLeft:  leftIcon,
      iconRight: rightIcon,
      focused, dangerBtn: danger,
    };
  };

  const BTN_SIZES = ["LG", "SM"] as const;
  const buttons: BtnEntry[] = [];

  for (const sz of BTN_SIZES) {
    for (const c of BTN_COMBOS) {
      // Primary
      buttons.push(mkB("Primary", sz, c.l, c.r, c.n, "Default",  pRgb,    pTextRgb, null));
      buttons.push(mkB("Primary", sz, c.l, c.r, c.n, "Hover",    p600Rgb, pTextRgb, null));
      buttons.push(mkB("Primary", sz, c.l, c.r, c.n, "Focused",  pRgb,    pTextRgb, null,    true));
      buttons.push(mkB("Primary", sz, c.l, c.r, c.n, "Active",   p700Rgb, pTextRgb, null));
      buttons.push(mkB("Primary", sz, c.l, c.r, c.n, "Disabled", p200Rgb, pRgb,     null));
      // Secondary
      buttons.push(mkB("Secondary", sz, c.l, c.r, c.n, "Default",  p50Rgb,  p700Rgb, p200Rgb));
      buttons.push(mkB("Secondary", sz, c.l, c.r, c.n, "Hover",    p100Rgb, p700Rgb, pRgb));
      buttons.push(mkB("Secondary", sz, c.l, c.r, c.n, "Focused",  p50Rgb,  p700Rgb, pRgb,    true));
      buttons.push(mkB("Secondary", sz, c.l, c.r, c.n, "Active",   p100Rgb, p700Rgb, p600Rgb));
      buttons.push(mkB("Secondary", sz, c.l, c.r, c.n, "Disabled", p50Rgb,  p700Rgb, p200Rgb));
      // Ghost
      buttons.push(mkB("Ghost", sz, c.l, c.r, c.n, "Default",  null,    p700Rgb, p200Rgb));
      buttons.push(mkB("Ghost", sz, c.l, c.r, c.n, "Hover",    p50Rgb,  p700Rgb, pRgb));
      buttons.push(mkB("Ghost", sz, c.l, c.r, c.n, "Focused",  p50Rgb,  p700Rgb, pRgb,    true));
      buttons.push(mkB("Ghost", sz, c.l, c.r, c.n, "Active",   p100Rgb, p700Rgb, p200Rgb));
      buttons.push(mkB("Ghost", sz, c.l, c.r, c.n, "Disabled", null,    p700Rgb, p200Rgb));
      // Danger
      buttons.push(mkB("Danger", sz, c.l, c.r, c.n, "Default",  eRgb,    eTextRgb, null,    false, true));
      buttons.push(mkB("Danger", sz, c.l, c.r, c.n, "Hover",    e600Rgb, eTextRgb, null,    false, true));
      buttons.push(mkB("Danger", sz, c.l, c.r, c.n, "Focused",  eRgb,    eTextRgb, null,    true,  true));
      buttons.push(mkB("Danger", sz, c.l, c.r, c.n, "Active",   e700Rgb, eTextRgb, null,    false, true));
      buttons.push(mkB("Danger", sz, c.l, c.r, c.n, "Disabled", e200Rgb, eRgb,     null,    false, true));
    }
  }

  // Badges
  const Bg = (name: string, bg: object|null, text: object, border: object|null) => ({ name, bg, text, border });
  const defBg = { r: 0.93, g: 0.93, b: 0.93 }, defTxt = { r: 0.35, g: 0.35, b: 0.35 };
  const badges = [
    Bg("Variant=Default, Style=Filled",   defBg,                          defTxt,                          null),
    Bg("Variant=Default, Style=Outlined", null,                           defTxt,                          { r: 0.75, g: 0.75, b: 0.75 }),
    Bg("Variant=Primary, Style=Filled",   p50Rgb,                         p700Rgb,                         null),
    Bg("Variant=Primary, Style=Outlined", null,                           p700Rgb,                         p200Rgb),
    Bg("Variant=Success, Style=Filled",   toRgb(semantic.success["50"]),  toRgb(semantic.success["700"]),  null),
    Bg("Variant=Success, Style=Outlined", null,                           toRgb(semantic.success["700"]),  toRgb(semantic.success["200"])),
    Bg("Variant=Warning, Style=Filled",   toRgb(semantic.warning["50"]),  toRgb(semantic.warning["700"]),  null),
    Bg("Variant=Warning, Style=Outlined", null,                           toRgb(semantic.warning["700"]),  toRgb(semantic.warning["200"])),
    Bg("Variant=Error, Style=Filled",     e50Rgb,                         e700Rgb,                         null),
    Bg("Variant=Error, Style=Outlined",   null,                           e700Rgb,                         e200Rgb),
    Bg("Variant=Info, Style=Filled",      toRgb(semantic.info["50"]),     toRgb(semantic.info["700"]),     null),
    Bg("Variant=Info, Style=Outlined",    null,                           toRgb(semantic.info["700"]),     toRgb(semantic.info["200"])),
  ];

  // Alerts
  const Al = (name: string, label: string, bg: object, border: object, text: object) => ({ name, label, bg, border, text });
  const alerts = [
    Al("Type=Success", "Success", toRgb(semantic.success["50"]), toRgb(semantic.success["200"]), toRgb(semantic.success["700"])),
    Al("Type=Warning", "Warning", toRgb(semantic.warning["50"]), toRgb(semantic.warning["200"]), toRgb(semantic.warning["700"])),
    Al("Type=Error",   "Error",   e50Rgb,                        e200Rgb,                        e700Rgb),
    Al("Type=Info",    "Info",    toRgb(semantic.info["50"]),    toRgb(semantic.info["200"]),    toRgb(semantic.info["700"])),
  ];

  // ── Inputs: full set — Email × 4 states × 2 sizes, Textarea, Select, Search ──
  const nb = { r: 0.75, g: 0.75, b: 0.75 }; // neutral border
  type InpEntry = {
    name: string; itype: string; ph: string; val: string;
    hasError: boolean; disabled: boolean; szH: number; fsz: number;
    border: RgbO; bw: number; errRgb: RgbN; hasSearch: boolean; hasSelect: boolean;
  };
  const inputs: InpEntry[] = [
    // Email Address — 4 states × LG + SM
    { name: "Type=Email, State=Empty, Size=LG",    itype:"email",    ph:"hello@example.com",     val:"",                hasError:false, disabled:false, szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Filled, Size=LG",   itype:"email",    ph:"",                      val:"user@example.com",hasError:false, disabled:false, szH:72,  fsz:14, border:pRgb, bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Error, Size=LG",    itype:"email",    ph:"",                      val:"not-an-email",    hasError:true,  disabled:false, szH:72,  fsz:14, border:eRgb, bw:1.5, errRgb:eRgb, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Disabled, Size=LG", itype:"email",    ph:"hello@example.com",     val:"",                hasError:false, disabled:true,  szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Empty, Size=SM",    itype:"email",    ph:"hello@example.com",     val:"",                hasError:false, disabled:false, szH:56,  fsz:12, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Filled, Size=SM",   itype:"email",    ph:"",                      val:"user@example.com",hasError:false, disabled:false, szH:56,  fsz:12, border:pRgb, bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Error, Size=SM",    itype:"email",    ph:"",                      val:"not-an-email",    hasError:true,  disabled:false, szH:56,  fsz:12, border:eRgb, bw:1.5, errRgb:eRgb, hasSearch:false, hasSelect:false },
    { name: "Type=Email, State=Disabled, Size=SM", itype:"email",    ph:"hello@example.com",     val:"",                hasError:false, disabled:true,  szH:56,  fsz:12, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    // Textarea
    { name: "Type=Textarea, State=Default",        itype:"textarea", ph:"Write your message...", val:"",                hasError:false, disabled:false, szH:120, fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Textarea, State=Focus",          itype:"textarea", ph:"",                      val:"Your message...", hasError:false, disabled:false, szH:120, fsz:14, border:pRgb, bw:2,   errRgb:null, hasSearch:false, hasSelect:false },
    { name: "Type=Textarea, State=Disabled",       itype:"textarea", ph:"Not available",         val:"",                hasError:false, disabled:true,  szH:120, fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:false },
    // Select
    { name: "Type=Select, State=Default",          itype:"select",   ph:"Choose...",             val:"Designer",        hasError:false, disabled:false, szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:true  },
    { name: "Type=Select, State=Focus",            itype:"select",   ph:"",                      val:"Developer",       hasError:false, disabled:false, szH:72,  fsz:14, border:pRgb, bw:2,   errRgb:null, hasSearch:false, hasSelect:true  },
    { name: "Type=Select, State=Disabled",         itype:"select",   ph:"Choose...",             val:"",                hasError:false, disabled:true,  szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:false, hasSelect:true  },
    // Search
    { name: "Type=Search, State=Empty",            itype:"search",   ph:"Search components...",  val:"",                hasError:false, disabled:false, szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:true,  hasSelect:false },
    { name: "Type=Search, State=Filled",           itype:"search",   ph:"",                      val:"Button",          hasError:false, disabled:false, szH:72,  fsz:14, border:pRgb, bw:1.5, errRgb:null, hasSearch:true,  hasSelect:false },
    { name: "Type=Search, State=Disabled",         itype:"search",   ph:"Search...",             val:"",                hasError:false, disabled:true,  szH:72,  fsz:14, border:nb,   bw:1.5, errRgb:null, hasSearch:true,  hasSelect:false },
  ];

  // ── Icon buttons (Primary + Ghost × Default/Hover/Disabled) ──────────────
  const iconButtons = [
    { name: "Type=Primary, State=Default",  bg: pRgb    as RgbN, icon: pTextRgb, border: null    as RgbN, disabled: false },
    { name: "Type=Primary, State=Hover",    bg: p600Rgb as RgbN, icon: pTextRgb, border: null    as RgbN, disabled: false },
    { name: "Type=Primary, State=Disabled", bg: pRgb    as RgbN, icon: pTextRgb, border: null    as RgbN, disabled: true  },
    { name: "Type=Ghost, State=Default",    bg: null    as RgbN, icon: p700Rgb,  border: p200Rgb as RgbN, disabled: false },
    { name: "Type=Ghost, State=Hover",      bg: p50Rgb  as RgbN, icon: p700Rgb,  border: pRgb    as RgbN, disabled: false },
    { name: "Type=Ghost, State=Disabled",   bg: null    as RgbN, icon: p700Rgb,  border: p200Rgb as RgbN, disabled: true  },
  ];

  // ── Selection controls ──────────────────────────────────────────────────
  const checkboxes = [
    { name: "State=Unchecked",     label: "Unchecked",     bg: null    as RgbN, borderC: nb   as RgbO, checked: false, indeterminate: false, disabled: false },
    { name: "State=Checked",       label: "Checked",       bg: pRgb    as RgbN, borderC: pRgb as RgbO, checked: true,  indeterminate: false, disabled: false },
    { name: "State=Indeterminate", label: "Indeterminate", bg: pRgb    as RgbN, borderC: pRgb as RgbO, checked: false, indeterminate: true,  disabled: false },
    { name: "State=Disabled",      label: "Disabled",      bg: null    as RgbN, borderC: nb   as RgbO, checked: false, indeterminate: false, disabled: true  },
  ];

  const radios = [
    { name: "State=Unselected", label: "Option A", selected: false, disabled: false, borderC: nb   as RgbO, innerC: null as RgbN },
    { name: "State=Selected",   label: "Option B", selected: true,  disabled: false, borderC: pRgb as RgbO, innerC: pRgb as RgbN },
    { name: "State=Disabled",   label: "Option C", selected: false, disabled: true,  borderC: nb   as RgbO, innerC: null as RgbN },
  ];

  const toggles = [
    { name: "State=Off",      label: "Off",      on: false, disabled: false, trackC: nb   as RgbO },
    { name: "State=On",       label: "On",       on: true,  disabled: false, trackC: pRgb as RgbO },
    { name: "State=Disabled", label: "Disabled", on: false, disabled: true,  trackC: { r: 0.82, g: 0.82, b: 0.82 } as RgbO },
  ];

  return {
    colors,
    typography,
    shadows,
    spacing,
    radius,
    pal: {
      bar:       pRgb,
      textDark:  { r: 0.04, g: 0.04, b: 0.04 },
      textMid:   { r: 0.40, g: 0.40, b: 0.40 },
      textLight: { r: 0.65, g: 0.65, b: 0.65 },
      divider:   { r: 0.88, g: 0.88, b: 0.88 },
      rowLine:   { r: 0.93, g: 0.93, b: 0.93 },
      white:     { r: 1.00, g: 1.00, b: 1.00 },
      pageBg:    { r: 0.97, g: 0.97, b: 0.97 },
    },
    components: { buttons, badges, alerts, inputs, iconButtons, checkboxes, radios, toggles },
    previewColors: {
      primary:   { bg: pRgb   as RgbN, text: pTextRgb, border: null    as RgbN },
      secondary: { bg: p50Rgb as RgbN, text: p700Rgb,  border: p200Rgb as RgbN },
      ghost:     { bg: null   as RgbN, text: p700Rgb,  border: p200Rgb as RgbN },
      danger:    { bg: eRgb   as RgbN, text: eTextRgb, border: null    as RgbN },
    },
    pFont: primaryFont,
    sFont: secondaryFont,
    fontsToLoad: buildFontsToLoad(primaryFont, secondaryFont),
  };
}

// ── Generate the complete Figma plugin script ─────────────────────────────────
// All data is JSON-embedded. The generated JS is 100% static — no regex, no
// template literals, no nested string building. This is why it won't throw.

export function buildFigmaPluginScript(ds: DesignSystem, primaryFont = "Inter", secondaryFont = "Roboto"): string {
  const data = buildDS(ds, primaryFont, secondaryFont);
  const json = JSON.stringify(data);

  // Static JS body — uses only var, single-quotes, no backticks, no ${...}
  // Split into a plain string so TypeScript doesn't get confused by any chars.
  const body = [
    "var DS = __DS__;",
    "var P = DS.pal;",
    "",
    "// Hex string -> {r,g,b} 0-1 (used only for paint style creation)",
    "function hx(h) {",
    "  var c = h.replace('#','');",
    "  return {r:parseInt(c.slice(0,2),16)/255, g:parseInt(c.slice(2,4),16)/255, b:parseInt(c.slice(4,6),16)/255};",
    "}",
    "",
    "// ── 1. Paint Styles (colors) ─────────────────────────────────────────────",
    "var existingPaintStyles = {};",
    "figma.getLocalPaintStyles().forEach(function(s){ existingPaintStyles[s.name]=s; });",
    "for (var cn in DS.colors) {",
    "  if (existingPaintStyles[cn]) existingPaintStyles[cn].remove();",
    "  var ps = figma.createPaintStyle();",
    "  ps.name = cn;",
    "  var rgb = hx(DS.colors[cn]);",
    "  ps.paints = [{type:'SOLID', color:rgb}];",
    "}",
    "console.log('Paint styles:', Object.keys(DS.colors).length);",
    "",
    "// ── 2. Load Fonts ─────────────────────────────────────────────────────────",
    "var FONTS = DS.fontsToLoad;",
    "var loaded = {};",
    "var fontResults = await Promise.allSettled(FONTS.map(function(f){return figma.loadFontAsync(f);}));",
    "fontResults.forEach(function(r,i){",
    "  if(r.status==='fulfilled'){",
    "    loaded[FONTS[i].family+'/'+FONTS[i].style]=1;",
    "  } else {",
    "    console.warn('Font not loaded:', FONTS[i].family, FONTS[i].style, r.reason ? String(r.reason) : '');",
    "  }",
    "});",
    "console.log('Fonts loaded:', Object.keys(loaded).length, 'of', FONTS.length, '| loaded:', Object.keys(loaded).join(', '));",
    "if(!loaded['Inter/Regular']){",
    "  console.warn('Inter/Regular missing from loaded — attempting direct load');",
    "  try{ await figma.loadFontAsync({family:'Inter',style:'Regular'}); loaded['Inter/Regular']=1; }catch(e){console.error('Inter/Regular load failed:',String(e));}",
    "}",
    "function fn(fam, sty) {",
    "  if (loaded[fam+'/'+sty]) return {family:fam, style:sty};",
    "  if (loaded['Inter/Regular']) return {family:'Inter', style:'Regular'};",
    "  // Last resort: return as-is and hope Figma handles it",
    "  return {family:fam, style:sty};",
    "}",
    "// Material Icons availability — used throughout all component sections",
    "var hasMat = !!loaded['Material Icons/Regular'];",
    "var matFont = hasMat ? {family:'Material Icons',style:'Regular'} : fn(DS.sFont,'Regular');",
    "var matChar = hasMat ? 'arrow_forward' : '\u2192';",
    "",
    "// ── 3. Text Styles (typography) ───────────────────────────────────────────",
    "var existingTextStyles = {};",
    "figma.getLocalTextStyles().forEach(function(s){ existingTextStyles[s.name]=s; });",
    "for (var ti = 0; ti < DS.typography.length; ti++) {",
    "  var tp = DS.typography[ti];",
    "  var sname = 'Typography/'+tp.name;",
    "  if (existingTextStyles[sname]) existingTextStyles[sname].remove();",
    "  try {",
    "    var ts = figma.createTextStyle();",
    "    ts.name = sname;",
    "    ts.fontName = fn(tp.family, tp.style);",
    "    ts.fontSize = tp.size;",
    "    ts.lineHeight = {value:tp.lhPx, unit:'PIXELS'};",
    "    if (tp.lsPct !== 0) ts.letterSpacing = {value:tp.lsPct, unit:'PERCENT'};",
    "  } catch(e) { console.warn('Text style failed:', tp.name, e); }",
    "}",
    "",
    "// ── 4. Effect Styles (shadows) ────────────────────────────────────────────",
    "var existingEffStyles = {};",
    "figma.getLocalEffectStyles().forEach(function(s){ existingEffStyles[s.name]=s; });",
    "for (var si = 0; si < DS.shadows.length; si++) {",
    "  var sh = DS.shadows[si];",
    "  if (!sh.layers.length) continue;",
    "  var ename = 'Elevation/'+sh.name;",
    "  if (existingEffStyles[ename]) existingEffStyles[ename].remove();",
    "  try {",
    "    var es = figma.createEffectStyle();",
    "    es.name = ename;",
    "    es.effects = sh.layers.map(function(l) {",
    "      return {",
    "        type: l.inner ? 'INNER_SHADOW' : 'DROP_SHADOW',",
    "        color: {r:l.r, g:l.g, b:l.b, a:l.a},",  // a goes on color for effects
    "        offset: {x:l.x, y:l.y},",
    "        radius: l.blur, spread: l.spread,",
    "        visible: true, blendMode: 'NORMAL'",
    "      };",
    "    });",
    "  } catch(e) { console.warn('Effect style failed:', sh.name, e); }",
    "}",
    "",
    "// ── 5. Design System Page ─────────────────────────────────────────────────",
    "var pg = null;",
    "for (var pi = 0; pi < figma.root.children.length; pi++) {",
    "  if (figma.root.children[pi].name === 'Design System') { pg = figma.root.children[pi]; break; }",
    "}",
    "if (!pg) { pg = figma.createPage(); pg.name = 'Design System'; }",
    "figma.currentPage = pg;",
    "var staleNodes = [];",
    "for (var ci = 0; ci < pg.children.length; ci++) staleNodes.push(pg.children[ci]);",
    "for (var cj = 0; cj < staleNodes.length; cj++) { try { staleNodes[cj].remove(); } catch(e) {} }",
    "try { pg.backgrounds = [{type:'SOLID',color:P.pageBg}]; } catch(e) {}",
    "console.log('DS page ready. Children after clear:', pg.children.length);",
    "",
    "var PAD = 80;",
    "var WIDE = 1400;",
    "var cy = PAD;",
    "",
    "// Helper: text node appended to pg",
    "function mktxt(chars, fam, sty, size, color, x, y) {",
    "  try {",
    "    var t = figma.createText();",
    "    t.fontName = fn(fam, sty);",
    "    t.fontSize = size;",
    "    t.characters = String(chars);",
    "    t.fills = [{type:'SOLID', color:color}];",
    "    t.x = x; t.y = y;",
    "    pg.appendChild(t);",
    "    return t;",
    "  } catch(e) { console.warn('mktxt failed:', String(chars), fam, sty, String(e)); return null; }",
    "}",
    "",
    "// Helper: rectangle appended to pg",
    "function mkrct(x, y, w, h, fill, rad) {",
    "  var rc = figma.createRectangle();",
    "  rc.resize(Math.max(w,1), Math.max(h,1));",
    "  rc.x = x; rc.y = y;",
    "  if (rad) rc.cornerRadius = rad;",
    "  rc.fills = fill ? [{type:'SOLID',color:fill}] : [];",
    "  pg.appendChild(rc);",
    "  return rc;",
    "}",
    "",
    "// Helper: section header",
    "function mksec(label, y) {",
    "  mktxt(label, 'Inter','Bold', 9, P.textMid, PAD, y);",
    "  mkrct(PAD, y+16, WIDE, 1, P.divider);",
    "  return y + 30;",
    "}",
    "",
    "// ── Colors ────────────────────────────────────────────────────────────────",
    "console.log('Starting Colors section, cy=', cy);",
    "cy = mksec('Colors', cy);",
    "var cg = {}; var cgOrder = [];",
    "for (var ck in DS.colors) {",
    "  var gn = ck.split('/')[0];",
    "  if (!cg[gn]) { cg[gn]=[]; cgOrder.push(gn); }",
    "  cg[gn].push({name:ck, h:DS.colors[ck]});",
    "}",
    "for (var gi = 0; gi < cgOrder.length; gi++) {",
    "  var glabel = cgOrder[gi];",
    "  var gswatches = cg[glabel];",
    "  mktxt(glabel, 'Inter','SemiBold', 9, P.textMid, PAD, cy);",
    "  cy += 18;",
    "  var sx = PAD;",
    "  for (var swi = 0; swi < gswatches.length; swi++) {",
    "    var sw = gswatches[swi];",
    "    var step = sw.name.split('/')[1];",
    "    mkrct(sx, cy, 56, 48, hx(sw.h), 3);",
    "    mktxt(step, 'Inter','Regular', 7, P.textLight, sx, cy+52);",
    "    mktxt(sw.h.toUpperCase(), 'Inter','Regular', 6, P.textLight, sx, cy+62);",
    "    sx += 64;",
    "  }",
    "  cy += 84;",
    "}",
    "cy += 20;",
    "",
    "// ── Typography ────────────────────────────────────────────────────────────",
    "cy = mksec('Typography', cy);",
    "var tcols = [PAD, PAD+160, PAD+300, PAD+400, PAD+470, PAD+550, PAD+640];",
    "var theads = ['Scale','Typeface','Weight','Size','Line Ht','Tracking','Preview'];",
    "for (var thi = 0; thi < theads.length; thi++)",
    "  mktxt(theads[thi], 'Inter','SemiBold', 8, P.textLight, tcols[thi], cy);",
    "cy += 16; mkrct(PAD, cy, WIDE, 1, P.divider); cy += 8;",
    "for (var tyi = 0; tyi < DS.typography.length; tyi++) {",
    "  var tp = DS.typography[tyi];",
    "  var rowH = Math.max(40, Math.min(tp.size, 52) + 16);",
    "  var mid = cy + rowH/2 - 5;",
    "  mktxt(tp.name,         'Inter','Regular', 9, P.textMid,   tcols[0], mid);",
    "  mktxt(tp.family,       'Inter','Regular', 9, P.textLight, tcols[1], mid);",
    "  mktxt(tp.style,        'Inter','Regular', 9, P.textLight, tcols[2], mid);",
    "  mktxt(tp.size+'px',    'Inter','Regular', 9, P.textLight, tcols[3], mid);",
    "  mktxt(tp.lhPx+'px',   'Inter','Regular', 9, P.textLight, tcols[4], mid);",
    "  mktxt(tp.lsPct+'%',   'Inter','Regular', 9, P.textLight, tcols[5], mid);",
    "  try {",
    "    var prev = figma.createText();",
    "    prev.fontName = fn(tp.family, tp.style);",
    "    prev.fontSize = Math.min(tp.size, 44);",
    "    prev.characters = tp.name;",
    "    prev.fills = [{type:'SOLID',color:P.textDark}];",
    "    prev.x = tcols[6];",
    "    prev.y = cy + (rowH - Math.min(tp.size, 44))/2;",
    "    pg.appendChild(prev);",
    "  } catch(e) {}",
    "  cy += rowH;",
    "  mkrct(PAD, cy, WIDE, 1, P.rowLine); cy += 1;",
    "}",
    "cy += 24;",
    "",
    "// ── Spacing ───────────────────────────────────────────────────────────────",
    "cy = mksec('Spacing', cy);",
    "var spx = PAD;",
    "for (var spii = 0; spii < DS.spacing.length; spii++) {",
    "  var sp = DS.spacing[spii];",
    "  var bw = Math.max(4, sp.px);",
    "  mkrct(spx, cy, bw, 24, P.bar, 2);",
    "  mktxt(sp.name, 'Inter','SemiBold', 7, P.textMid,   spx, cy+28);",
    "  mktxt(sp.px+'px', 'Inter','Regular', 6, P.textLight, spx, cy+38);",
    "  spx += bw + 14;",
    "}",
    "cy += 60;",
    "",
    "// ── Border Radius ─────────────────────────────────────────────────────────",
    "cy = mksec('Border Radius', cy);",
    "var rdx = PAD;",
    "for (var rdi = 0; rdi < DS.radius.length; rdi++) {",
    "  var rd = DS.radius[rdi];",
    "  mkrct(rdx, cy, 56, 56, P.bar, rd.show);",
    "  mktxt(rd.name, 'Inter','SemiBold', 7, P.textMid,   rdx, cy+60);",
    "  mktxt(rd.px === 9999 ? 'pill' : rd.px+'px', 'Inter','Regular', 6, P.textLight, rdx, cy+70);",
    "  rdx += 72;",
    "}",
    "cy += 96;",
    "",
    "// ── Elevation / Shadows ───────────────────────────────────────────────────",
    "cy = mksec('Elevation', cy);",
    "var effMap = {};",
    "figma.getLocalEffectStyles().forEach(function(s){ effMap[s.name]=s.id; });",
    "var shx = PAD;",
    "for (var shIdx = 0; shIdx < DS.shadows.length; shIdx++) {",
    "  var shd = DS.shadows[shIdx];",
    "  if (!shd.layers.length) continue;",
    "  var card = mkrct(shx, cy+16, 96, 72, P.white, 8);",
    "  var eid = effMap['Elevation/'+shd.name];",
    "  if (eid) { try { card.effectStyleId = eid; } catch(e) {} }",
    "  mktxt(shd.name,  'Inter','SemiBold', 8, P.textMid,   shx, cy+92);",
    "  mktxt(shd.usage, 'Inter','Regular',  7, P.textLight, shx, cy+103);",
    "  shx += 120;",
    "}",
    "cy += 130;",
    "",
    "// ── Components: Buttons ───────────────────────────────────────────────────",
    "// Component set: Type(Primary/Secondary/Ghost/Danger) × Size(Large/Small) × LeftIcon × RightIcon × State",
    "cy = mksec('Components / Buttons', cy);",
    "console.log('Buttons total:', DS.components.buttons.length);",
    "",
    "// ── Search for icon components from user's file ───────────────────────────",
    "var userIconComps = [];",
    "try {",
    "  var allFileComps = figma.root.findAll(function(n) { return n.type === 'COMPONENT'; });",
    "  for (var ili = 0; ili < allFileComps.length && userIconComps.length < 50; ili++) {",
    "    var iln = allFileComps[ili];",
    "    var ilnm = (iln.name || '').toLowerCase();",
    "    var ilpar = iln.parent ? (iln.parent.name || '').toLowerCase() : '';",
    "    if (ilnm.includes('icon') || ilpar.includes('icon') || ilpar.includes('icons')) userIconComps.push(iln);",
    "  }",
    "} catch(ie) { console.warn('Icon search error:', String(ie)); }",
    "var defaultIconComp = userIconComps.length > 0 ? userIconComps[0] : null;",
    "console.log('Icon components found in file:', userIconComps.length, defaultIconComp ? ('first: ' + defaultIconComp.name) : 'none — using Material Icons text fallback');",
    "",
    "// ── Layout helpers: Type/State rows × Size/IconCombo cols (mirrors reference grid) ──",
    "var BTN_TMAP = {Primary:0, Secondary:1, Ghost:2, Danger:3};",
    "var BTN_SMAP = {Default:0, Hover:1, Focused:2, Active:3, Disabled:4};",
    "var BTN_ZMAP = {Large:0, Small:1};",
    "var BROW = 80; var BTGAP = 56; var BCOLW = 210; var BCMGAP = 48;",
    "function pbn(n) {",
    "  var tm=n.match(/Type=(\\w+)/); var sm=n.match(/State=(\\w+)/); var zm=n.match(/Size=(\\w+)/);",
    "  var lm=n.match(/LeftIcon=(\\w+)/); var rm=n.match(/RightIcon=(\\w+)/);",
    "  var ti=tm&&BTN_TMAP[tm[1]]!==undefined?BTN_TMAP[tm[1]]:0;",
    "  var si=sm&&BTN_SMAP[sm[1]]!==undefined?BTN_SMAP[sm[1]]:0;",
    "  var zi=zm&&BTN_ZMAP[zm[1]]!==undefined?BTN_ZMAP[zm[1]]:0;",
    "  var lo=lm&&lm[1]==='On'; var ro=rm&&rm[1]==='On';",
    "  return {ti:ti, si:si, zi:zi, ci:(lo?1:0)+(ro?2:0)};",
    "}",
    "",
    "var btnComps = [];",
    "var btnBy = cy;",
    "var iconLeftInsts = [];",
    "var iconRightInsts = [];",
    "",
    "for (var bgi = 0; bgi < DS.components.buttons.length; bgi++) {",
    "  var bd = DS.components.buttons[bgi];",
    "  var bl = pbn(bd.name);",
    "  var bc = figma.createComponent();",
    "  bc.name = bd.name;",
    "  bc.layoutMode = 'HORIZONTAL';",
    "  bc.primaryAxisSizingMode = 'AUTO';",
    "  bc.counterAxisSizingMode = 'AUTO';",
    "  bc.paddingLeft = bc.paddingRight = bd.padX;",
    "  bc.paddingTop = bc.paddingBottom = bd.padY;",
    "  bc.cornerRadius = 8;",
    "  bc.itemSpacing = 8;",
    "  bc.primaryAxisAlignItems = 'CENTER';",
    "  bc.counterAxisAlignItems = 'CENTER';",
    "  bc.fills = bd.bg ? [{type:'SOLID',color:bd.bg}] : [];",
    "  if (bd.border) { bc.strokes=[{type:'SOLID',color:bd.border}]; bc.strokeWeight=1.5; bc.strokeAlign='INSIDE'; }",
    "  bc.opacity = bd.disabled ? 0.4 : 1;",
    "  if (bd.focused) {",
    "    try {",
    "      var fbc = bd.border || bd.bg || {r:0.5,g:0.5,b:0.5};",
    "      bc.effects = [{type:'DROP_SHADOW',color:{r:fbc.r,g:fbc.g,b:fbc.b,a:0.35},offset:{x:0,y:0},radius:0,spread:4,visible:true,blendMode:'NORMAL'}];",
    "    } catch(e) {}",
    "  }",
    "  // ── Left icon slot ────────────────────────────────────────────────────",
    "  if (bd.iconLeft) {",
    "    if (defaultIconComp) {",
    "      try {",
    "        var bLi = defaultIconComp.createInstance();",
    "        try { bLi.resize(bd.fs+2, bd.fs+2); } catch(re) {}",
    "        bc.appendChild(bLi);",
    "        iconLeftInsts.push(bLi);",
    "      } catch(e) {",
    "        var bLf = figma.createText(); bLf.fontName=matFont; bLf.fontSize=bd.fs+2;",
    "        bLf.characters=matChar; bLf.fills=[{type:'SOLID',color:bd.text}]; bc.appendChild(bLf);",
    "      }",
    "    } else {",
    "      var bL = figma.createText(); bL.fontName=matFont; bL.fontSize=bd.fs+2;",
    "      bL.characters=matChar; bL.fills=[{type:'SOLID',color:bd.text}]; bc.appendChild(bL);",
    "    }",
    "  }",
    "  // ── Label ─────────────────────────────────────────────────────────────",
    "  try {",
    "    var bT = figma.createText();",
    "    bT.fontName=fn(DS.sFont,'SemiBold'); bT.fontSize=bd.fs;",
    "    bT.characters=bd.fs>=15?'Button Label':'Button';",
    "    bT.fills=[{type:'SOLID',color:bd.text}];",
    "    bc.appendChild(bT);",
    "  } catch(e) { console.warn('btn text fail', bd.name); }",
    "  // ── Right icon slot ───────────────────────────────────────────────────",
    "  if (bd.iconRight) {",
    "    if (defaultIconComp) {",
    "      try {",
    "        var bRi = defaultIconComp.createInstance();",
    "        try { bRi.resize(bd.fs+2, bd.fs+2); } catch(re2) {}",
    "        bc.appendChild(bRi);",
    "        iconRightInsts.push(bRi);",
    "      } catch(e) {",
    "        var bRf = figma.createText(); bRf.fontName=matFont; bRf.fontSize=bd.fs+2;",
    "        bRf.characters=matChar; bRf.fills=[{type:'SOLID',color:bd.text}]; bc.appendChild(bRf);",
    "      }",
    "    } else {",
    "      var bR = figma.createText(); bR.fontName=matFont; bR.fontSize=bd.fs+2;",
    "      bR.characters=matChar; bR.fills=[{type:'SOLID',color:bd.text}]; bc.appendChild(bR);",
    "    }",
    "  }",
    "  // ── Position: cols = (iconCombo × 2sizes + sizeIdx) × colW; rows = typeGroup + stateRow",
    "  var btypeH = 5*BROW+BTGAP;",
    "  var bcomboW = 2*BCOLW+BCMGAP;",
    "  bc.x = PAD + bl.ci*bcomboW + bl.zi*BCOLW;",
    "  bc.y = btnBy + bl.ti*btypeH + bl.si*BROW;",
    "  pg.appendChild(bc);",
    "  btnComps.push(bc);",
    "}",
    "if (btnComps.length) {",
    "  try {",
    "    var btnSet = figma.combineAsVariants(btnComps, pg);",
    "    btnSet.name = 'Button';",
    "    btnSet.x = PAD; btnSet.y = cy;",
    "    // ── Wire icon instance-swap component properties ──────────────────────",
    "    if (defaultIconComp) {",
    "      try {",
    "        if (iconLeftInsts.length > 0) {",
    "          var liPropId = btnSet.addComponentProperty('Left Icon', 'INSTANCE_SWAP', defaultIconComp.key);",
    "          if (userIconComps.length > 1) {",
    "            var liPref = [];",
    "            for (var lpv=0; lpv<Math.min(userIconComps.length,24); lpv++) liPref.push({type:'COMPONENT',key:userIconComps[lpv].key});",
    "            try { btnSet.editComponentProperty('Left Icon', {preferredValues:liPref}); } catch(ep) {}",
    "          }",
    "          for (var lii=0; lii<iconLeftInsts.length; lii++) {",
    "            try { var lr={}; lr['mainComponent']=liPropId; iconLeftInsts[lii].componentPropertyReferences=lr; } catch(e) {}",
    "          }",
    "        }",
    "        if (iconRightInsts.length > 0) {",
    "          var riPropId = btnSet.addComponentProperty('Right Icon', 'INSTANCE_SWAP', defaultIconComp.key);",
    "          if (userIconComps.length > 1) {",
    "            var riPref = [];",
    "            for (var rpv=0; rpv<Math.min(userIconComps.length,24); rpv++) riPref.push({type:'COMPONENT',key:userIconComps[rpv].key});",
    "            try { btnSet.editComponentProperty('Right Icon', {preferredValues:riPref}); } catch(ep2) {}",
    "          }",
    "          for (var rii=0; rii<iconRightInsts.length; rii++) {",
    "            try { var rr={}; rr['mainComponent']=riPropId; iconRightInsts[rii].componentPropertyReferences=rr; } catch(e) {}",
    "          }",
    "        }",
    "        console.log('Icon swap props added — Left:', iconLeftInsts.length, 'Right:', iconRightInsts.length);",
    "      } catch(e) { console.warn('Icon swap setup failed (non-fatal):', String(e)); }",
    "    }",
    "    cy += btnSet.height + 72;",
    "  } catch(e) {",
    "    console.error('Button set failed:', String(e));",
    "    cy = btnBy + 4*(5*BROW+BTGAP) + 72;",
    "  }",
    "}",
    "",
    "// ── Components: Badges ────────────────────────────────────────────────────",
    "cy = mksec('Components / Badges', cy);",
    "var badgeComps = [];",
    "var bdgBy = cy;",
    "for (var bdi = 0; bdi < DS.components.badges.length; bdi++) {",
    "  var bdd = DS.components.badges[bdi];",
    "  var bdc = figma.createComponent();",
    "  bdc.name = bdd.name;",
    "  bdc.layoutMode = 'HORIZONTAL';",
    "  bdc.primaryAxisSizingMode = 'AUTO';",
    "  bdc.counterAxisSizingMode = 'AUTO';",
    "  bdc.paddingLeft = bdc.paddingRight = 10;",
    "  bdc.paddingTop = bdc.paddingBottom = 4;",
    "  bdc.cornerRadius = 9999;",
    "  bdc.fills = bdd.bg ? [{type:'SOLID',color:bdd.bg}] : [];",
    "  if (bdd.border) { bdc.strokes=[{type:'SOLID',color:bdd.border}]; bdc.strokeWeight=1.5; bdc.strokeAlign='INSIDE'; }",
    "  var bdlabel = bdd.name.split(',')[0].split('=')[1] || 'Badge';",
    "  var bdt = figma.createText();",
    "  bdt.fontName = fn(DS.sFont,'SemiBold'); bdt.fontSize = 10;",
    "  bdt.characters = bdlabel.toUpperCase();",
    "  bdt.fills = [{type:'SOLID',color:bdd.text}];",
    "  bdt.letterSpacing = {value:5, unit:'PERCENT'};",
    "  bdc.appendChild(bdt);",
    "  bdc.x = PAD + (bdi % 6) * 130;",
    "  bdc.y = bdgBy + Math.floor(bdi / 6) * 40;",
    "  pg.appendChild(bdc);",
    "  badgeComps.push(bdc);",
    "}",
    "if (badgeComps.length) {",
    "  try {",
    "    var badgeSet = figma.combineAsVariants(badgeComps, pg);",
    "    badgeSet.name = 'Badge'; badgeSet.x = PAD; badgeSet.y = cy;",
    "    cy += badgeSet.height + 56;",
    "  } catch(e) { console.error('Badge set failed:', e); cy = bdgBy + Math.ceil(DS.components.badges.length / 6) * 40 + 56; }",
    "}",
    "",
    "// ── Components: Alerts ────────────────────────────────────────────────────",
    "cy = mksec('Components / Alerts', cy);",
    "var alertComps = [];",
    "var altBy = cy;",
    "for (var ali = 0; ali < DS.components.alerts.length; ali++) {",
    "  var al = DS.components.alerts[ali];",
    "  var alc = figma.createComponent();",
    "  alc.name = al.name;",
    "  alc.layoutMode = 'VERTICAL';",
    "  alc.primaryAxisSizingMode = 'FIXED';",
    "  alc.resize(320, 80);",
    "  alc.counterAxisSizingMode = 'AUTO';",
    "  alc.paddingLeft = alc.paddingRight = 16;",
    "  alc.paddingTop = alc.paddingBottom = 14;",
    "  alc.itemSpacing = 4;",
    "  alc.fills = [{type:'SOLID',color:al.bg}];",
    "  alc.strokes = [{type:'SOLID',color:al.border}];",
    "  alc.strokeWeight = 1; alc.strokeAlign = 'INSIDE';",
    "  var altitle = figma.createText();",
    "  altitle.fontName = fn(DS.pFont,'Bold'); altitle.fontSize = 13;",
    "  altitle.characters = al.label;",
    "  altitle.fills = [{type:'SOLID',color:al.text}];",
    "  alc.appendChild(altitle);",
    "  var albody = figma.createText();",
    "  albody.fontName = fn(DS.sFont,'Regular'); albody.fontSize = 12;",
    "  albody.characters = 'This is a '+al.label.toLowerCase()+' alert. Review and take action.';",
    "  albody.fills = [{type:'SOLID',color:al.text}];",
    "  alc.appendChild(albody);",
    "  alc.x = PAD + ali * 340;",
    "  alc.y = altBy;",
    "  pg.appendChild(alc);",
    "  alertComps.push(alc);",
    "}",
    "if (alertComps.length) {",
    "  try {",
    "    var alertSet = figma.combineAsVariants(alertComps, pg);",
    "    alertSet.name = 'Alert'; alertSet.x = PAD; alertSet.y = cy;",
    "    cy += alertSet.height + 56;",
    "  } catch(e) { console.error('Alert set failed:', e); cy = altBy + 140; }",
    "}",
    "",
    "",
    "// ── Components: Inputs — Email × 4 states × 2 sizes, Textarea, Select, Search ─────",
    "cy += 8;",
    "cy = mksec('Components / Inputs', cy);",
    "var inpComps = [];",
    "var inpBy = cy; var inpCols = 4; var inpColW = 304; var inpRowGap = 20;",
    "for (var ini = 0; ini < DS.components.inputs.length; ini++) {",
    "  var inp = DS.components.inputs[ini];",
    "  var inc = figma.createComponent();",
    "  inc.name = inp.name;",
    "  inc.layoutMode = 'VERTICAL';",
    "  inc.primaryAxisSizingMode = 'FIXED';",
    "  inc.resize(280, inp.szH);",
    "  inc.counterAxisSizingMode = 'AUTO';",
    "  inc.paddingLeft = inc.paddingRight = 12;",
    "  inc.paddingTop = inc.paddingBottom = 10;",
    "  inc.itemSpacing = 4;",
    "  inc.strokes = [{type:'SOLID', color:inp.border}];",
    "  inc.strokeWeight = inp.bw;",
    "  inc.strokeAlign = 'INSIDE';",
    "  inc.fills = inp.disabled ? [{type:'SOLID',color:{r:0.96,g:0.96,b:0.96}}] : [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "  inc.opacity = inp.disabled ? 0.55 : 1;",
    "  inc.cornerRadius = 6;",
    "  // Type-specific label",
    "  var inpLbl = inp.itype==='email' ? 'EMAIL ADDRESS' : inp.itype==='textarea' ? 'MESSAGE' : inp.itype==='select' ? 'ROLE' : 'SEARCH';",
    "  var lbl = figma.createText();",
    "  lbl.fontName = fn(DS.sFont,'SemiBold'); lbl.fontSize = 10;",
    "  lbl.characters = inpLbl;",
    "  lbl.fills = [{type:'SOLID', color: inp.disabled ? {r:0.6,g:0.6,b:0.6} : P.textMid}];",
    "  inc.appendChild(lbl);",
    "  // Search icon prefix indicator",
    "  if (inp.hasSearch) {",
    "    var stag = figma.createText();",
    "    stag.fontName = hasMat ? {family:'Material Icons',style:'Regular'} : fn(DS.sFont,'Regular');",
    "    stag.fontSize = 16;",
    "    stag.characters = hasMat ? 'search' : '\uD83D\uDD0D';",
    "    stag.fills = [{type:'SOLID',color:P.textLight}];",
    "    inc.appendChild(stag);",
    "  }",
    "  // Value / placeholder text",
    "  var vt = figma.createText();",
    "  vt.fontName = fn(DS.sFont,'Regular'); vt.fontSize = inp.fsz;",
    "  vt.characters = (inp.val || inp.ph) || ' ';",
    "  vt.fills = [{type:'SOLID', color: inp.val ? P.textDark : {r:0.65,g:0.65,b:0.65}}];",
    "  inc.appendChild(vt);",
    "  // Select chevron suffix indicator",
    "  if (inp.hasSelect) {",
    "    var selTag = figma.createText();",
    "    selTag.fontName = hasMat ? {family:'Material Icons',style:'Regular'} : fn(DS.sFont,'Regular');",
    "    selTag.fontSize = 16;",
    "    selTag.characters = hasMat ? 'expand_more' : '\u25BE';",
    "    selTag.fills = [{type:'SOLID',color:P.textLight}];",
    "    inc.appendChild(selTag);",
    "  }",
    "  // Error message",
    "  if (inp.hasError && inp.errRgb) {",
    "    var et = figma.createText();",
    "    et.fontName = fn(DS.sFont,'Regular'); et.fontSize = 10;",
    "    et.characters = 'Invalid email address';",
    "    et.fills = [{type:'SOLID', color:inp.errRgb}];",
    "    inc.appendChild(et);",
    "  }",
    "  inc.x = PAD + (ini % inpCols) * inpColW;",
    "  inc.y = inpBy + Math.floor(ini / inpCols) * (inp.szH + inpRowGap);",
    "  pg.appendChild(inc);",
    "  inpComps.push(inc);",
    "}",
    "if (inpComps.length) {",
    "  try {",
    "    var inpSet = figma.combineAsVariants(inpComps, pg);",
    "    inpSet.name = 'Input'; inpSet.x = PAD; inpSet.y = cy;",
    "    cy += inpSet.height + 56;",
    "  } catch(e) { console.error('Input set failed:', String(e)); cy = inpBy + Math.ceil(DS.components.inputs.length / inpCols) * 100 + 56; }",
    "}",
    "",
    "// ── Components: Icon Buttons ──────────────────────────────────────────────",
    "cy += 8;",
    "cy = mksec('Components / Icon Buttons', cy);",
    "var ibComps = [];",
    "var ibBy = cy;",
    "for (var ibi = 0; ibi < DS.components.iconButtons.length; ibi++) {",
    "  var ib = DS.components.iconButtons[ibi];",
    "  var ibc = figma.createComponent();",
    "  ibc.name = ib.name;",
    "  ibc.layoutMode = 'HORIZONTAL';",
    "  ibc.primaryAxisSizingMode = 'FIXED';",
    "  ibc.counterAxisSizingMode = 'FIXED';",
    "  ibc.resize(40, 40);",
    "  ibc.primaryAxisAlignItems = 'CENTER';",
    "  ibc.counterAxisAlignItems = 'CENTER';",
    "  ibc.cornerRadius = 6;",
    "  ibc.fills = ib.bg ? [{type:'SOLID',color:ib.bg}] : [];",
    "  if (ib.border) { ibc.strokes=[{type:'SOLID',color:ib.border}]; ibc.strokeWeight=1.5; ibc.strokeAlign='INSIDE'; }",
    "  ibc.opacity = ib.disabled ? 0.4 : 1;",
    "  var it = figma.createText();",
    "  it.fontName = matFont;",
    "  it.fontSize = 20;",
    "  it.characters = hasMat ? 'add' : '+';",
    "  it.fills = [{type:'SOLID',color:ib.icon}];",
    "  ibc.appendChild(it);",
    "  ibc.x = PAD + (ibi % 6) * 56;",
    "  ibc.y = ibBy;",
    "  pg.appendChild(ibc);",
    "  ibComps.push(ibc);",
    "}",
    "if (ibComps.length) {",
    "  try {",
    "    var ibSet = figma.combineAsVariants(ibComps, pg);",
    "    ibSet.name = 'IconButton'; ibSet.x = PAD; ibSet.y = cy;",
    "    cy += ibSet.height + 56;",
    "  } catch(e) { console.error('IconButton set failed:', e); cy = ibBy + 56 + 56; }",
    "}",
    "",
    "// ── Components: Checkboxes ────────────────────────────────────────────────",
    "cy += 8;",
    "cy = mksec('Components / Checkboxes', cy);",
    "var ckComps = []; var ckBy = cy;",
    "for (var cki = 0; cki < DS.components.checkboxes.length; cki++) {",
    "  var ckd = DS.components.checkboxes[cki];",
    "  var ckc = figma.createComponent();",
    "  ckc.name = ckd.name;",
    "  ckc.resize(160, 28);",
    "  ckc.fills = [];",
    "  ckc.opacity = ckd.disabled ? 0.45 : 1;",
    "  // Checkbox indicator box (16×16 frame)",
    "  var ckBox = figma.createFrame();",
    "  ckBox.resize(16, 16);",
    "  ckBox.x = 0; ckBox.y = 6;",
    "  ckBox.cornerRadius = 3;",
    "  ckBox.fills = ckd.bg ? [{type:'SOLID',color:ckd.bg}] : [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "  ckBox.strokes = [{type:'SOLID',color:ckd.borderC}];",
    "  ckBox.strokeWeight = 1.5; ckBox.strokeAlign = 'INSIDE';",
    "  ckBox.clipsContent = true;",
    "  ckc.appendChild(ckBox);",
    "  if (ckd.checked) {",
    "    try {",
    "      var ckMark = figma.createText();",
    "      ckMark.fontName = fn('Inter','Bold'); ckMark.fontSize = 10;",
    "      ckMark.characters = '\u2713';",
    "      ckMark.fills = [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "      ckMark.x = 2; ckMark.y = 1;",
    "      ckBox.appendChild(ckMark);",
    "    } catch(e) {}",
    "  }",
    "  if (ckd.indeterminate) {",
    "    var ckDash = figma.createRectangle();",
    "    ckDash.resize(8, 2); ckDash.x = 4; ckDash.y = 7;",
    "    ckDash.cornerRadius = 1;",
    "    ckDash.fills = [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "    ckBox.appendChild(ckDash);",
    "  }",
    "  try {",
    "    var ckLbl = figma.createText();",
    "    ckLbl.fontName = fn(DS.sFont,'Regular'); ckLbl.fontSize = 12;",
    "    ckLbl.characters = ckd.label;",
    "    ckLbl.fills = [{type:'SOLID',color:P.textMid}];",
    "    ckLbl.x = 24; ckLbl.y = 7;",
    "    ckc.appendChild(ckLbl);",
    "  } catch(e) {}",
    "  ckc.x = PAD + (cki % 5) * 180; ckc.y = ckBy;",
    "  pg.appendChild(ckc); ckComps.push(ckc);",
    "}",
    "if (ckComps.length) {",
    "  try {",
    "    var ckSet = figma.combineAsVariants(ckComps, pg);",
    "    ckSet.name = 'Checkbox'; ckSet.x = PAD; ckSet.y = cy;",
    "    cy += ckSet.height + 56;",
    "  } catch(e) { cy = ckBy + 56 + 56; }",
    "}",
    "",
    "// ── Components: Radio Buttons ─────────────────────────────────────────────",
    "cy += 8;",
    "cy = mksec('Components / Radio', cy);",
    "var rdComps = []; var rdBy = cy;",
    "for (var rdi = 0; rdi < DS.components.radios.length; rdi++) {",
    "  var rdd = DS.components.radios[rdi];",
    "  var rdc = figma.createComponent();",
    "  rdc.name = rdd.name;",
    "  rdc.resize(160, 28);",
    "  rdc.fills = [];",
    "  rdc.opacity = rdd.disabled ? 0.45 : 1;",
    "  // Outer circle",
    "  var rdOuter = figma.createEllipse();",
    "  rdOuter.resize(16, 16); rdOuter.x = 0; rdOuter.y = 6;",
    "  rdOuter.fills = [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "  rdOuter.strokes = [{type:'SOLID',color:rdd.borderC}];",
    "  rdOuter.strokeWeight = 1.5; rdOuter.strokeAlign = 'INSIDE';",
    "  rdc.appendChild(rdOuter);",
    "  // Inner dot (selected)",
    "  if (rdd.selected && rdd.innerC) {",
    "    var rdInner = figma.createEllipse();",
    "    rdInner.resize(8, 8); rdInner.x = 4; rdInner.y = 10;",
    "    rdInner.fills = [{type:'SOLID',color:rdd.innerC}];",
    "    rdInner.strokes = [];",
    "    rdc.appendChild(rdInner);",
    "  }",
    "  try {",
    "    var rdLbl = figma.createText();",
    "    rdLbl.fontName = fn(DS.sFont,'Regular'); rdLbl.fontSize = 12;",
    "    rdLbl.characters = rdd.label;",
    "    rdLbl.fills = [{type:'SOLID',color:P.textMid}];",
    "    rdLbl.x = 24; rdLbl.y = 7;",
    "    rdc.appendChild(rdLbl);",
    "  } catch(e) {}",
    "  rdc.x = PAD + (rdi % 5) * 180; rdc.y = rdBy;",
    "  pg.appendChild(rdc); rdComps.push(rdc);",
    "}",
    "if (rdComps.length) {",
    "  try {",
    "    var rdSet = figma.combineAsVariants(rdComps, pg);",
    "    rdSet.name = 'Radio'; rdSet.x = PAD; rdSet.y = cy;",
    "    cy += rdSet.height + 56;",
    "  } catch(e) { cy = rdBy + 56 + 56; }",
    "}",
    "",
    "// ── Components: Toggles ───────────────────────────────────────────────────",
    "cy += 8;",
    "cy = mksec('Components / Toggles', cy);",
    "var tgComps = []; var tgBy = cy;",
    "for (var tgi = 0; tgi < DS.components.toggles.length; tgi++) {",
    "  var tgd = DS.components.toggles[tgi];",
    "  var tgc = figma.createComponent();",
    "  tgc.name = tgd.name;",
    "  tgc.resize(120, 28);",
    "  tgc.fills = [];",
    "  tgc.opacity = tgd.disabled ? 0.45 : 1;",
    "  // Track (pill shape)",
    "  var tgTrack = figma.createRectangle();",
    "  tgTrack.resize(40, 22); tgTrack.x = 0; tgTrack.y = 3;",
    "  tgTrack.cornerRadius = 9999;",
    "  tgTrack.fills = [{type:'SOLID',color:tgd.trackC}];",
    "  tgc.appendChild(tgTrack);",
    "  // Thumb circle",
    "  var tgThumb = figma.createEllipse();",
    "  tgThumb.resize(16, 16);",
    "  tgThumb.x = tgd.on ? 21 : 3; tgThumb.y = 6;",
    "  tgThumb.fills = [{type:'SOLID',color:{r:1,g:1,b:1}}];",
    "  tgc.appendChild(tgThumb);",
    "  try {",
    "    var tgLbl = figma.createText();",
    "    tgLbl.fontName = fn(DS.sFont,'Regular'); tgLbl.fontSize = 12;",
    "    tgLbl.characters = tgd.label;",
    "    tgLbl.fills = [{type:'SOLID',color:P.textMid}];",
    "    tgLbl.x = 50; tgLbl.y = 8;",
    "    tgc.appendChild(tgLbl);",
    "  } catch(e) {}",
    "  tgc.x = PAD + (tgi % 5) * 140; tgc.y = tgBy;",
    "  pg.appendChild(tgc); tgComps.push(tgc);",
    "}",
    "if (tgComps.length) {",
    "  try {",
    "    var tgSet = figma.combineAsVariants(tgComps, pg);",
    "    tgSet.name = 'Toggle'; tgSet.x = PAD; tgSet.y = cy;",
    "    cy += tgSet.height + 56;",
    "  } catch(e) { cy = tgBy + 56 + 56; }",
    "}",
    "",
    "figma.viewport.scrollAndZoomIntoView(pg.children);",
    "figma.notify('Design System ready — '+Object.keys(DS.colors).length+' colors, '+DS.components.buttons.length+' button variants, Checkbox + Radio + Toggle!', {timeout:8000});",
    "figma.closePlugin();",
  ].join("\n");

  const script = [
    "// ═══════════════════════════════════════════════════════════════════════",
    "// Design System — generated by Image Palette Generator",
    "// HOW TO RUN:",
    "//   1. Open Figma Desktop (web does not support plugins)",
    "//   2. Menu bar → Plugins → Development → Open Console",
    "//   3. Paste this entire script and press Enter",
    "//",
    "// WHAT IT CREATES:",
    "//   Paint styles  — " + Object.keys(buildDS(ds).colors).length + " color styles (Primary → Info, all 50-900 steps)",
    "//   Text styles   — " + TYPOGRAPHY_SCALE.length + " typography styles (Display → Code)",
    "//   Effect styles — " + SHADOW_SCALE.length + " elevation/shadow styles",
    "//   Design System page — colors, type table, spacing, radius, shadows, components",
    "//   Components    — Button (1 set: Type/Size/LeftIcon/RightIcon/State = 160 variants)",
    "//                          (Primary/Secondary/Ghost/Danger × Large/Small × 4 icon combos × 5 states)",
    "//                   Input (Email empty/filled/error/disabled LG+SM, Textarea, Select, Search)",
    "//                   Badge (6 × 2 styles), Alert (4 types)",
    "//                   Checkbox (4 states), Radio (3 states), Toggle (3 states)",
    "// ═══════════════════════════════════════════════════════════════════════",
    "(async function() {",
    body.replace("var DS = __DS__;", "var DS = " + json + ";"),
    "})();",
  ].join("\n");

  return script;
}

// ── Modal UI ─────────────────────────────────────────────────────────────────

interface Props {
  ds: DesignSystem;
  onClose: () => void;
}

export default function FigmaExportModal({ ds, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const script = buildFigmaPluginScript(ds);
  const accent = ds.scales.primary["500"];

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(script); } catch {
      const el = document.createElement("textarea");
      el.value = script; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(10,10,10,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full max-w-xl flex flex-col"
        style={{ border: "2px solid #0a0a0a", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="border-b-2 border-[#0a0a0a] px-8 py-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa] mb-1.5">Export</p>
            <h2 className="font-black text-xl uppercase leading-none tracking-tighter text-[#0a0a0a]">Open in Figma</h2>
            <p className="font-mono text-[12px] text-[#888] mt-2">
              Plugin script · Run in Figma Desktop console
            </p>
          </div>
          <button onClick={onClose} className="font-mono text-[12px] uppercase tracking-widest text-[#888] hover:text-[#0a0a0a] transition-colors mt-0.5 shrink-0">✕</button>
        </div>

        {/* What it creates */}
        <div className="border-b border-[#e8e8e4] px-8 py-4 shrink-0">
          <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">What gets created</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              `${Object.keys(buildDS(ds).colors).length} paint styles  (colors)`,
              `${TYPOGRAPHY_SCALE.length} text styles  (typography)`,
              `${SHADOW_SCALE.length} effect styles  (elevations)`,
              "Design System page (visual guide)",
              "Button component set  (160 variants: Type × Size × Icon × State)",
              "Badge component set  (6×2 variants)",
              "Alert component set  (4 variants)",
              "Input component set  (4 states × 2 sizes)",
              "Icon Button set  (Primary + Ghost × 3 states)",
              "Spacing, radius, shadow swatches",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span style={{ width: 5, height: 5, borderRadius: 9999, background: accent, display: "inline-block", flexShrink: 0 }} />
                <span className="font-mono text-[12px] text-[#555]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="border-b border-[#e8e8e4] px-8 py-4 shrink-0">
          <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">Steps</p>
          <div className="space-y-1.5">
            {[
              "Open Figma Desktop (browser won't work)",
              "Menu bar → Plugins → Development → Open Console",
              "Copy the script below, paste in the console, press Enter",
              "A 'Design System' page appears with everything",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-mono text-[12px] font-black shrink-0" style={{ color: accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[12px] text-[#555] leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Script */}
        <div className="border-b border-[#e8e8e4] px-8 py-3 flex items-center justify-between shrink-0">
          <span className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa]">Script</span>
          <button
            onClick={copy}
            className="font-mono text-[12px] uppercase tracking-widest px-4 py-1.5 transition-colors"
            style={{ background: copied ? "#16a34a" : accent, color: "#fff", border: "none", borderRadius: 3 }}
          >
            {copied ? "✓ Copied!" : "Copy Script"}
          </button>
        </div>
        <pre
          className="flex-1 overflow-y-auto px-8 py-4 min-h-0"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.62rem",
            color: "#666",
            background: "#f8f8f5",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: 1.65,
          }}
        >
          {script}
        </pre>

        {/* Footer */}
        <div className="border-t border-[#e8e8e4] px-8 py-3 shrink-0">
          <p className="font-mono text-[12px] text-[#ccc]">
            Requires Figma Desktop · Inter & JetBrains Mono fonts must be installed in Figma
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
