"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DesignSystem, SCALE_STEPS } from "@/lib/colorUtils";
import {
  buildTypographyCss, buildSpacingCss, buildRadiusCss, buildShadowCss,
  buildTypographyTailwind, buildSpacingTailwind, buildRadiusTailwind, buildShadowTailwind,
  buildFoundationFigmaTokens,
} from "@/lib/designTokens";

type ExportType = "css" | "tailwind" | "figma";

// ── Build functions ──────────────────────────────────────────────────────────

function buildCss(ds: DesignSystem): string {
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
  lines.push(buildTypographyCss());
  lines.push(buildSpacingCss());
  lines.push(buildRadiusCss());
  lines.push(buildShadowCss());
  lines.push("\n}");
  return lines.join("\n");
}

function buildTailwind(ds: DesignSystem): string {
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
  lines.push(buildTypographyTailwind());
  lines.push(buildSpacingTailwind());
  lines.push(buildRadiusTailwind());
  lines.push(buildShadowTailwind());
  return lines.join("\n");
}

function buildFigma(ds: DesignSystem): string {
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
  const foundation = buildFoundationFigmaTokens();
  Object.assign(tokens, foundation);
  return JSON.stringify(tokens, null, 2);
}

// ── Modal ────────────────────────────────────────────────────────────────────

const STEPS: Record<ExportType, string[]> = {
  css: [
    "Paste the :root { } block into your global stylesheet (e.g. globals.css or app.css)",
    "All design tokens are now available as CSS custom properties: colors, typography, spacing, radius, and shadows",
    "Colors: var(--color-primary-500) · Typography: var(--text-h1) · Spacing: var(--space-4)",
    "Radius: var(--radius-md) · Shadows: var(--shadow-md) — works with any framework",
  ],
  tailwind: [
    "Open tailwind.config.js (or tailwind.config.ts) at the root of your project",
    "Inside theme.extend, paste the snippet — includes colors, fontSize, spacing, borderRadius, and boxShadow",
    "Restart your dev server: npm run dev",
    "Use utilities like: bg-primary-500, text-h1, p-4, rounded-md, shadow-lg",
  ],
  figma: [
    'Install the "Design Tokens" or "Tokens Studio" plugin from the Figma Community',
    "Open the plugin: Plugins → Tokens Studio → Import JSON",
    "Paste the copied JSON — includes color, typography, spacing, radius, and shadow tokens",
    "Tokens appear in Local Variables — apply to fills, strokes, text, and effects via the Variables panel (Shift+V)",
    "Use color styles for swatches, text styles for typography, and effect styles for shadows",
  ],
};

const TAB_LABELS: Record<ExportType, string> = {
  css: "CSS Variables",
  tailwind: "Tailwind",
  figma: "Figma JSON",
};

interface ModalProps {
  ds: DesignSystem;
  triggeredType: ExportType;
  onClose: () => void;
}

