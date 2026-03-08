"use client";

import { useState } from "react";
import { SPACING_SCALE, RADIUS_SCALE, SHADOW_SCALE } from "@/lib/designTokens";
import type { DesignSystem } from "@/lib/colorUtils";

interface Props {
  ds: DesignSystem;
}

const MAX_PX = 128;

export default function FoundationTokens({ ds }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const primary50  = ds.scales.primary["50"];
  const primary500 = ds.scales.primary["500"];
  const primary200 = ds.scales.primary["200"];

  const copy = async (val: string) => {
    try { await navigator.clipboard.writeText(val); } catch {
      const el = document.createElement("textarea");
      el.value = val; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(val);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
          06
        </span>
        <div className="relative">
          <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Foundation</p>
          <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
            Spacing,<br />Radius &<br />Shadows
          </h2>
          <p className="font-mono text-[12px] text-[#888] mt-6">
            Design tokens for layout, shape, and elevation
          </p>
        </div>
      </div>

      {/* ── Spacing ── */}
      <div className="border-b border-[#e8e8e4]">
        <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex items-center justify-between">
          <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">Spacing Scale</p>
          <p className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">{SPACING_SCALE.length} steps · 0.125rem → 8rem</p>
        </div>

        <div className="px-8 md:px-12 py-8 space-y-2">
          {SPACING_SCALE.map((s) => {
            const isCopied = copied === s.token;
            const barWidth = Math.max(3, (s.px / MAX_PX) * 100);
            return (
              <button
                key={s.token}
                onClick={() => copy(s.token)}
                className="w-full flex items-center gap-5 group text-left"
              >
                {/* Name */}
                <span className="font-mono text-[12px] text-[#888] w-6 shrink-0 text-right">{s.name}</span>

                {/* Bar */}
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="h-5 shrink-0 transition-all group-hover:opacity-80"
                    style={{
                      width: `${barWidth}%`,
                      maxWidth: "100%",
                      backgroundColor: primary200,
                    }}
                  />
                </div>

                {/* Values */}
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className="font-mono text-[12px] w-14 text-right transition-colors"
                    style={{ color: isCopied ? "#16a34a" : "#bbb" }}
                  >
                    {isCopied ? "✓" : `${s.px}px`}
                  </span>
                  <span className="font-mono text-[12px] text-[#aaa] w-16 text-right hidden sm:block">{s.value}</span>
                  <span className="font-mono text-[12px] text-[#ddd] w-28 text-right hidden md:block">{s.token}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Border Radius ── */}
      <div className="border-b border-[#e8e8e4]">
        <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex items-center justify-between">
          <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">Border Radius</p>
          <p className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">{RADIUS_SCALE.length} steps · 0px → pill</p>
        </div>

        <div className="px-8 md:px-12 py-8 grid grid-cols-4 sm:grid-cols-8 gap-4">
          {RADIUS_SCALE.map((r) => {
            const isCopied = copied === r.token;
            return (
              <button
                key={r.token}
                onClick={() => copy(r.token)}
                className="flex flex-col items-center gap-3 group"
                title={r.usage}
              >
                <div
                  className="w-12 h-12 transition-all group-hover:opacity-70"
                  style={{
                    backgroundColor: primary500,
                    borderRadius: r.value,
                    opacity: 0.85,
                  }}
                />
                <div className="text-center">
                  <p
                    className="font-mono text-[12px] uppercase tracking-widest leading-none transition-colors"
                    style={{ color: isCopied ? "#16a34a" : "#888" }}
                  >
                    {isCopied ? "✓" : r.name}
                  </p>
                  <p className="font-mono text-[12px] text-[#ccc] mt-0.5">{r.value}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Shadows ── */}
      <div>
        <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex items-center justify-between">
          <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">Elevation Shadows</p>
          <p className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">{SHADOW_SCALE.length} levels</p>
        </div>

        <div className="px-8 md:px-12 py-10 bg-[#f0f0ec]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {SHADOW_SCALE.map((s) => {
              const isCopied = copied === s.token;
              return (
                <button
                  key={s.token}
                  onClick={() => copy(s.token)}
                  className="flex flex-col gap-3 group text-left"
                  title={s.usage}
                >
                  <div
                    className="w-full bg-white flex items-center justify-center transition-all group-hover:scale-[1.02]"
                    style={{ boxShadow: s.value, minHeight: 72 }}
                  />
                  <div>
                    <p
                      className="font-mono text-[12px] uppercase tracking-widest leading-none transition-colors"
                      style={{ color: isCopied ? "#16a34a" : "#555" }}
                    >
                      {isCopied ? "✓ Copied" : s.name}
                    </p>
                    <p className="font-mono text-[12px] text-[#999] mt-0.5 leading-relaxed">{s.usage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
