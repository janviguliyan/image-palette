"use client";

import { useState } from "react";
import { SCALE_STEPS, DesignSystem } from "@/lib/colorUtils";

type Tab = "css" | "tailwind" | "figma";

interface Props {
  ds: DesignSystem;
}

function buildCss(ds: DesignSystem): string {
  const lines: string[] = [":root {"];

  const addGroup = (name: string, scale: Record<string, string>) => {
    lines.push(`  /* ${name} */`);
    for (const step of SCALE_STEPS) {
      lines.push(`  --color-${name}-${step}: ${scale[step]};`);
    }
    lines.push("");
  };

  addGroup("primary", ds.scales.primary);
  addGroup("secondary", ds.scales.secondary);
  addGroup("tertiary", ds.scales.tertiary);
  addGroup("accent", ds.scales.accent);
  addGroup("gray", ds.neutral);
  addGroup("success", ds.semantic.success);
  addGroup("error", ds.semantic.error);
  addGroup("warning", ds.semantic.warning);
  addGroup("info", ds.semantic.info);

  lines.push("}");
  return lines.join("\n");
}

function buildTailwind(ds: DesignSystem): string {
  const obj: Record<string, Record<string, string>> = {
    primary: ds.scales.primary,
    secondary: ds.scales.secondary,
    tertiary: ds.scales.tertiary,
    accent: ds.scales.accent,
    gray: ds.neutral,
    success: ds.semantic.success,
    error: ds.semantic.error,
    warning: ds.semantic.warning,
    info: ds.semantic.info,
  };

  const lines: string[] = ["// tailwind.config.js → theme.extend.colors", "colors: {"];
  for (const [name, scale] of Object.entries(obj)) {
    lines.push(`  ${name}: {`);
    for (const step of SCALE_STEPS) {
      lines.push(`    ${step}: "${scale[step]}",`);
    }
    lines.push(`  },`);
  }
  lines.push("},");
  return lines.join("\n");
}

function buildFigma(ds: DesignSystem): string {
  const tokens: Record<string, string> = {};

  const addGroup = (name: string, scale: Record<string, string>) => {
    for (const step of SCALE_STEPS) {
      tokens[`color.${name}.${step}`] = scale[step];
    }
  };

  addGroup("primary", ds.scales.primary);
  addGroup("secondary", ds.scales.secondary);
  addGroup("tertiary", ds.scales.tertiary);
  addGroup("accent", ds.scales.accent);
  addGroup("gray", ds.neutral);
  addGroup("success", ds.semantic.success);
  addGroup("error", ds.semantic.error);
  addGroup("warning", ds.semantic.warning);
  addGroup("info", ds.semantic.info);

  return JSON.stringify(tokens, null, 2);
}

export default function ExportPanel({ ds }: Props) {
  const [tab, setTab] = useState<Tab>("css");
  const [copied, setCopied] = useState(false);

  const content =
    tab === "css" ? buildCss(ds) : tab === "tailwind" ? buildTailwind(ds) : buildFigma(ds);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); } catch {
      const el = document.createElement("textarea");
      el.value = content; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "css", label: "CSS Variables" },
    { id: "tailwind", label: "Tailwind Config" },
    { id: "figma", label: "Figma JSON" },
  ];

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      <div className="border-b border-[#0a0a0a] px-6 py-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888]">
          07 / Export
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#e8e8e4] flex">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setCopied(false); }}
            className={`px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest border-r border-[#e8e8e4] transition-colors ${
              tab === id
                ? "bg-[#0a0a0a] text-white"
                : "text-[#888] hover:bg-[#f0f0ec]"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#888] hover:bg-[#f0f0ec] transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 5.5l3 3L10 2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
              <span className="text-[#16a34a]">Copied!</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="3.5" y="3.5" width="6" height="6" stroke="currentColor" strokeWidth="1" />
                <path d="M1.5 7.5V1.5h6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
              </svg>
              Copy All
            </>
          )}
        </button>
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="px-6 py-5 text-[11px] font-mono text-[#444] bg-[#fafaf8] overflow-x-auto leading-relaxed max-h-80 overflow-y-auto">
          {content}
        </pre>
      </div>

      {/* Format hints */}
      <div className="border-t border-[#e8e8e4] px-6 py-3 flex gap-6 flex-wrap">
        {tab === "css" && (
          <p className="font-mono text-[9px] text-[#aaa]">
            Paste in your global stylesheet and use like: <code className="text-[#666]">var(--color-primary-500)</code>
          </p>
        )}
        {tab === "tailwind" && (
          <p className="font-mono text-[9px] text-[#aaa]">
            Paste inside <code className="text-[#666]">theme.extend.colors</code> in <code className="text-[#666]">tailwind.config.js</code>, then use <code className="text-[#666]">bg-primary-500</code>
          </p>
        )}
        {tab === "figma" && (
          <p className="font-mono text-[9px] text-[#aaa]">
            Import in Figma using a Variables Import plugin (e.g. "Design Tokens" or "Variables Import")
          </p>
        )}
      </div>
    </div>
  );
}
