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

function buildDS(ds: DesignSystem) {
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
  const typography = TYPOGRAPHY_SCALE.map(t => {
    const style =
      t.family === "mono" ? "Regular" :
      t.weight >= 900 ? "Black" : t.weight >= 800 ? "ExtraBold" :
      t.weight >= 700 ? "Bold"  : t.weight >= 600 ? "SemiBold"  :
      t.weight >= 500 ? "Medium" : "Regular";
    const family = t.family === "mono" ? "JetBrains Mono" : "Inter";
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

  // Buttons: Type × Size × State
  const B = (name: string, bg: object|null, text: object, border: object|null, padX: number, padY: number, fs: number, disabled: boolean) =>
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
    B("Type=Secondary, Size=SM, State=Default",  p50Rgb,  p700Rgb,  p200Rgb,  12,  6, 11, false),
    B("Type=Secondary, Size=SM, State=Hover",    p100Rgb, p700Rgb,  pRgb,     12,  6, 11, false),
    B("Type=Secondary, Size=SM, State=Disabled", p50Rgb,  p700Rgb,  p200Rgb,  12,  6, 11, true ),
    B("Type=Ghost, Size=LG, State=Default",      null,    p700Rgb,  p200Rgb,  18, 10, 13, false),
    B("Type=Ghost, Size=LG, State=Hover",        p50Rgb,  p700Rgb,  pRgb,     18, 10, 13, false),
    B("Type=Ghost, Size=LG, State=Disabled",     null,    p700Rgb,  p200Rgb,  18, 10, 13, true ),
    B("Type=Ghost, Size=SM, State=Default",      null,    p700Rgb,  p200Rgb,  12,  6, 11, false),
    B("Type=Ghost, Size=SM, State=Hover",        p50Rgb,  p700Rgb,  pRgb,     12,  6, 11, false),
    B("Type=Ghost, Size=SM, State=Disabled",     null,    p700Rgb,  p200Rgb,  12,  6, 11, true ),
    B("Type=Danger, Size=LG, State=Default",     eRgb,    eTextRgb, null,     18, 10, 13, false),
    B("Type=Danger, Size=LG, State=Hover",       e600Rgb, eTextRgb, null,     18, 10, 13, false),
    B("Type=Danger, Size=LG, State=Disabled",    eRgb,    eTextRgb, null,     18, 10, 13, true ),
    B("Type=Danger, Size=SM, State=Default",     eRgb,    eTextRgb, null,     12,  6, 11, false),
    B("Type=Danger, Size=SM, State=Hover",       e600Rgb, eTextRgb, null,     12,  6, 11, false),
    B("Type=Danger, Size=SM, State=Disabled",    eRgb,    eTextRgb, null,     12,  6, 11, true ),
  ];

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
    components: { buttons, badges, alerts },
  };
}

// ── Generate the complete Figma plugin script ─────────────────────────────────
// All data is JSON-embedded. The generated JS is 100% static — no regex, no
// template literals, no nested string building. This is why it won't throw.