function ExportModal({ ds, triggeredType, onClose }: ModalProps) {
  const [activeTab, setActiveTab] = useState<ExportType>(triggeredType);
  const [tabCopied, setTabCopied] = useState<ExportType | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const getContent = (t: ExportType) =>
    t === "css" ? buildCss(ds) : t === "tailwind" ? buildTailwind(ds) : buildFigma(ds);

  const copyTab = async (t: ExportType) => {
    const content = getContent(t);
    try { await navigator.clipboard.writeText(content); } catch {
      const el = document.createElement("textarea");
      el.value = content; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setTabCopied(t);
    setTimeout(() => setTabCopied(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: "rgba(10,10,10,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-[#f9f9f7] w-full max-w-2xl max-h-[88vh] flex flex-col border-2 border-[#0a0a0a] shadow-2xl animate-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-[#0a0a0a] px-6 md:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#16a34a] flex items-center justify-center shrink-0">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 5.5l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#0a0a0a]">
                Copied to Clipboard
              </p>
              <p className="font-mono text-[8px] text-[#888] mt-0.5">
                {TAB_LABELS[triggeredType]} · Colors + Typography + Spacing + Radius + Shadows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-widest text-[#888] hover:text-[#0a0a0a] transition-colors border border-transparent hover:border-[#e8e8e4] px-3 py-1.5"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-b border-[#0a0a0a] flex shrink-0">
          {(["css", "tailwind", "figma"] as ExportType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-3 font-mono text-[9px] uppercase tracking-widest border-r border-[#0a0a0a] last:border-r-0 transition-colors ${
                activeTab === t
                  ? "bg-[#0a0a0a] text-white"
                  : "text-[#888] hover:bg-[#f0f0ec]"
              }`}
            >
              {t === triggeredType ? `✓ ${TAB_LABELS[t]}` : TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Steps */}
          <div className="px-6 md:px-8 py-6 border-b border-[#e8e8e4]">
            <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#aaa] mb-4">
              How to use
            </p>
            <ol className="space-y-3">
              {STEPS[activeTab].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-mono text-[8px] text-[#ccc] shrink-0 mt-0.5 w-4">{i + 1}.</span>
                  <span className="font-mono text-[10px] text-[#444] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Code preview */}
          <div className="px-6 md:px-8 py-4 border-b border-[#e8e8e4] flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#aaa]">
              {TAB_LABELS[activeTab]}
            </p>
            <button
              onClick={() => copyTab(activeTab)}
              className="font-mono text-[8px] uppercase tracking-widest border border-[#e8e8e4] hover:border-[#0a0a0a] px-3 py-1.5 transition-colors flex items-center gap-1.5"
              style={{ color: tabCopied === activeTab ? "#16a34a" : "#888" }}
            >
              {tabCopied === activeTab ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <pre className="px-6 md:px-8 py-5 text-[10px] font-mono text-[#555] leading-relaxed overflow-x-auto whitespace-pre">
            {getContent(activeTab)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── ExportTriggers ───────────────────────────────────────────────────────────

interface Props {
  ds: DesignSystem;
}

export default function ExportTriggers({ ds }: Props) {
  const [openModal, setOpenModal] = useState<ExportType | null>(null);

  const handleClick = async (type: ExportType) => {
    const content = type === "css" ? buildCss(ds) : type === "tailwind" ? buildTailwind(ds) : buildFigma(ds);
    try { await navigator.clipboard.writeText(content); } catch {
      const el = document.createElement("textarea");
      el.value = content; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setOpenModal(type);
  };

  const BTNS: { type: ExportType; label: string; subLabel: string }[] = [
    { type: "css",      label: "CSS Variables",  subLabel: "var(--color-primary-500)" },
    { type: "tailwind", label: "Tailwind Config", subLabel: "bg-primary-500" },
    { type: "figma",    label: "Figma Styles",    subLabel: "color.primary.500" },
  ];

  return (
    <>
      <div className="border-b-2 border-[#0a0a0a] flex flex-col sm:flex-row">
        {/* Label cell */}
        <div className="border-b sm:border-b-0 sm:border-r-2 border-[#0a0a0a] px-8 md:px-12 py-7 flex items-center shrink-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#888]">Copy As</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x divide-[#e8e8e4]">
          {BTNS.map(({ type, label, subLabel }) => (
            <button
              key={type}
              onClick={() => handleClick(type)}
              className="group flex-1 flex items-center gap-5 px-8 md:px-12 py-7 hover:bg-[#f0f0ec] transition-colors text-left"
            >
              {/* Arrow icon */}
              <div className="w-10 h-10 border-2 border-[#0a0a0a] flex items-center justify-center shrink-0 transition-all group-hover:bg-[#0a0a0a]">
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" className="transition-colors group-hover:stroke-white stroke-[#0a0a0a]">
                  <path d="M6 1v7M3 5l3 3 3-3" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]">{label}</p>
                <p className="font-mono text-[8px] text-[#aaa] mt-1">{subLabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal — rendered via portal to escape transform/stacking-context issues */}
      {openModal && createPortal(
        <ExportModal
          ds={ds}
          triggeredType={openModal}
          onClose={() => setOpenModal(null)}
        />,
        document.body
      )}
    </>
  );
}
