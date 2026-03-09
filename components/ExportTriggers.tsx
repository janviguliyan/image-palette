"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DesignSystem, SCALE_STEPS } from "@/lib/colorUtils";
import {
  buildTypographyCss, buildSpacingCss, buildRadiusCss, buildShadowCss,
  buildTypographyTailwind, buildSpacingTailwind, buildRadiusTailwind, buildShadowTailwind,
  buildFoundationFigmaTokens,
  TYPOGRAPHY_SCALE, SHADOW_SCALE, SPACING_SCALE, RADIUS_SCALE,
  type OverrideMap,
} from "@/lib/designTokens";
import { buildFigmaPluginScript } from "@/components/FigmaExportModal";

export type ExportType = "css" | "tailwind" | "figma" | "figma-plugin";

// ── CSS / Tailwind / JSON build functions ─────────────────────────────────

function buildCss(ds: DesignSystem, primaryFont: string, secondaryFont: string, overrides: OverrideMap): string {
  const lines: string[] = [":root {"];
  const groups: [string, Record<string, string>][] = [
    ["primary",   ds.scales.primary],
    ["secondary", ds.scales.secondary],
    ["tertiary",  ds.scales.tertiary],
    ["accent",    ds.scales.accent],
    ["gray",      ds.neutral],
    ["success",   ds.semantic.success],
    ["error",     ds.semantic.error],
    ["warning",   ds.semantic.warning],
    ["info",      ds.semantic.info],
  ];
  lines.push("\n  /* ─── Colors ─────────────────────────────────────── */");
  for (const [name, scale] of groups) {
    lines.push(`\n  /* ${name.charAt(0).toUpperCase() + name.slice(1)} */`);
    for (const step of SCALE_STEPS) {
      lines.push(`  --color-${name}-${step}: ${scale[step]};`);
    }
  }
  lines.push(buildTypographyCss(primaryFont, secondaryFont, overrides));
  lines.push(buildSpacingCss());
  lines.push(buildRadiusCss());
  lines.push(buildShadowCss());
  lines.push("\n}");
  return lines.join("\n");
}

function buildTailwind(ds: DesignSystem, primaryFont: string, secondaryFont: string, overrides: OverrideMap): string {
  const groups: [string, Record<string, string>][] = [
    ["primary",   ds.scales.primary],
    ["secondary", ds.scales.secondary],
    ["tertiary",  ds.scales.tertiary],
    ["accent",    ds.scales.accent],
    ["gray",      ds.neutral],
    ["success",   ds.semantic.success],
    ["error",     ds.semantic.error],
    ["warning",   ds.semantic.warning],
    ["info",      ds.semantic.info],
  ];
  const lines = ["// tailwind.config.js → theme.extend", "// Colors", "colors: {"];
  for (const [name, scale] of groups) {
    lines.push(`  ${name}: {`);
    for (const step of SCALE_STEPS) lines.push(`    "${step}": "${scale[step]}",`);
    lines.push("  },");
  }
  lines.push("},");
  lines.push(buildTypographyTailwind(primaryFont, secondaryFont, overrides));
  lines.push(buildSpacingTailwind());
  lines.push(buildRadiusTailwind());
  lines.push(buildShadowTailwind());
  return lines.join("\n");
}

function buildFigmaJSON(ds: DesignSystem, primaryFont: string, secondaryFont: string, overrides: OverrideMap): string {
  const tokens: Record<string, string> = {};
  const groups: [string, Record<string, string>][] = [
    ["primary",   ds.scales.primary],
    ["secondary", ds.scales.secondary],
    ["tertiary",  ds.scales.tertiary],
    ["accent",    ds.scales.accent],
    ["gray",      ds.neutral],
    ["success",   ds.semantic.success],
    ["error",     ds.semantic.error],
    ["warning",   ds.semantic.warning],
    ["info",      ds.semantic.info],
  ];
  for (const [name, scale] of groups) {
    for (const step of SCALE_STEPS) tokens[`color.${name}.${step}`] = scale[step];
  }
  const foundation = buildFoundationFigmaTokens(primaryFont, secondaryFont, overrides);
  Object.assign(tokens, foundation);
  return JSON.stringify(tokens, null, 2);
}

