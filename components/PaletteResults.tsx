"use client";

import { useState } from "react";
import { DesignSystem, getContrastColor, hexToRgba } from "@/lib/colorUtils";

export type PaletteTheme = "light" | "dark";

type RoleKey = "primary" | "secondary" | "tertiary" | "accent";

interface Props {
  ds: DesignSystem;
  imageUrl: string | null;
  inputSource: "image" | "manual";
  theme: PaletteTheme;
  onThemeChange: (t: PaletteTheme) => void;
  /** When provided (manual mode), only these roles appear as palette cards */
  explicitRoleKeys?: RoleKey[];
}

interface UsageRow {
  label: string;
  hex: string;
  shade: string;
  description: string;
}

function getUsageRows(ds: DesignSystem, theme: PaletteTheme): UsageRow[] {
  const { scales, neutral, semantic } = ds;
  if (theme === "light") {
    return [
      { label: "Page Background", hex: neutral["50"],          shade: "Gray 50",       description: "App & page base layer" },
      { label: "Surface / Card",  hex: "#ffffff",              shade: "White",          description: "Cards, modals, panels" },
      { label: "Body Text",       hex: neutral["900"],         shade: "Gray 900",       description: "Primary readable copy" },
      { label: "Secondary Text",  hex: neutral["500"],         shade: "Gray 500",       description: "Captions, metadata, hints" },
      { label: "Border",          hex: neutral["200"],         shade: "Gray 200",       description: "Dividers, input outlines" },
      { label: "Brand CTA",       hex: scales.primary["500"], shade: "Primary 500",    description: "Buttons, links, key actions" },
      { label: "CTA Hover",       hex: scales.primary["600"], shade: "Primary 600",    description: "Hover & active states" },
      { label: "Secondary Action",hex: scales.secondary["500"],shade:"Secondary 500",  description: "Supporting interactions" },
      { label: "Accent",          hex: scales.accent["500"],  shade: "Accent 500",     description: "Badges, highlights, chips" },
      { label: "Success",         hex: semantic.success["500"],shade:"Success 500",    description: "Confirmations, positive" },
      { label: "Error",           hex: semantic.error["500"], shade: "Error 500",      description: "Errors, destructive actions" },
      { label: "Warning",         hex: semantic.warning["500"],shade:"Warning 500",    description: "Alerts, cautions" },
    ];
  }
  return [
    { label: "Page Background", hex: neutral["900"],          shade: "Gray 900",       description: "App & page base layer" },
    { label: "Surface / Card",  hex: neutral["800"],          shade: "Gray 800",       description: "Cards, modals, panels" },
    { label: "Body Text",       hex: neutral["50"],           shade: "Gray 50",        description: "Primary readable copy" },
    { label: "Secondary Text",  hex: neutral["400"],          shade: "Gray 400",       description: "Captions, metadata, hints" },
    { label: "Border",          hex: neutral["700"],          shade: "Gray 700",       description: "Dividers, input outlines" },
    { label: "Brand CTA",       hex: scales.primary["400"],  shade: "Primary 400",    description: "Buttons, links, key actions" },
    { label: "CTA Hover",       hex: scales.primary["300"],  shade: "Primary 300",    description: "Hover & active states" },
    { label: "Secondary Action",hex: scales.secondary["400"],shade:"Secondary 400",   description: "Supporting interactions" },
    { label: "Accent",          hex: scales.accent["400"],   shade: "Accent 400",     description: "Badges, highlights, chips" },
    { label: "Success",         hex: semantic.success["400"],shade:"Success 400",     description: "Confirmations, positive" },
    { label: "Error",           hex: semantic.error["400"],  shade: "Error 400",      description: "Errors, destructive actions" },
    { label: "Warning",         hex: semantic.warning["400"],shade:"Warning 400",     description: "Alerts, cautions" },
  ];
}

const ROLES = [
  { key: "primary" as const,   label: "Primary",   desc: "Dominant brand color" },
  { key: "secondary" as const, label: "Secondary",  desc: "Supporting brand color" },
  { key: "tertiary" as const,  label: "Tertiary",   desc: "Additional brand tone" },
  { key: "accent" as const,    label: "Accent",     desc: "Highlight & emphasis" },
];