function buildFigmaPluginScript(ds: DesignSystem): string {
  const data = buildDS(ds);
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
    "var FONTS = [",
    "  {family:'Inter',style:'Black'},{family:'Inter',style:'ExtraBold'},",
    "  {family:'Inter',style:'Bold'},{family:'Inter',style:'SemiBold'},",
    "  {family:'Inter',style:'Medium'},{family:'Inter',style:'Regular'},",
    "  {family:'JetBrains Mono',style:'Regular'}",
    "];",
    "var loaded = {};",
    "for (var fi = 0; fi < FONTS.length; fi++) {",
    "  try { await figma.loadFontAsync(FONTS[fi]); loaded[FONTS[fi].family+'/'+FONTS[fi].style]=1; }",
    "  catch(e) { console.warn('Font unavailable:', FONTS[fi].family, FONTS[fi].style); }",
    "}",
    "function fn(fam, sty) {",
    "  if (loaded[fam+'/'+sty]) return {family:fam, style:sty};",
    "  return {family:'Inter', style:'Regular'};",
    "}",
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
    "while (pg.children.length > 0) pg.children[0].remove();",
    "try { pg.backgrounds = [{type:'SOLID',color:P.pageBg}]; } catch(e) {}",
    "",
    "var PAD = 80;",
    "var WIDE = 1400;",
    "var cy = PAD;",
    "",
    "// Helper: text node appended to pg",
    "function mktxt(chars, fam, sty, size, color, x, y) {",
    "  var t = figma.createText();",
    "  t.fontName = fn(fam, sty);",
    "  t.fontSize = size;",
    "  t.characters = String(chars);",
    "  t.fills = [{type:'SOLID', color:color}];",
    "  t.x = x; t.y = y;",
    "  pg.appendChild(t);",
    "  return t;",
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
    "cy += 8;",
    "cy = mksec('Components / Buttons', cy);",
    "var btnComps = [];",
    "var btnBx = PAD; var btnBy = cy;",
    "for (var bi = 0; bi < DS.components.buttons.length; bi++) {",
    "  var bd = DS.components.buttons[bi];",
    "  var bc = figma.createComponent();",
    "  bc.name = bd.name;",
    "  bc.layoutMode = 'HORIZONTAL';",
    "  bc.primaryAxisSizingMode = 'AUTO';",
    "  bc.counterAxisSizingMode = 'AUTO';",
    "  bc.paddingLeft = bc.paddingRight = bd.padX;",
    "  bc.paddingTop = bc.paddingBottom = bd.padY;",
    "  bc.cornerRadius = 6;",
    "  bc.itemSpacing = 6;",
    "  bc.primaryAxisAlignItems = 'CENTER';",
    "  bc.counterAxisAlignItems = 'CENTER';",
    "  bc.fills = bd.bg ? [{type:'SOLID',color:bd.bg}] : [];",
    "  if (bd.border) { bc.strokes=[{type:'SOLID',color:bd.border}]; bc.strokeWeight=1.5; bc.strokeAlign='INSIDE'; }",
    "  bc.opacity = bd.disabled ? 0.4 : 1;",
    "  var blabel = bd.name.split(',')[0].split('=')[1] || 'Btn';",
    "  var bt = figma.createText();",
    "  bt.fontName = fn('Inter','SemiBold'); bt.fontSize = bd.fs;",
    "  bt.characters = blabel; bt.fills = [{type:'SOLID',color:bd.text}];",
    "  bc.appendChild(bt);",
    "  bc.x = btnBx + (bi % 6) * 140;",
    "  bc.y = btnBy + Math.floor(bi / 6) * 56;",
    "  pg.appendChild(bc);",
    "  btnComps.push(bc);",
    "}",
    "if (btnComps.length) {",
    "  try {",
    "    var btnSet = figma.combineAsVariants(btnComps, pg);",
    "    btnSet.name = 'Button'; btnSet.x = PAD; btnSet.y = cy;",
    "    cy += btnSet.height + 56;",
    "  } catch(e) { console.error('Button set failed:', e); cy = btnBy + Math.ceil(DS.components.buttons.length / 6) * 56 + 56; }",
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
    "  bdt.fontName = fn('Inter','SemiBold'); bdt.fontSize = 10;",
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
    "  altitle.fontName = fn('Inter','Bold'); altitle.fontSize = 13;",
    "  altitle.characters = al.label;",
    "  altitle.fills = [{type:'SOLID',color:al.text}];",
    "  alc.appendChild(altitle);",
    "  var albody = figma.createText();",
    "  albody.fontName = fn('Inter','Regular'); albody.fontSize = 12;",
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
    "figma.viewport.scrollAndZoomIntoView(pg.children);",
    "figma.notify('Design System ready — '+Object.keys(DS.colors).length+' colors, '+DS.typography.length+' type styles, Button+Badge+Alert components!', {timeout:6000});",
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
    "//   Components    — Button (4 types × 2 sizes × 3 states), Badge (6 × 2), Alert (4)",
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
              "Button component set  (4×2×3 variants)",
              "Badge component set  (6×2 variants)",
              "Alert component set  (4 variants)",
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
