"use client";

import { useState } from "react";
import { getContrastColor, hexToRgba, SCALE_STEPS } from "@/lib/colorUtils";

interface Props {
  neutral: Record<string, string>;
  temperature: "warm" | "cool" | "neutral";
}

export default function NeutralColors({ neutral, temperature }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try { await navigator.clipboard.writeText(hex); } catch {
      const el = document.createElement("textarea");
      el.value = hex; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 1600);
  };

  const tempLabel = temperature === "warm" ? "Warm Grey" : temperature === "cool" ? "Cool Grey" : "Neutral Grey";

  return (
    <div className="border-b border-[#e8e8e4]">
      <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex items-center justify-between">
        <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">
          Neutral Greys
        </p>
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#ccc]">
          {tempLabel} — palette-matched
        </p>
      </div>

      {/* Step labels */}
      <div className="border-b border-[#e8e8e4] flex">
        <div className="w-24 shrink-0 px-4 py-2 border-r border-[#e8e8e4]">
          <span className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">Gray</span>
        </div>
        {SCALE_STEPS.map((step) => (
          <div key={step} className="flex-1 px-1 py-2 text-center">
            <span className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">{step}</span>
          </div>
        ))}
      </div>

      {/* Swatch row */}
      <div className="flex items-stretch">
        <div className="w-24 shrink-0 border-r border-[#e8e8e4] px-4 py-3 flex items-center">
          <span className="font-mono text-[12px] uppercase tracking-widest text-[#888]">Gray</span>
        </div>
        <div className="flex flex-1">
          {SCALE_STEPS.map((step, i) => {
            const hex = neutral[step];
            const contrast = getContrastColor(hex);
            const isCopied = copied === hex;
            return (
              <button
                key={step}
                onClick={() => copy(hex)}
                title={`Copy ${hex}`}
                className={`group relative flex-1 flex flex-col items-center justify-end transition-opacity hover:opacity-90 ${
                  i < SCALE_STEPS.length - 1 ? "border-r border-[#0a0a0a]/10" : ""
                }`}
                style={{ backgroundColor: hex, minHeight: 56 }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ backgroundColor: hexToRgba(contrast === "#ffffff" ? "#000" : "#fff", 0.1) }}
                >
                  {isCopied ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke={contrast} strokeWidth="1.8" strokeLinecap="square" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" opacity={0.6}>
                      <rect x="4" y="4" width="6" height="6" stroke={contrast} strokeWidth="1" />
                      <path d="M2 8V2h6" stroke={contrast} strokeWidth="1" strokeLinecap="square" />
                    </svg>
                  )}
                </div>
                <div className="w-full px-1 py-1">
                  <span className="font-mono text-[12px] block" style={{ color: contrast, opacity: 0.65 }}>
                    {step}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hex reference */}
      <div className="border-t border-[#e8e8e4] flex">
        <div className="w-24 shrink-0 border-r border-[#e8e8e4]" />
        {SCALE_STEPS.map((step, i) => (
          <button
            key={step}
            onClick={() => copy(neutral[step])}
            className={`flex-1 px-1 py-2 hover:bg-[#f0f0ec] transition-colors ${
              i < SCALE_STEPS.length - 1 ? "border-r border-[#e8e8e4]" : ""
            }`}
          >
            <span className="font-mono text-[12px] text-[#aaa] block truncate">
              {copied === neutral[step] ? "Copied!" : neutral[step]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