export default function PaletteResults({ ds, imageUrl, inputSource, theme, onThemeChange, explicitRoleKeys }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [paletteCopied, setPaletteCopied] = useState(false);

  const isDark = theme === "dark";

  // Filter palette cards to only explicitly entered roles (manual mode)
  const visibleRoles = explicitRoleKeys
    ? ROLES.filter(({ key }) => explicitRoleKeys.includes(key))
    : ROLES;

  // Themed panel colors
  const panelBg    = isDark ? "#111111" : "#f9f9f7";
  const panelFg    = isDark ? "#f0f0ee" : "#0a0a0a";
  const panelMuted = isDark ? "#666666" : "#888888";
  const panelBdr   = isDark ? "#2a2a2a" : "#e8e8e4";

  const copy = async (hex: string) => {
    try { await navigator.clipboard.writeText(hex); } catch {
      const el = document.createElement("textarea");
      el.value = hex; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 1600);
  };

  const copyPalette = async () => {
    const text = visibleRoles.map(({ key, label }) => `${label}: ${ds.roles[key].toUpperCase()}`).join("\n");
    try { await navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setPaletteCopied(true);
    setTimeout(() => setPaletteCopied(false), 2000);
  };

  const usageRows = getUsageRows(ds, theme);

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#0a0a0a]">

        {/* ── LEFT: Source ── */}
        <div className="flex flex-col">
          {/* Label */}
          <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#888]">
              {inputSource === "image" ? "Source Image" : "Input Colors"}
            </p>
          </div>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Source"
              className="w-full object-cover object-center"
              style={{ maxHeight: 560, minHeight: 320 }}
            />
          ) : (
            /* Manual input visual */
            <div className="flex-1 flex flex-col gap-0">
              {/* Color band */}
              <div className="flex h-32 border-b border-[#0a0a0a]">
                {ROLES.map(({ key }, i) => (
                  <div
                    key={key}
                    className="flex-1"
                    style={{
                      backgroundColor: ds.roles[key],
                      borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    }}
                  />
                ))}
              </div>
              {/* Detail rows */}
              <div className="px-8 md:px-12 py-8 space-y-4">
                {ROLES.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 shrink-0 border border-[#e8e8e4]"
                      style={{ backgroundColor: ds.roles[key] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#888]">{label}</p>
                      <p className="font-mono text-[11px] text-[#0a0a0a]">{ds.roles[key].toUpperCase()}</p>
                    </div>
                    <p className="font-mono text-[8px] text-[#bbb] text-right">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Palette + Usage ── */}
        <div className="flex flex-col transition-colors duration-300" style={{ backgroundColor: panelBg }}>

          {/* Header + theme toggle */}
          <div
            className="border-b px-8 md:px-12 py-4 flex items-center justify-between"
            style={{ borderColor: panelBdr }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: panelMuted }}>
              Palette
            </p>
            {/* Light / Dark toggle */}
            <div
              className="flex border"
              style={{ borderColor: isDark ? "#444" : "#0a0a0a" }}
            >
              {(["light", "dark"] as PaletteTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className="font-mono text-[9px] uppercase tracking-widest px-3.5 py-1.5 transition-all"
                  style={{
                    backgroundColor: theme === t ? panelFg : "transparent",
                    color: theme === t ? panelBg : panelMuted,
                    borderRight: t === "light" ? `1px solid ${isDark ? "#444" : "#0a0a0a"}` : "none",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Role cards */}
          <div className="px-8 md:px-12 pt-8 pb-4 flex flex-col gap-0">
            {visibleRoles.map(({ key, label, desc }, i) => {
              const hex = ds.roles[key];
              const isCopied = copied === hex;
              const contrast = getContrastColor(hex);
              return (
                <div
                  key={key}
                  className="flex items-center gap-5 py-4 border-b transition-colors"
                  style={{ borderColor: panelBdr }}
                >
                  {/* Swatch — clickable */}
                  <button
                    onClick={() => copy(hex)}
                    title={`Copy ${hex}`}
                    className="w-14 h-14 shrink-0 flex items-center justify-center relative group overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.97]"
                    style={{ backgroundColor: hex }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: hexToRgba(contrast === "#ffffff" ? "#000" : "#fff", 0.12) }}
                    />
                    {isCopied && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8l4 4 8-8" stroke={contrast} strokeWidth="2" strokeLinecap="square" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[8px] uppercase tracking-[0.35em] mb-0.5" style={{ color: panelMuted }}>
                      {label}
                    </p>
                    <p className="font-mono text-[14px] font-semibold leading-none" style={{ color: panelFg }}>
                      {hex.toUpperCase()}
                    </p>
                    <p className="font-mono text-[8px] mt-1" style={{ color: panelMuted }}>
                      {desc}
                    </p>
                  </div>

                  {/* Copy chip */}
                  <button
                    onClick={() => copy(hex)}
                    className="font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 border shrink-0 transition-all"
                    style={{
                      borderColor: isCopied ? "#16a34a" : panelBdr,
                      color: isCopied ? "#16a34a" : panelMuted,
                      backgroundColor: "transparent",
                    }}
                  >
                    {isCopied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              );
            })}

            {/* Copy all */}
            {visibleRoles.length > 1 && (
              <button
                onClick={copyPalette}
                className="mt-5 self-start font-mono text-[9px] uppercase tracking-widest border px-5 py-2.5 transition-all"
                style={{
                  borderColor: paletteCopied ? "#16a34a" : (isDark ? "#444" : "#0a0a0a"),
                  color: paletteCopied ? "#16a34a" : panelFg,
                  backgroundColor: "transparent",
                }}
              >
                {paletteCopied ? "✓ Palette Copied" : "↑ Copy All Hex Values"}
              </button>
            )}
          </div>

          {/* ── Color Usage Context ── */}
          <div className="border-t mt-4" style={{ borderColor: panelBdr }}>
            <div
              className="px-8 md:px-12 py-4 border-b flex items-center justify-between"
              style={{ borderColor: panelBdr }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: panelMuted }}>
                Color Usage — {theme === "light" ? "Light Theme" : "Dark Theme"}
              </p>
              <p className="font-mono text-[8px]" style={{ color: panelMuted }}>
                Click to copy
              </p>
            </div>

            <div className="px-8 md:px-12 py-5 space-y-3.5">
              {usageRows.map(({ label, hex, shade, description }) => (
                <button
                  key={label}
                  onClick={() => copy(hex)}
                  className="w-full flex items-center gap-3.5 group text-left"
                >
                  {/* Swatch */}
                  <div
                    className="w-6 h-6 shrink-0 border transition-transform group-hover:scale-110"
                    style={{ backgroundColor: hex, borderColor: panelBdr }}
                  />
                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-widest leading-none" style={{ color: panelFg }}>
                      {label}
                    </p>
                    <p className="font-mono text-[8px] leading-none mt-0.5" style={{ color: panelMuted }}>
                      {shade} — {description}
                    </p>
                  </div>
                  {/* Hex on hover */}
                  <span
                    className="font-mono text-[8px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: copied === hex ? "#16a34a" : panelMuted }}
                  >
                    {copied === hex ? "✓" : hex}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
