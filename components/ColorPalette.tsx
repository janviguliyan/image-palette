"use client";

import { useState } from "react";
import { getContrastColor, lighten, darken, hexToRgba } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

// Generate light and dark variation steps
function buildVariations(hex: string) {
  return {
    light: [lighten(hex, 0.75), lighten(hex, 0.55), lighten(hex, 0.35)],
    base: hex,
    dark: [darken(hex, 0.3), darken(hex, 0.55), darken(hex, 0.75)],
  };
}

export default function ColorPalette({ colors }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const copyColor = async (hex: string) => {
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
    setTimeout(() => setCopied(null), 1800);
  };

  const variations = colors.map(buildVariations);

  return (
    <div>
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-6 py-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888]">
          02 / Dominant Colors
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#aaa]">
          Click to copy hex
        </p>
      </div>

      {/* ── MAIN PALETTE — Large squares ── */}
      <div className="grid grid-cols-6 border-b border-[#0a0a0a]">
        {colors.map((hex, i) => {
          const contrast = getContrastColor(hex);
          const isCopied = copied === hex;
          return (
            <button
              key={i}
              onClick={() => copyColor(hex)}
              onMouseEnter={() => setHoveredColor(hex)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`relative group flex flex-col transition-all duration-150 ${
                i < colors.length - 1 ? "border-r border-[#0a0a0a]" : ""
              }`}
              style={{ backgroundColor: hex }}
              title={`Copy ${hex}`}
            >
              {/* Square area */}
              <div className="w-full" style={{ paddingBottom: "100%" }} />

              {/* Hover/copy overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: hexToRgba(contrast === "#ffffff" ? "#000000" : "#ffffff", 0.12) }}
              >
                {isCopied ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke={contrast} strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity={0.7}>
                    <rect x="5.5" y="5.5" width="8" height="8" stroke={contrast} strokeWidth="1.2" />
                    <path d="M3 10.5V3H10.5" stroke={contrast} strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                )}
              </div>

              {/* Hex label — bottom of swatch */}
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1.5 border-t"
                style={{ borderColor: hexToRgba(contrast, 0.15) }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-wider block"
                  style={{ color: contrast, opacity: isCopied ? 1 : 0.75 }}
                >
                  {isCopied ? "Copied!" : hex}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── VARIATION MATRIX ── */}
      <div className="border-b border-[#0a0a0a]">
        {/* Light variations header */}
        <div className="px-6 py-2 border-b border-[#e8e8e4] flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#aaa]">
            Light Variations
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ccc]">
            +35% · +55% · +75%
          </p>
        </div>

        {/* Light rows (3 rows, lightest at bottom) */}
        {[2, 1, 0].map((step) => (
          <div key={`light-${step}`} className="grid grid-cols-6 border-b border-[#e8e8e4]">
            {variations.map((v, i) => {
              const hex = v.light[step];
              return (
                <button
                  key={i}
                  onClick={() => copyColor(hex)}
                  className={`h-8 transition-opacity hover:opacity-80 ${
                    i < colors.length - 1 ? "border-r border-[#e8e8e4]" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                  title={`Copy ${hex}`}
                />
              );
            })}
          </div>
        ))}

        {/* Dark variations header */}
        <div className="px-6 py-2 border-b border-[#e8e8e4] flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#aaa]">
            Dark Variations
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ccc]">
            −30% · −55% · −75%
          </p>
        </div>

        {/* Dark rows */}
        {[0, 1, 2].map((step) => (
          <div key={`dark-${step}`} className="grid grid-cols-6 border-b border-[#e8e8e4] last:border-b-0">
            {variations.map((v, i) => {
              const hex = v.dark[step];
              return (
                <button
                  key={i}
                  onClick={() => copyColor(hex)}
                  className={`h-8 transition-opacity hover:opacity-80 ${
                    i < colors.length - 1 ? "border-r border-[#e8e8e4]" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                  title={`Copy ${hex}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ── HEX REFERENCE STRIP ── */}
      <div className="grid grid-cols-6">
        {colors.map((hex, i) => (
          <button
            key={i}
            onClick={() => copyColor(hex)}
            className={`px-3 py-3 text-left transition-colors hover:bg-[#f0f0ec] ${
              i < colors.length - 1 ? "border-r border-[#e8e8e4]" : ""
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#555] block">
              {copied === hex ? "Copied!" : hex}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#bbb] block mt-0.5">
              Color {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
