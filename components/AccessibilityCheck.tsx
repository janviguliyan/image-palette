"use client";

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

  // Dark shade on white (text on white bg)
  for (const [label, , scale] of roleEntries) {
    for (const shade of ["600", "700", "800", "900"] as const) {
      const ratio = getWcagContrast(scale[shade], WHITE);
      if (ratio >= 4.5) {
        combos.push({
          fg: scale[shade], bg: WHITE,
          fgLabel: `${label} ${shade}`, bgLabel: "White",
          ratio, level: getWcagLevel(ratio),
          category: "Text on White",
        });
      }
    }
  }

  // White on dark shade (white text on colored bg)
  for (const [label, , scale] of roleEntries) {
    for (const shade of ["400", "500", "600", "700"] as const) {
      const ratio = getWcagContrast(WHITE, scale[shade]);
      if (ratio >= 4.5) {
        combos.push({
          fg: WHITE, bg: scale[shade],
          fgLabel: "White", bgLabel: `${label} ${shade}`,
          ratio, level: getWcagLevel(ratio),
          category: "White on Color",
        });
      }
    }
  }

  // Dark shade on tinted background (50 or 100)
  for (const [label, , scale] of roleEntries) {
    const ratio = getWcagContrast(scale["900"], scale["50"]);
    if (ratio >= 4.5) {
      combos.push({
        fg: scale["900"], bg: scale["50"],
        fgLabel: `${label} 900`, bgLabel: `${label} 50`,
        ratio, level: getWcagLevel(ratio),
        category: "Dark on Tint",
      });
    }
  }

  // Gray text on white (body text standard)
  const grayOnWhite = getWcagContrast(neutral["900"], WHITE);
  combos.push({
    fg: neutral["900"], bg: WHITE,
    fgLabel: "Gray 900", bgLabel: "White",
    ratio: grayOnWhite, level: getWcagLevel(grayOnWhite),
    category: "Text on White",
  });

  // Gray 700 on white
  const gray700 = getWcagContrast(neutral["700"], WHITE);
  if (gray700 >= 4.5) {
    combos.push({
      fg: neutral["700"], bg: WHITE,
      fgLabel: "Gray 700", bgLabel: "White",
      ratio: gray700, level: getWcagLevel(gray700),
      category: "Text on White",
    });
  }

  // White on gray 800 / 900 (dark mode surfaces)
  for (const shade of ["800", "900"] as const) {
    const ratio = getWcagContrast(WHITE, neutral[shade]);
    if (ratio >= 4.5) {
      combos.push({
        fg: WHITE, bg: neutral[shade],
        fgLabel: "White", bgLabel: `Gray ${shade}`,
        ratio, level: getWcagLevel(ratio),
        category: "Dark Mode",
      });
    }
  }

  // Primary on primary-50
  for (const [label, , scale] of roleEntries.slice(0, 2)) {
    const ratio = getWcagContrast(scale["700"], scale["100"]);
    if (ratio >= 4.5) {
      combos.push({
        fg: scale["700"], bg: scale["100"],
        fgLabel: `${label} 700`, bgLabel: `${label} 100`,
        ratio, level: getWcagLevel(ratio),
        category: "Tinted Surface",
      });
    }
  }

  // Deduplicate by fg+bg, sort by ratio desc, take top 12
  const seen = new Set<string>();
  return combos
    .sort((a, b) => b.ratio - a.ratio)
    .filter((c) => {
      const key = `${c.fg}|${c.bg}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function ContrastCard({ fg, bg, fgLabel, bgLabel, ratio, level, category }: Combo) {
  const levelColor = level === "AAA" ? "#16a34a" : level === "AA" ? "#2563eb" : "#dc2626";
  const levelBg    = level === "AAA" ? "#f0fdf4" : level === "AA" ? "#eff6ff" : "#fef2f2";

  return (
    <div className="border border-[#e8e8e4] flex flex-col">
      {/* Preview */}
      <div
        className="px-5 py-5 flex items-center justify-between"
        style={{ backgroundColor: bg }}
      >
        <div>
          <p className="text-base font-bold leading-none" style={{ color: fg }}>Aa</p>
          <p className="text-[11px] mt-1 font-mono" style={{ color: fg, opacity: 0.8 }}>
            {fgLabel}
          </p>
        </div>
        <span
          className="font-mono text-[8px] uppercase tracking-widest px-2 py-1 border"
          style={{ color: levelColor, backgroundColor: levelBg, borderColor: levelColor + "30" }}
        >
          {level}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 py-3 border-t border-[#e8e8e4] flex flex-col gap-2.5">
        {/* Color pair */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-[#e8e8e4]" style={{ backgroundColor: fg }} />
            <span className="font-mono text-[9px] text-[#555]">{fgLabel}</span>
          </div>
          <span className="font-mono text-[8px] text-[#ccc]">on</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-[#e8e8e4]" style={{ backgroundColor: bg }} />
            <span className="font-mono text-[9px] text-[#555]">{bgLabel}</span>
          </div>
        </div>

        {/* Ratio + category */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] font-bold text-[#0a0a0a]">{ratio.toFixed(2)}:1</span>
          <span className="font-mono text-[8px] text-[#bbb] uppercase tracking-widest">{category}</span>
        </div>

        {/* WCAG criteria */}
        <div className="flex gap-4">
          {[
            { label: "AA Body",  pass: ratio >= 4.5 },
            { label: "AA Large", pass: ratio >= 3   },
            { label: "AAA",      pass: ratio >= 7   },
          ].map(({ label: l, pass }) => (
            <div key={l} className="flex items-center gap-1">
              <span style={{ color: pass ? "#16a34a" : "#dc2626" }} className="font-mono text-[8px]">
                {pass ? "✓" : "✗"}
              </span>
              <span className="font-mono text-[8px] text-[#888]">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccessibilityCheck({ ds }: Props) {
  const combos = generateCombos(ds);

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
          04
        </span>
        <div className="relative">
          <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Accessibility</p>
          <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
            Contrast<br />Pairs
          </h2>
          <p className="font-mono text-[9px] text-[#888] mt-6">
            Showing only WCAG AA-passing combinations from your palette
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-b border-[#e8e8e4] bg-[#fffbeb] px-8 md:px-12 py-3 flex items-start gap-3">
        <span className="font-mono text-[9px] text-[#92400e] shrink-0 mt-0.5">⚠</span>
        <p className="font-mono text-[9px] text-[#92400e] leading-relaxed">
          Auto-generated palette — verify contrast ratios manually before shipping to production.
          WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).
        </p>
      </div>

      {/* Legend */}
      <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3 flex gap-6 flex-wrap">
        {[
          { level: "AAA", desc: "≥ 7:1 Enhanced",   color: "#16a34a", bg: "#f0fdf4" },
          { level: "AA",  desc: "≥ 4.5:1 Compliant", color: "#2563eb", bg: "#eff6ff" },
        ].map(({ level, desc, color, bg }) => (
          <div key={level} className="flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase px-2 py-0.5 border" style={{ color, backgroundColor: bg, borderColor: color + "30" }}>
              {level}
            </span>
            <span className="font-mono text-[8px] text-[#888]">{desc}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="px-8 md:px-12 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {combos.length === 0 ? (
          <p className="col-span-full font-mono text-[10px] text-[#aaa] text-center py-8">
            No WCAG AA-passing combinations found in this palette.
          </p>
        ) : (
          combos.map((combo, i) => <ContrastCard key={i} {...combo} />)
        )}
      </div>
    </div>
  );
}
