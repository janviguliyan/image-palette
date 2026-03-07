"use client";

import { useState, useRef } from "react";
import { TYPOGRAPHY_SCALE, type TypographyToken } from "@/lib/designTokens";

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

const PREVIEW_SAMPLES: Record<string, string> = {
  Display:      "Display",
  H1:           "Heading One",
  H2:           "Heading Two",
  H3:           "Heading Three",
  H4:           "Heading Four",
  "Body Large": "Body large text",
  Body:         "Body text",
  "Body Small": "Body small text",
  Button:       "BUTTON",
  Caption:      "Caption text",
  Label:        "LABEL",
  Code:         "var(--token)",
};

type EditableField = "sizeDesktop" | "weight" | "lineHeight" | "letterSpacing" | "textCase";

interface OverrideMap {
  [token: string]: Partial<Pick<TypographyToken, EditableField>>;
}

interface EditingCell {
  token: string;
  field: EditableField;
}

function EditableCell({
  value,
  onCommit,
  mono = false,
  selectOptions,
}: {
  value: string;
  onCommit: (v: string) => void;
  mono?: boolean;
  selectOptions?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
  };

  if (selectOptions) {
    return (
      <select
        value={value}
        onChange={(e) => onCommit(e.target.value)}
        className="bg-transparent border-none outline-none cursor-pointer"
        style={{
          fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
          fontSize: "0.72rem",
          color: "#555",
          padding: 0,
        }}
      >
        {selectOptions.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        style={{
          fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
          fontSize: "0.72rem",
          color: "#0a0a0a",
          border: "none",
          borderBottom: "1px solid #0a0a0a",
          outline: "none",
          background: "transparent",
          width: "100%",
          padding: 0,
        }}
      />
    );
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      style={{
        fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
        fontSize: "0.72rem",
        color: "#555",
        cursor: "text",
        borderBottom: "1px dashed transparent",
        transition: "border-color 0.1s",
        display: "inline-block",
        minWidth: 32,
      }}
      className="hover:border-b-[#bbb]"
    >
      {value}
    </span>
  );
}

export default function TypographySystem() {
  const [overrides, setOverrides] = useState<OverrideMap>({});

  const getToken = (t: TypographyToken): TypographyToken => ({
    ...t,
    ...(overrides[t.token] ?? {}),
  });

  const update = (token: string, field: EditableField, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [token]: { ...prev[token], [field]: field === "weight" ? parseInt(value) || prev[token]?.weight : value },
    }));
  };

  const hasOverride = (token: string) => !!overrides[token] && Object.keys(overrides[token]!).length > 0;
  const resetToken = (token: string) => setOverrides((prev) => { const next = { ...prev }; delete next[token]; return next; });
  const resetAll = () => setOverrides({});
  const anyOverride = Object.keys(overrides).length > 0;

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
          05
        </span>
        <div className="relative">
          <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Type Scale</p>
          <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
            Typography<br />System
          </h2>
          <p className="font-mono text-[9px] text-[#888] mt-6">
            Fluid type scale · Desktop + Mobile · 12 tokens · Click any value to edit
          </p>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 1120 }}>

      {/* Table header */}
      <div className="border-b border-[#e8e8e4] bg-[#f8f8f5]">
        <div className="px-8 md:px-12 py-2 flex items-center justify-between">
          <div className="grid gap-0 items-center w-full" style={{ gridTemplateColumns: "240px 100px 64px 96px 110px 80px 72px 90px 1fr 32px", columnGap: "16px" }}>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Preview</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Scale</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Family</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Weight</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Size</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Case</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Leading</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Tracking</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Usage</span>
            <span />
          </div>
          {anyOverride && (
            <button
              onClick={resetAll}
              className="font-mono text-[7px] uppercase tracking-widest text-[#e44] hover:text-[#c00] ml-4 shrink-0"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Rows */}
      <div>
        {TYPOGRAPHY_SCALE.map((raw, i) => {
          const t = getToken(raw);
          const fontFamily = t.family === "mono" ? "JetBrains Mono, monospace" : "Inter, sans-serif";
          const sample = PREVIEW_SAMPLES[t.name] ?? t.usage;
          const isLast = i === TYPOGRAPHY_SCALE.length - 1;
          const modified = hasOverride(raw.token);

          return (
            <div
              key={raw.token}
              className={`grid items-center gap-0 px-8 md:px-12 py-3 group hover:bg-[#f8f8f5] transition-colors ${!isLast ? "border-b border-[#e8e8e4]" : ""}`}
              style={{ gridTemplateColumns: "240px 100px 64px 96px 110px 80px 72px 90px 1fr 32px", columnGap: "16px" }}
            >
              {/* Preview */}
              <div className="pr-4 overflow-hidden" style={{ maxWidth: 240 }}>
                <p
                  style={{
                    fontFamily,
                    fontSize: `clamp(0.6rem, 1.5vw, ${t.sizeDesktop})`,
                    fontWeight: t.weight,
                    lineHeight: t.lineHeight,
                    letterSpacing: t.letterSpacing,
                    textTransform: t.textCase === "uppercase" ? "uppercase" : "none",
                    color: "#0a0a0a",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {sample}
                </p>
              </div>

              {/* Scale name */}
              <div>
                <p className="font-mono text-[9px] text-[#888] uppercase tracking-[0.06em]">{t.name}</p>
                <p className="font-mono text-[7px] text-[#ccc] mt-0.5">{raw.token}</p>
              </div>

              {/* Family */}
              <div>
                <span
                  className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-[#e8e8e4] text-[#888]"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {t.family}
                </span>
              </div>

              {/* Weight */}
              <div>
                <EditableCell
                  value={String(t.weight)}
                  onCommit={(v) => update(raw.token, "weight", v)}
                  mono
                />
                <p className="font-mono text-[7px] text-[#ccc] mt-0.5">{WEIGHT_NAMES[t.weight] ?? ""}</p>
              </div>

              {/* Size */}
              <div>
                <EditableCell
                  value={t.sizeDesktop}
                  onCommit={(v) => update(raw.token, "sizeDesktop", v)}
                  mono
                />
              </div>

              {/* Case */}
              <div>
                <EditableCell
                  value={t.textCase}
                  onCommit={(v) => update(raw.token, "textCase", v as "none" | "uppercase")}
                  selectOptions={["none", "uppercase"]}
                  mono
                />
              </div>

              {/* Line height */}
              <div>
                <EditableCell
                  value={t.lineHeight}
                  onCommit={(v) => update(raw.token, "lineHeight", v)}
                  mono
                />
              </div>

              {/* Letter spacing */}
              <div>
                <EditableCell
                  value={t.letterSpacing || "0em"}
                  onCommit={(v) => update(raw.token, "letterSpacing", v)}
                  mono
                />
              </div>

              {/* Usage */}
              <div className="pl-4">
                <p className="font-mono text-[8px] text-[#aaa] leading-relaxed">{t.usage}</p>
              </div>

              {/* Reset */}
              <div className="flex justify-end">
                {modified ? (
                  <button
                    onClick={() => resetToken(raw.token)}
                    title="Reset to default"
                    className="font-mono text-[7px] text-[#e44] hover:text-[#c00] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ↺
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>{/* end rows */}
      </div>{/* end min-width container */}
      </div>{/* end overflow-x-auto */}

      {/* Footer note */}
      <div className="border-t border-[#e8e8e4] px-8 md:px-12 py-4">
        <p className="font-mono text-[8px] text-[#bbb]">
          Edits are local previews only — export CSS / Tailwind to lock in values &nbsp;·&nbsp; Click any value cell to edit
        </p>
      </div>
    </div>
  );
}
