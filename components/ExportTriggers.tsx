"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DesignSystem, SCALE_STEPS } from "@/lib/colorUtils";

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
  for (const [name, scale] of groups) {
    lines.push(`\n  /* ${name.charAt(0).toUpperCase() + name.slice(1)} */`);
    for (const step of SCALE_STEPS) {
      lines.push(`  --color-${name}-${step}: ${scale[step]};`);
    }
  }
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
  const lines = ["// tailwind.config.js → theme.extend.colors", "colors: {"];
  for (const [name, scale] of groups) {
    lines.push(`  ${name}: {`);
    for (const step of SCALE_STEPS) lines.push(`    "${step}": "${scale[step]}",`);
    lines.push("  },");
  }
  lines.push("},");
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
  return JSON.stringify(tokens, null, 2);
}

// ── Modal ────────────────────────────────────────────────────────────────────

const STEPS: Record<ExportType, string[]> = {
  css: [
    "Paste the :root { } block into your global stylesheet (e.g. globals.css or app.css)",
    "All 90 design tokens are now available as CSS custom properties across your project",
    "Use with var(): background: var(--color-primary-500); color: var(--color-gray-900);",
    "Works with any framework — React, Vue, Svelte, Angular, or plain HTML",
  ],
  tailwind: [
    "Open tailwind.config.js (or tailwind.config.ts) at the root of your project",
    "Inside theme.extend, add or replace the colors key with the pasted snippet",
    "Restart your dev server: npm run dev",
    "Use Tailwind utility classes: bg-primary-500, text-gray-900, border-error-400, ring-accent-300",
  ],
  figma: [
    'Install the "Design Tokens" or "Variables Import" plugin from the Figma Community',
    "Open the plugin: Plugins → Design Tokens → Import JSON",
    "Paste the copied JSON into the plugin input field and click Import",
    "90 color tokens appear in Local Variables under a new collection",
    "Apply variables to fills, strokes, and effects via the Variables panel (Shift+V)",
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
                {TAB_LABELS[triggeredType]} · 90 tokens
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
        <div className="border-b sm:border-b-0 sm:border-r-2 border-[#0a0a0a] px-8 md:px-12 py-5 flex items-center shrink-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#888]">Copy As</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x divide-[#e8e8e4]">
          {BTNS.map(({ type, label, subLabel }) => (
            <button
              key={type}
              onClick={() => handleClick(type)}
              className="group flex-1 flex items-center gap-4 px-8 md:px-10 py-5 hover:bg-[#f0f0ec] transition-colors text-left"
            >
              {/* Arrow icon */}
              <div className="w-8 h-8 border border-[#0a0a0a] flex items-center justify-center shrink-0 transition-all group-hover:bg-[#0a0a0a]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-colors group-hover:stroke-white stroke-[#0a0a0a]">
                  <path d="M6 1v7M3 5l3 3 3-3" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#0a0a0a]">{label}</p>
                <p className="font-mono text-[8px] text-[#aaa] mt-0.5">{subLabel}</p>
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
