"use client";

import { useState } from "react";
import { DesignSystem, getContrastColor } from "@/lib/colorUtils";
import type { PaletteTheme } from "@/components/PaletteResults";

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
      { label: "Page Background", hex: neutral["50"],           shade: "Grey 50",      description: "App & page base layer" },
      { label: "Surface/Card",    hex: "#ffffff",               shade: "White",         description: "Cards, modals, panels" },
      { label: "Body Text",       hex: neutral["900"],          shade: "Grey 900",      description: "Primary readable copy" },
      { label: "Secondary Text",  hex: neutral["500"],          shade: "Grey 500",      description: "Captions, metadata, hints" },
      { label: "Border",          hex: neutral["200"],          shade: "Grey 200",      description: "Dividers, rules, input outlines" },
      { label: "Brand CTA",       hex: scales.primary["500"],  shade: "Primary 500",   description: "Buttons, links, key actions" },
      { label: "CTA Hover",       hex: scales.primary["600"],  shade: "Primary 600",   description: "Hover & active states" },
      { label: "Secondary Action",hex: scales.secondary["500"],shade: "Secondary 500", description: "Supporting interactions" },
      { label: "Accent",          hex: scales.accent["500"],   shade: "Accent 500",    description: "Badges, highlights & chips" },
      { label: "Success",         hex: semantic.success["500"],shade: "Success 500",   description: "Confirmations, positives" },
      { label: "Error",           hex: semantic.error["500"],  shade: "Error 500",     description: "Errors, destructive actions" },
      { label: "Warning",         hex: semantic.warning["500"],shade: "Warning 500",   description: "Alerts, cautions" },
    ];
  }
  return [
    { label: "Page Background", hex: neutral["900"],           shade: "Grey 900",      description: "App & page base layer" },
    { label: "Surface/Card",    hex: neutral["800"],           shade: "Grey 800",      description: "Cards, modals, panels" },
    { label: "Body Text",       hex: neutral["50"],            shade: "Grey 50",       description: "Primary readable copy" },
    { label: "Secondary Text",  hex: neutral["400"],           shade: "Grey 400",      description: "Captions, metadata, hints" },
    { label: "Border",          hex: neutral["700"],           shade: "Grey 700",      description: "Dividers, rules, input outlines" },
    { label: "Brand CTA",       hex: scales.primary["400"],   shade: "Primary 400",   description: "Buttons, links, key actions" },
    { label: "CTA Hover",       hex: scales.primary["300"],   shade: "Primary 300",   description: "Hover & active states" },
    { label: "Secondary Action",hex: scales.secondary["400"], shade: "Secondary 400", description: "Supporting interactions" },
    { label: "Accent",          hex: scales.accent["400"],    shade: "Accent 400",    description: "Badges, highlights & chips" },
    { label: "Success",         hex: semantic.success["400"], shade: "Success 400",   description: "Confirmations, positives" },
    { label: "Error",           hex: semantic.error["400"],   shade: "Error 400",     description: "Errors, destructive actions" },
    { label: "Warning",         hex: semantic.warning["400"], shade: "Warning 400",   description: "Alerts, cautions" },
  ];
}

function UsageCard({
  label,
  hex,
  shade,
  description,
  onCopy,
  copied,
}: {
  label: string;
  hex: string;
  shade: string;
  description: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const textColor = getContrastColor(hex);
  return (
    <div className="flex flex-col gap-4">
      {/* Color swatch box */}
      <div
        className="h-[180px] border-2 border-black p-6 flex flex-col justify-between font-mono text-[14px] overflow-hidden"
        style={{ backgroundColor: hex, color: textColor }}
      >
        <p className="truncate">{shade}</p>
        <p className="whitespace-nowrap">{hex.toUpperCase()}</p>
      </div>

      {/* Info + Copy */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col font-mono">
          <p className="text-[#1a1c1e] text-[18px] leading-tight">{label}</p>
          <p className="text-[#656a72] text-[14px] leading-tight">{description}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 py-1.5 font-mono text-[14px] text-black self-start hover:opacity-60 transition-opacity"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  ds: DesignSystem;
  theme: PaletteTheme;
  onThemeChange: (t: PaletteTheme) => void;
}

export default function UsageSection({ ds, theme, onThemeChange }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const el = document.createElement("textarea");
      el.value = hex;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 1600);
  };

  const rows = getUsageRows(ds, theme);
  const row1 = rows.slice(0, 6);
  const row2 = rows.slice(6, 12);

  return (
    <div className="border-t-2 border-black flex flex-col gap-10 overflow-clip p-8 md:p-12 xl:p-20">
      {/* Section header area */}
      <div className="flex flex-col gap-10">
        {/* Heading row */}
        <div className="flex items-start justify-between whitespace-nowrap">
          <p
            className="font-black text-black"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
          >
            Usage
          </p>
          <p
            className="font-black"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(3rem, 8vw, 7.5rem)",
              lineHeight: 0.85,
              color: "rgba(0,0,0,0.06)",
            }}
          >
            02
          </p>
        </div>

        <p className="font-mono text-[16px] text-[#1a1c1e] max-w-2xl">
          Check how to use these colors in your design. Feel free to adjust as you see fit.
        </p>

        {/* Light / Dark toggle */}
        <div className="flex items-center">
          {(["light", "dark"] as PaletteTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              className="font-mono font-medium text-[14px] px-6 py-3 uppercase transition-colors"
              style={{
                backgroundColor: theme === t ? "#1a1c1e" : "transparent",
                color: theme === t ? "#f6f6f8" : "#000",
                border: "1px solid #000",
                borderRight: t === "light" ? "none" : "1px solid #000",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Usage card rows */}
      <div className="flex flex-col gap-10 overflow-clip">
        {/* Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {row1.map(({ label, hex, shade, description }) => (
            <UsageCard
              key={label}
              label={label}
              hex={hex}
              shade={shade}
              description={description}
              onCopy={() => copy(hex)}
              copied={copied === hex}
            />
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {row2.map(({ label, hex, shade, description }) => (
            <UsageCard
              key={label}
              label={label}
              hex={hex}
              shade={shade}
              description={description}
              onCopy={() => copy(hex)}
              copied={copied === hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