// ── Figma plugin script builder ───────────────────────────────────────────

function toRgb(hex: string) {
  const c = hex.replace("#", "");
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  return {
    r: r3(parseInt(c.slice(0, 2), 16) / 255),
    g: r3(parseInt(c.slice(2, 4), 16) / 255),
    b: r3(parseInt(c.slice(4, 6), 16) / 255),
  };
}
function isLight(hex: string) {
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
      inner, x: parseFloat(m[1]), y: parseFloat(m[2]),
      blur: parseFloat(m[3] || "0"), spread: parseFloat(m[4] || "0"),
      r: r3(parseInt(m[5]) / 255), g: r3(parseInt(m[6]) / 255),
      b: r3(parseInt(m[7]) / 255), a: parseFloat(m[8]),
    };
  }).filter(Boolean);
}

function buildFigmaScript(ds: DesignSystem): string {
  const { scales, neutral, semantic } = ds;
  const colors: Record<string, string> = {};
  const colorGroups: [string, Record<string, string>][] = [
    ["Primary", scales.primary], ["Secondary", scales.secondary],
    ["Tertiary", scales.tertiary], ["Accent", scales.accent],
    ["Neutral", neutral], ["Success", semantic.success],
    ["Error", semantic.error], ["Warning", semantic.warning], ["Info", semantic.info],
  ];
  for (const [g, scale] of colorGroups)
    for (const [step, hex] of Object.entries(scale))
      colors[`${g}/${step}`] = hex as string;

  const typography = TYPOGRAPHY_SCALE.map(t => {
    const style = t.family === "mono" ? "Regular" :
      t.weight >= 900 ? "Black" : t.weight >= 700 ? "Bold" :
      t.weight >= 600 ? "SemiBold" : t.weight >= 500 ? "Medium" : "Regular";
    const family = t.family === "mono" ? "JetBrains Mono" : "Inter";
    const sizePx = t.sizeDesktop.includes("clamp")
      ? (t.name === "Display" ? 60 : t.name === "H1" ? 48 : t.name === "H2" ? 36 : t.name === "H3" ? 28 : 24)
      : Math.round(parseFloat(t.sizeDesktop) * 16);
    const lhNum = parseFloat(t.lineHeight);
    const lhPx = Math.round(sizePx * (isNaN(lhNum) ? 1.5 : lhNum));
    const lsNum = parseFloat(t.letterSpacing || "0");
    const lsPct = isNaN(lsNum) ? 0 : Math.round(lsNum * 100 * 10) / 10;
    return { name: t.name, family, style, size: sizePx, lhPx, lsPct };
  });

  const shadows = SHADOW_SCALE.map(s => ({
    name: s.name, usage: s.usage,
    layers: parseShadowCss(s.value),
  }));

  const spacing = SPACING_SCALE.map(s => ({ name: s.name, px: s.px }));
  const radius = RADIUS_SCALE.map(r => ({
    name: r.name,
    px: Math.min(parseInt(r.value) || 0, 9999),
    show: Math.min(parseInt(r.value) || 0, 28),
  }));

  const p500 = scales.primary["500"], p50 = scales.primary["50"];
  const p100 = scales.primary["100"], p200 = scales.primary["200"];
  const p600 = scales.primary["600"], p700 = scales.primary["700"];
  const e500 = semantic.error["500"], e50 = semantic.error["50"];
  const e200 = semantic.error["200"], e600 = semantic.error["600"], e700 = semantic.error["700"];
  const pRgb = toRgb(p500), p50Rgb = toRgb(p50), p100Rgb = toRgb(p100);
  const p200Rgb = toRgb(p200), p600Rgb = toRgb(p600), p700Rgb = toRgb(p700);
  const pTextRgb = isLight(p500) ? { r: 0.04, g: 0.04, b: 0.04 } : { r: 1, g: 1, b: 1 };
  const eRgb = toRgb(e500), e50Rgb = toRgb(e50), e200Rgb = toRgb(e200);
  const e600Rgb = toRgb(e600), e700Rgb = toRgb(e700);
  const eTextRgb = isLight(e500) ? { r: 0.04, g: 0.04, b: 0.04 } : { r: 1, g: 1, b: 1 };

  const pal = {
    bar: pRgb, textDark: { r: 0.04, g: 0.04, b: 0.04 },
    textMid: { r: 0.40, g: 0.40, b: 0.40 }, textLight: { r: 0.65, g: 0.65, b: 0.65 },
    divider: { r: 0.88, g: 0.88, b: 0.88 }, rowLine: { r: 0.93, g: 0.93, b: 0.93 },
    white: { r: 1, g: 1, b: 1 }, pageBg: { r: 0.97, g: 0.97, b: 0.97 },
  };

  const B = (name: string, bg: object | null, text: object, border: object | null, padX: number, padY: number, fs: number, disabled: boolean) =>
    ({ name, bg, text, border, padX, padY, fs, disabled });
  const buttons = [
    B("Type=Primary, Size=LG, State=Default",   pRgb,    pTextRgb, null,     18, 10, 13, false),
    B("Type=Primary, Size=LG, State=Hover",      p600Rgb, pTextRgb, null,     18, 10, 13, false),
    B("Type=Primary, Size=LG, State=Disabled",   pRgb,    pTextRgb, null,     18, 10, 13, true ),
    B("Type=Primary, Size=SM, State=Default",    pRgb,    pTextRgb, null,     12,  6, 11, false),
    B("Type=Primary, Size=SM, State=Hover",      p600Rgb, pTextRgb, null,     12,  6, 11, false),
    B("Type=Primary, Size=SM, State=Disabled",   pRgb,    pTextRgb, null,     12,  6, 11, true ),
    B("Type=Secondary, Size=LG, State=Default",  p50Rgb,  p700Rgb,  p200Rgb,  18, 10, 13, false),
    B("Type=Secondary, Size=LG, State=Hover",    p100Rgb, p700Rgb,  pRgb,     18, 10, 13, false),
    B("Type=Secondary, Size=LG, State=Disabled", p50Rgb,  p700Rgb,  p200Rgb,  18, 10, 13, true ),
    B("Type=Ghost, Size=LG, State=Default",      null,    p700Rgb,  p200Rgb,  18, 10, 13, false),
    B("Type=Ghost, Size=LG, State=Hover",        p50Rgb,  p700Rgb,  pRgb,     18, 10, 13, false),
    B("Type=Ghost, Size=LG, State=Disabled",     null,    p700Rgb,  p200Rgb,  18, 10, 13, true ),
    B("Type=Danger, Size=LG, State=Default",     eRgb,    eTextRgb, null,     18, 10, 13, false),
    B("Type=Danger, Size=LG, State=Hover",       e600Rgb, eTextRgb, null,     18, 10, 13, false),
    B("Type=Danger, Size=LG, State=Disabled",    eRgb,    eTextRgb, null,     18, 10, 13, true ),
  ];

  const data = { colors, typography, shadows, spacing, radius, pal,
    colorCount: Object.keys(colors).length, typoCount: TYPOGRAPHY_SCALE.length, shadowCount: SHADOW_SCALE.length,
    buttons };
  const json = JSON.stringify(data);

  return [
    "// ═══════════════════════════════════════════════════════════════",
    "// Design System — generated by Design System Generator",
    "// HOW TO RUN:",
    "//   1. Open Figma Desktop",
    "//   2. Plugins → Development → Open Console",
    "//   3. Paste this entire script and press Enter",
    "// ═══════════════════════════════════════════════════════════════",
    "(async function() {",
    "var DS = " + json + ";",
    "var P = DS.pal;",
    "function hx(h){var c=h.replace('#','');return {r:parseInt(c.slice(0,2),16)/255,g:parseInt(c.slice(2,4),16)/255,b:parseInt(c.slice(4,6),16)/255};}",
    "",
    "// Paint styles",
    "var eps={};figma.getLocalPaintStyles().forEach(function(s){eps[s.name]=s;});",
    "for(var cn in DS.colors){if(eps[cn])eps[cn].remove();var ps=figma.createPaintStyle();ps.name=cn;ps.paints=[{type:'SOLID',color:hx(DS.colors[cn])}];}",
    "",
    "// Load fonts",
    "var FONTS=[{family:'Inter',style:'Black'},{family:'Inter',style:'Bold'},{family:'Inter',style:'SemiBold'},{family:'Inter',style:'Medium'},{family:'Inter',style:'Regular'},{family:'JetBrains Mono',style:'Regular'}];",
    "var loaded={};",
    "for(var fi=0;fi<FONTS.length;fi++){try{await figma.loadFontAsync(FONTS[fi]);loaded[FONTS[fi].family+'/'+FONTS[fi].style]=1;}catch(e){}}",
    "function fn(fam,sty){return loaded[fam+'/'+sty]?{family:fam,style:sty}:{family:'Inter',style:'Regular'};}",
    "",
    "// Text styles",
    "var ets={};figma.getLocalTextStyles().forEach(function(s){ets[s.name]=s;});",
    "for(var ti=0;ti<DS.typography.length;ti++){var tp=DS.typography[ti];var sn='Typography/'+tp.name;if(ets[sn])ets[sn].remove();try{var ts=figma.createTextStyle();ts.name=sn;ts.fontName=fn(tp.family,tp.style);ts.fontSize=tp.size;ts.lineHeight={value:tp.lhPx,unit:'PIXELS'};if(tp.lsPct!==0)ts.letterSpacing={value:tp.lsPct,unit:'PERCENT'};}catch(e){}}",
    "",
    "// Effect styles",
    "var ees={};figma.getLocalEffectStyles().forEach(function(s){ees[s.name]=s;});",
    "for(var si=0;si<DS.shadows.length;si++){var sh=DS.shadows[si];if(!sh.layers.length)continue;var en='Elevation/'+sh.name;if(ees[en])ees[en].remove();try{var es=figma.createEffectStyle();es.name=en;es.effects=sh.layers.map(function(l){return{type:l.inner?'INNER_SHADOW':'DROP_SHADOW',color:{r:l.r,g:l.g,b:l.b,a:l.a},offset:{x:l.x,y:l.y},radius:l.blur,spread:l.spread,visible:true,blendMode:'NORMAL'};});}catch(e){}}",
    "",
    "figma.notify('Design System ready — '+DS.colorCount+' colors, '+DS.typoCount+' type styles!',{timeout:5000});",
    "})();",
  ].join("\n");
}

