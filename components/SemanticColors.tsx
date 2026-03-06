"use client";

import { useState } from "react";
import { getContrastColor, hexToRgba, SCALE_STEPS } from "@/lib/colorUtils";

interface Props {
  semantic: {
    success: Record<string, string>;
    error: Record<string, string>;
    warning: Record<string, string>;
    info: Record<string, string>;
  };
}

const SEMANTIC_ROWS: [keyof Props["semantic"], string, string][] = [
  ["success", "Success", "Green"],
  ["error", "Error", "Red"],
  ["warning", "Warning", "Amber"],
  ["info", "Info", "Blue"],
];

export default function SemanticColors({ semantic }: Props) {
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

  return (
    <div>
      <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#aaa]">
          Semantic Colors
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#ccc]">
          Harmonized with palette
        </p>
      </div>

      {/* Step labels */}
      <div className="border-b border-[#e8e8e4] flex">
        <div className="w-24 shrink-0 px-4 py-2 border-r border-[#e8e8e4]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#ccc]">Color</span>
        </div>
        {SCALE_STEPS.map((step) => (
          <div key={step} className="flex-1 px-1 py-2 text-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#ccc]">{step}</span>
          </div>
        ))}
      </div>

      {SEMANTIC_ROWS.map(([key, label, hint]) => {
        const scale = semantic[key];
        return (
          <div key={key} className="border-b border-[#e8e8e4] last:border-b-0 flex items-stretch">
            <div className="w-24 shrink-0 border-r border-[#e8e8e4] px-4 py-3 flex flex-col justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#888]">{label}</span>
              <span className="font-mono text-[8px] text-[#bbb]">{hint}</span>
            </div>
            <div className="flex flex-1">
              {SCALE_STEPS.map((step, i) => {
                const hex = scale[step];
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
                      <span className="font-mono text-[8px] block" style={{ color: contrast, opacity: 0.65 }}>
                        {step}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
