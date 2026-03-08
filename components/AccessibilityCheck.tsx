"use client";

import { useState, useRef } from "react";
import { DesignSystem, getWcagContrast, getWcagLevel } from "@/lib/colorUtils";

interface Props {
  ds: DesignSystem;
}

interface Combo {
  fg: string;
  bg: string;
  fgLabel: string;
  bgLabel: string;
  ratio: number;
  level: "AAA" | "AA" | "Fail";
  category: string;
}

function generateCombos(ds: DesignSystem): Combo[] {
  const { scales, neutral } = ds;
  const WHITE = "#ffffff";
  const combos: Combo[] = [];

  const roleEntries: [string, string, Record<string, string>][] = [
    ["Primary",   "primary",   scales.primary],
    ["Secondary", "secondary", scales.secondary],
    ["Tertiary",  "tertiary",  scales.tertiary],
    ["Accent",    "accent",    scales.accent],
  ];

  for (const [label, , scale] of roleEntries) {
    for (const shade of ["600", "700", "800", "900"] as const) {
      const ratio = getWcagContrast(scale[shade], WHITE);
      if (ratio >= 4.5) {
        combos.push({ fg: scale[shade], bg: WHITE, fgLabel: `${label} ${shade}`, bgLabel: "White", ratio, level: getWcagLevel(ratio), category: "Text on White" });
      }
    }
  }

  for (const [label, , scale] of roleEntries) {
    for (const shade of ["400", "500", "600", "700"] as const) {
      const ratio = getWcagContrast(WHITE, scale[shade]);
      if (ratio >= 4.5) {
        combos.push({ fg: WHITE, bg: scale[shade], fgLabel: "White", bgLabel: `${label} ${shade}`, ratio, level: getWcagLevel(ratio), category: "White on Color" });
      }
    }
  }

  for (const [label, , scale] of roleEntries) {
    const ratio = getWcagContrast(scale["900"], scale["50"]);
    if (ratio >= 4.5) {
      combos.push({ fg: scale["900"], bg: scale["50"], fgLabel: `${label} 900`, bgLabel: `${label} 50`, ratio, level: getWcagLevel(ratio), category: "Dark on Tint" });
    }
  }

  const grayOnWhite = getWcagContrast(neutral["900"], WHITE);
  combos.push({ fg: neutral["900"], bg: WHITE, fgLabel: "Gray 900", bgLabel: "White", ratio: grayOnWhite, level: getWcagLevel(grayOnWhite), category: "Text on White" });

  const gray700 = getWcagContrast(neutral["700"], WHITE);
  if (gray700 >= 4.5) {
    combos.push({ fg: neutral["700"], bg: WHITE, fgLabel: "Gray 700", bgLabel: "White", ratio: gray700, level: getWcagLevel(gray700), category: "Text on White" });
  }

  for (const shade of ["800", "900"] as const) {
    const ratio = getWcagContrast(WHITE, neutral[shade]);
    if (ratio >= 4.5) {
      combos.push({ fg: WHITE, bg: neutral[shade], fgLabel: "White", bgLabel: `Gray ${shade}`, ratio, level: getWcagLevel(ratio), category: "Dark Mode" });
    }
  }

  for (const [label, , scale] of roleEntries.slice(0, 2)) {
    const ratio = getWcagContrast(scale["700"], scale["100"]);
    if (ratio >= 4.5) {
      combos.push({ fg: scale["700"], bg: scale["100"], fgLabel: `${label} 700`, bgLabel: `${label} 100`, ratio, level: getWcagLevel(ratio), category: "Tinted Surface" });
    }
  }

  const seen = new Set<string>();
  return combos
    .sort((a, b) => b.ratio - a.ratio)
    .filter((c) => { const key = `${c.fg}|${c.bg}`; if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, 12);
}

function ContrastCard({ fg, bg, fgLabel, bgLabel, ratio, level, category }: Combo) {
  const levelColor = level === "AAA" ? "#16a34a" : level === "AA" ? "#2563eb" : "#dc2626";
  const levelBg    = level === "AAA" ? "#f0fdf4" : level === "AA" ? "#eff6ff" : "#fef2f2";

  return (
    <div className="border border-[#e8e8e4] flex flex-col">
      <div className="px-5 py-5 flex items-center justify-between" style={{ backgroundColor: bg }}>
        <div>
          <p className="text-base font-bold leading-none" style={{ color: fg }}>Aa</p>
          <p className="text-[12px] mt-1 font-mono" style={{ color: fg, opacity: 0.8 }}>{fgLabel}</p>
        </div>
        <span className="font-mono text-[12px] uppercase tracking-widest px-2 py-1 border" style={{ color: levelColor, backgroundColor: levelBg, borderColor: levelColor + "30" }}>
          {level}
        </span>
      </div>
      <div className="px-4 py-3 border-t border-[#e8e8e4] flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-[#e8e8e4]" style={{ backgroundColor: fg }} />
            <span className="font-mono text-[12px] text-[#555]">{fgLabel}</span>
          </div>
          <span className="font-mono text-[12px] text-[#ccc]">on</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-[#e8e8e4]" style={{ backgroundColor: bg }} />
            <span className="font-mono text-[12px] text-[#555]">{bgLabel}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] font-bold text-[#0a0a0a]">{ratio.toFixed(2)}:1</span>
          <span className="font-mono text-[12px] text-[#bbb] uppercase tracking-widest">{category}</span>
        </div>
        <div className="flex gap-4">
          {[
            { label: "AA Body",  pass: ratio >= 4.5 },
            { label: "AA Large", pass: ratio >= 3   },
            { label: "AAA",      pass: ratio >= 7   },
          ].map(({ label: l, pass }) => (
            <div key={l} className="flex items-center gap-1">
              <span style={{ color: pass ? "#16a34a" : "#dc2626" }} className="font-mono text-[12px]">{pass ? "✓" : "✗"}</span>
              <span className="font-mono text-[12px] text-[#888]">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WcagBadge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <div
        className="flex items-center gap-2 px-2 py-1.5 font-mono text-[14px]"
        style={{ backgroundColor: "#1a1c1e", color: "#f6f6f8" }}
      >
        <span>{pass ? "Pass" : "Fail"}</span>
        <span className="text-[12px]">{pass ? "✓" : "✕"}</span>
      </div>
      <p className="font-mono font-medium text-[16px] text-[#1a1c1e] whitespace-nowrap">{label}</p>
    </div>
  );
}

interface SavedPair {
  text: string;
  bg: string;
}

export default function AccessibilityCheck({ ds }: Props) {
  const combos = generateCombos(ds);

  const [textColor, setTextColor]   = useState("#fafafa");
  const [bgColor, setBgColor]       = useState(ds.roles.primary);
  const [savedPairs, setSavedPairs] = useState<SavedPair[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedBg, setCopiedBg]     = useState(false);

  const textInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef   = useRef<HTMLInputElement>(null);

  const selectedRatio = getWcagContrast(textColor, bgColor);

  const copyHex = async (hex: string, which: "text" | "bg") => {
    try { await navigator.clipboard.writeText(hex); } catch {
      const el = document.createElement("textarea");
      el.value = hex; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    if (which === "text") { setCopiedText(true); setTimeout(() => setCopiedText(false), 1600); }
    else { setCopiedBg(true); setTimeout(() => setCopiedBg(false), 1600); }
  };

  const reverseColors = () => {
    const prev = textColor;
    setTextColor(bgColor);
    setBgColor(prev);
  };

  const savePair = () => {
    const pair = { text: textColor, bg: bgColor };
    setSavedPairs((prev) => {
      const exists = prev.some((p) => p.text === pair.text && p.bg === pair.bg);
      return exists ? prev : [pair, ...prev].slice(0, 8);
    });
  };

  return (
    <div className="border-t-2 border-black flex flex-col gap-10 overflow-clip p-8 md:p-12 xl:p-20">
      {/* Section heading */}
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between whitespace-nowrap">
          <p
            className="font-black text-black"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
          >
            Accessibility
          </p>
          <p
            className="font-black"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85, color: "rgba(0,0,0,0.06)" }}
          >
            04
          </p>
        </div>
        <p className="font-mono text-[16px] text-[#1a1c1e] max-w-2xl">
          Showing only WCAG AA-passing combinations from your palette.
        </p>
      </div>

      {/* Featured ratio display */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-end gap-6">
          <div className="border-2 border-black px-4 py-2 flex items-center justify-center">
            <p
              className="font-mono font-medium text-[#1a1c1e]"
              style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
            >
              Aa
            </p>
          </div>
          <p
            className="font-mono font-medium text-[#1a1c1e]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            {selectedRatio.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <WcagBadge label="AA Large"  pass={selectedRatio >= 3.0} />
          <WcagBadge label="AAA Large" pass={selectedRatio >= 4.5} />
          <WcagBadge label="AA Normal" pass={selectedRatio >= 4.5} />
          <WcagBadge label="AAA Normal" pass={selectedRatio >= 7.0} />
        </div>
      </div>

      {/* Color Picker */}
      <div className="flex flex-col gap-4">
        <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Color Picker</p>

        {/* Text + Background pickers */}
        <div className="flex gap-4 items-start flex-col sm:flex-row">
          {/* Text Color */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <p className="font-mono text-[18px] text-[#1a1c1e]">Text Color</p>
            <div className="border border-black flex items-center gap-4 overflow-hidden">
              <button
                onClick={() => textInputRef.current?.click()}
                className="shrink-0 border border-black"
                style={{ width: 64, height: 64, backgroundColor: textColor }}
                title="Click to pick text color"
              />
              <input
                ref={textInputRef}
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="sr-only"
              />
              <div className="flex-1 flex items-center justify-between pr-4 min-w-0">
                <p className="font-mono text-[16px] text-black">{textColor.toUpperCase()}</p>
                <button
                  onClick={() => copyHex(textColor, "text")}
                  className="flex items-center gap-2 py-1.5 font-mono text-[14px] text-black hover:opacity-60 transition-opacity shrink-0"
                >
                  {copiedText ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <p className="font-mono text-[18px] text-[#1a1c1e]">Background Color</p>
            <div className="border border-black flex items-center gap-4 overflow-hidden">
              <button
                onClick={() => bgInputRef.current?.click()}
                className="shrink-0 border border-black"
                style={{ width: 64, height: 64, backgroundColor: bgColor }}
                title="Click to pick background color"
              />
              <input
                ref={bgInputRef}
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="sr-only"
              />
              <div className="flex-1 flex items-center justify-between pr-4 min-w-0">
                <p className="font-mono text-[16px] text-black">{bgColor.toUpperCase()}</p>
                <button
                  onClick={() => copyHex(bgColor, "bg")}
                  className="flex items-center gap-2 py-1.5 font-mono text-[14px] text-black hover:opacity-60 transition-opacity shrink-0"
                >
                  {copiedBg ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions + Saved */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center flex-wrap">
            <button
              onClick={reverseColors}
              className="border border-black px-6 py-3 font-mono text-[14px] text-[#1a1c1e] hover:bg-black hover:text-white transition-colors"
              style={{ backgroundColor: "#f4f5f5" }}
            >
              Reverse colours
            </button>
            <button
              onClick={savePair}
              className="border border-black px-6 py-3 font-mono text-[14px] text-[#1a1c1e] hover:bg-black hover:text-white transition-colors"
              style={{ backgroundColor: "#f4f5f5" }}
            >
              Save colours
            </button>
          </div>

          {savedPairs.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[14px] text-[#1a1c1e]">Saved colours</p>
              <div className="flex flex-wrap gap-2">
                {/* Default "Aa" tile */}
                <button
                  onClick={() => { setTextColor("#1a1c1e"); setBgColor("#ffffff"); }}
                  className="border-2 border-black p-4 flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Aa</p>
                </button>
                {savedPairs.map((pair, i) => (
                  <button
                    key={i}
                    onClick={() => { setTextColor(pair.text); setBgColor(pair.bg); }}
                    className="border-2 border-black p-4 flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: pair.bg }}
                    title={`Text: ${pair.text} on ${pair.bg}`}
                  >
                    <p className="font-mono font-medium text-[24px]" style={{ color: pair.text }}>Aa</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contrast Checker */}
      <div className="flex flex-col gap-4">
        <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Contrast checker</p>
        <div className="flex gap-4 flex-col sm:flex-row" style={{ color: textColor }}>
          {/* Large Text */}
          <div
            className="flex-1 flex flex-col gap-4 h-[240px] p-6 overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <p className="font-mono font-bold text-[32px] w-full">Large Text - 18pt/24px</p>
            <p className="font-mono font-medium text-[24px] w-full">
              Click/Tap to edit me.{" "}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          {/* Normal Text */}
          <div
            className="flex-1 flex flex-col gap-4 h-[240px] p-6 overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <p className="font-mono font-bold text-[32px] w-full">Normal Text - 16px</p>
            <p className="font-mono font-medium text-[16px] w-full">
              Click/Tap to edit me.{" "}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed cursus viverra dolor vitae imperdiet.
              Vestibulum sapien ex, cursus vel aliquet eu, accumsan id est. Sed fringilla nisi ac magna pretium.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-[#e8e8e4] bg-[#fffbeb] px-6 py-3 flex items-start gap-3">
        <span className="font-mono text-[12px] text-[#92400e] shrink-0 mt-0.5">⚠</span>
        <p className="font-mono text-[12px] text-[#92400e] leading-relaxed">
          Auto-generated palette — verify contrast ratios manually before shipping to production.
          WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).
        </p>
      </div>

      {/* Combo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {combos.length === 0 ? (
          <p className="col-span-full font-mono text-[12px] text-[#aaa] text-center py-8">
            No WCAG AA-passing combinations found in this palette.
          </p>
        ) : (
          combos.map((combo, i) => <ContrastCard key={i} {...combo} />)
        )}
      </div>
    </div>
  );
}