// ── Modal ────────────────────────────────────────────────────────────────

const STEPS: Partial<Record<ExportType, string[]>> = {
  css: [
    "Paste the :root { } block into your global stylesheet (globals.css or app.css)",
    "All design tokens available as CSS custom properties: colors, typography, spacing, radius, shadows",
    "Colors: var(--color-primary-500) · Typography: var(--text-h1) · Fonts: var(--font-primary)",
  ],
  tailwind: [
    "Open tailwind.config.js (or tailwind.config.ts) at the root of your project",
    "Inside theme.extend, paste the snippet — colors, fontFamily, fontSize, spacing, borderRadius, boxShadow",
    "Restart your dev server: npm run dev",
    "Use: bg-primary-500, text-h1, font-primary, p-4, rounded-md, shadow-lg",
  ],
  figma: [
    'Install "Tokens Studio" plugin from the Figma Community',
    "Open the plugin → Import JSON → Paste the copied JSON",
    "Tokens appear in Local Variables — apply via the Variables panel (Shift+V)",
  ],
  "figma-plugin": [
    "Open Figma Desktop (browser won't work for this)",
    "Menu bar → Plugins → Development → Open Console",
    "Copy the script below, paste it in the console, press Enter",
    "A 'Design System' page appears with color styles, text styles, and components",
  ],
};

const TAB_LABELS: Record<ExportType, string> = {
  css:          "CSS Variables",
  tailwind:     "Tailwind Config",
  figma:        "Figma JSON",
  "figma-plugin": "Open in Figma",
};

interface ModalProps {
  ds: DesignSystem;
  primaryFont: string;
  secondaryFont: string;
  overrides: OverrideMap;
  triggeredType: ExportType;
  onClose: () => void;
}

export function ExportModal({ ds, primaryFont, secondaryFont, overrides, triggeredType, onClose }: ModalProps) {
  const [activeTab, setActiveTab] = useState<ExportType>(triggeredType);
  const [copied, setCopied]       = useState<ExportType | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const getContent = (t: ExportType): string => {
    if (t === "css")          return buildCss(ds, primaryFont, secondaryFont, overrides);
    if (t === "tailwind")     return buildTailwind(ds, primaryFont, secondaryFont, overrides);
    if (t === "figma")        return buildFigmaJSON(ds, primaryFont, secondaryFont, overrides);
    return buildFigmaPluginScript(ds, primaryFont, secondaryFont);
  };

  const copyTab = async (t: ExportType) => {
    const content = getContent(t);
    try { await navigator.clipboard.writeText(content); } catch {
      const el = document.createElement("textarea");
      el.value = content; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  const TABS: ExportType[] = ["css", "tailwind", "figma", "figma-plugin"];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: "rgba(10,10,10,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-[#f9f9f7] w-full max-w-2xl flex flex-col border-2 border-[#0a0a0a]"
        style={{ maxHeight: "90vh", boxShadow: "6px 6px 0 #0a0a0a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-[#0a0a0a] px-6 md:px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-1">
              Export Design System
            </p>
            <p className="font-mono text-[13px] text-[#0a0a0a]">
              Colors · Typography · Spacing · Radius · Shadows
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[12px] uppercase tracking-widest text-[#888] hover:text-[#0a0a0a] transition-colors border border-transparent hover:border-[#e8e8e4] px-3 py-1.5"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab bar — 4 tabs */}
        <div className="border-b border-[#0a0a0a] flex shrink-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-4 py-3 font-mono text-[12px] uppercase tracking-widest border-r border-[#0a0a0a] last:border-r-0 transition-colors whitespace-nowrap flex-1"
              style={{
                backgroundColor: activeTab === t ? "#0a0a0a" : "transparent",
                color: activeTab === t ? "#ffffff" : "#888",
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Steps */}
          {STEPS[activeTab] && (
            <div className="px-6 md:px-8 py-5 border-b border-[#e8e8e4]">
              <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">How to use</p>
              <ol className="space-y-2">
                {STEPS[activeTab]!.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-[12px] text-[#ccc] shrink-0 w-4 mt-0.5">{i + 1}.</span>
                    <span className="font-mono text-[12px] text-[#444] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              {
                activeTab === "figma-plugin" && (
                  <div className="relative w-[60%] aspect-video overflow-hidden bg-black my-4">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/_i8xr0NiPP8?autoplay=1"
                      title="Demo video"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )
              }
            </div>
          )}

          {/* Code header */}
          <div className="px-6 md:px-8 py-3 border-b border-[#e8e8e4] flex items-center justify-between">
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa]">
              {TAB_LABELS[activeTab]}
            </p>
            <button
              onClick={() => copyTab(activeTab)}
              className="font-mono text-[12px] uppercase tracking-widest border px-3 py-1.5 flex items-center gap-1.5 transition-colors"
              style={{
                borderColor: copied === activeTab ? "#16a34a" : "#e8e8e4",
                color:       copied === activeTab ? "#16a34a" : "#888",
              }}
            >
              {copied === activeTab ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* Code block */}
          <pre
            className="px-6 md:px-8 py-5 font-mono text-[12px] text-[#555] leading-relaxed overflow-x-auto whitespace-pre"
            style={{ background: "#f4f4f2", minHeight: 200 }}
          >
            {getContent(activeTab)}
          </pre>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── ExportTriggers ────────────────────────────────────────────────────────

interface Props {
  ds: DesignSystem;
  primaryFont?: string;
  secondaryFont?: string;
  typographyOverrides?: OverrideMap;
  /** Optional controlled tab from parent (e.g. header button) */
  externalTab?: ExportType | null;
  onExternalClose?: () => void;
}

export default function ExportTriggers({
  ds,
  primaryFont       = "Inter",
  secondaryFont     = "Roboto",
  typographyOverrides = {},
  externalTab,
  onExternalClose,
}: Props) {
  const [internalTab, setInternalTab] = useState<ExportType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // External tab (header button) takes priority over internal
  const activeTab  = externalTab ?? internalTab;
  const closeModal = () => { setInternalTab(null); onExternalClose?.(); };

  const handleClick = (type: ExportType) => {
    setInternalTab(type);
  };

  const BTNS: { type: ExportType; label: string; subLabel: string }[] = [
    { type: "css",          label: "CSS Variables",  subLabel: "var(--color-primary-500)" },
    { type: "tailwind",     label: "Tailwind Config", subLabel: "bg-primary-500, font-primary" },
    { type: "figma",        label: "Figma JSON",      subLabel: "color.primary.500, font.primary" },
    { type: "figma-plugin", label: "Open in Figma",   subLabel: "Run plugin script in console" },
  ];

  return (
    <>
      <div className="border-t-2 border-[#0a0a0a] flex flex-col sm:flex-row">
        {/* Label cell */}
        <div className="border-b sm:border-b-0 sm:border-r-2 border-[#0a0a0a] px-8 md:px-12 py-7 flex items-center shrink-0">
          <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#888]">Export As</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x divide-[#e8e8e4]">
          {BTNS.map(({ type, label, subLabel }) => (
            <button
              key={type}
              onClick={() => handleClick(type)}
              className="group flex-1 flex items-center gap-4 px-6 md:px-8 py-6 hover:bg-[#f0f0ec] transition-colors text-left"
            >
              <div className="w-9 h-9 border-2 border-[#0a0a0a] flex items-center justify-center shrink-0 transition-all group-hover:bg-[#0a0a0a]">
                {type === "figma-plugin" ? (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"
                    className="transition-colors group-hover:stroke-white stroke-[#0a0a0a]">
                    <path d="M6 1v7M3 5l3 3 3-3" strokeWidth="1.2" strokeLinecap="square"/>
                    <path d="M1.5 10h9" strokeWidth="1.2" strokeLinecap="square"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"
                    className="transition-colors group-hover:stroke-white stroke-[#0a0a0a]">
                    <path d="M6 1v7M3 5l3 3 3-3" strokeWidth="1.2" strokeLinecap="square"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#0a0a0a]">{label}</p>
                <p className="font-mono text-[12px] text-[#aaa] mt-0.5">{subLabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {mounted && activeTab && (
        <ExportModal
          ds={ds}
          primaryFont={primaryFont}
          secondaryFont={secondaryFont}
          overrides={typographyOverrides}
          triggeredType={activeTab}
          onClose={closeModal}
        />
      )}
    </>
  );
}
