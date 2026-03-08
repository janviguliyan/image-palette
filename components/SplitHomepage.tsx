"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { generateHarmonyColors, normalizeHex, HARMONY_MODES } from "@/lib/colorUtils";
import type { HarmonyMode } from "@/lib/colorUtils";

export interface ManualRoles {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

interface Props {
  onImageUpload: (file: File, previewUrl: string) => void;
  onManualGenerate: (roles: ManualRoles, explicitKeys: (keyof ManualRoles)[], mode: HarmonyMode) => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function isValidHex(v: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

function previewColor(v: string) {
  return v && isValidHex(v) ? normalizeHex(v) : "#e8e8e4";
}

// ── Inline HSV Color Picker ────────────────────────────────────────────────

const PICKER_W = 240;
const PICKER_H = 160;

function hexToHsv(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const diff = max - min;
  const v = max, s = max === 0 ? 0 : diff / max;
  let hue = 0;
  if (diff !== 0) {
    if (max === r)      hue = ((g - b) / diff) % 6;
    else if (max === g) hue = (b - r) / diff + 2;
    else                hue = (r - g) / diff + 4;
    hue = ((hue * 60) + 360) % 360;
  }
  return [hue, s, v];
}

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const toHex = (x: number) => Math.round(Math.max(0, Math.min(255, x * 255))).toString(16).padStart(2, "0");
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

function InlineColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const safeHex = isValidHex(value) ? normalizeHex(value) : "#6366f1";
  const [hsv, setHsv]         = useState<[number, number, number]>(() => hexToHsv(safeHex));
  const [inputVal, setInputVal] = useState(safeHex.toUpperCase());
  const panelRef  = useRef<HTMLDivElement>(null);
  const hueRef    = useRef<HTMLDivElement>(null);
  const prevHex   = useRef(safeHex);

  const currentHex = hsvToHex(...hsv);

  // Sync from parent value changes only (not from internal HSV changes)
  useEffect(() => {
    const norm = isValidHex(value) ? normalizeHex(value) : "#6366f1";
    if (norm !== prevHex.current) {
      prevHex.current = norm;
      setHsv(hexToHsv(norm));
      setInputVal(norm.toUpperCase());
    }
  }, [value]);

  // Emit changes upward
  useEffect(() => {
    if (currentHex !== prevHex.current) {
      prevHex.current = currentHex;
      onChange(currentHex);
      setInputVal(currentHex.toUpperCase());
    }
  }, [currentHex, onChange]);

  const moveSV = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = panelRef.current!.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setHsv([hsv[0], s, v]);
  };

  const moveHue = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
    setHsv([h, hsv[1], hsv[2]]);
  };

  const hueColor = `hsl(${hsv[0]}, 100%, 50%)`;
  const cx = hsv[1] * PICKER_W;
  const cy = (1 - hsv[2]) * PICKER_H;

  return (
    <div className="flex flex-col gap-2">
      {/* SV gradient */}
      <div
        ref={panelRef}
        style={{
          width: PICKER_W, height: PICKER_H,
          position: "relative", cursor: "crosshair", userSelect: "none",
          border: "1px solid #d0d0d0",
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveSV(e); }}
        onPointerMove={(e) => { if (e.buttons) moveSV(e); }}
      >
        <div style={{ position: "absolute", inset: 0, background: hueColor }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #fff, transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #000)" }} />
        {/* Cursor */}
        <div style={{
          position: "absolute", left: cx, top: cy,
          width: 10, height: 10, borderRadius: "50%",
          border: "2px solid white", boxShadow: "0 0 0 1.5px #000",
          transform: "translate(-50%, -50%)", pointerEvents: "none",
        }} />
      </div>

      {/* Hue bar */}
      <div
        ref={hueRef}
        style={{
          width: PICKER_W, height: 14,
          background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
          position: "relative", cursor: "pointer", userSelect: "none",
          border: "1px solid #d0d0d0",
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveHue(e); }}
        onPointerMove={(e) => { if (e.buttons) moveHue(e); }}
      >
        <div style={{
          position: "absolute", top: -1, bottom: -1,
          left: (hsv[0] / 360) * PICKER_W,
          width: 4, border: "2px solid white",
          boxShadow: "0 0 0 1px #000",
          transform: "translateX(-50%)", pointerEvents: "none",
        }} />
      </div>

      {/* Preview + hex input */}
      <div className="flex items-center gap-2 mt-1">
        <div style={{ width: 24, height: 24, backgroundColor: currentHex, border: "1px solid #0a0a0a", flexShrink: 0 }} />
        <span className="font-mono text-[12px] text-[#666]">Primary</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            const v = e.target.value;
            setInputVal(v);
            const norm = v.startsWith("#") ? v : "#" + v;
            if (/^#[0-9a-fA-F]{6}$/.test(norm)) {
              try { setHsv(hexToHsv(norm)); } catch { /* ignore */ }
            }
          }}
          className="flex-1 font-mono text-[13px] text-[#0a0a0a] bg-transparent border-b-2 border-[#e8e8e4] outline-none focus:border-[#0a0a0a] transition-colors uppercase"
          style={{ padding: "2px 0" }}
          spellCheck={false}
          placeholder="#6366f1"
        />
      </div>
    </div>
  );
}

// ── Main SplitHomepage component ──────────────────────────────────────────

export default function SplitHomepage({
  onImageUpload, onManualGenerate, isLoading, error, onErrorDismiss
}: Props) {
  const [isDragging, setIsDragging]   = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("split-complementary");

  const [primaryHex, setPrimaryHex]     = useState("#6366f1");
  const [fields, setFields]             = useState({
    secondary: "",
    tertiary:  "",
    accent:    "",
  });
  const [formError, setFormError]       = useState("");

  const setField = (key: keyof typeof fields, val: string) => {
    setFields((f) => ({ ...f, [key]: val }));
    if (formError) setFormError("");
  };

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        alert("Unsupported format. Please use JPG, PNG, WEBP, GIF, or AVIF.");
        return;
      }
      onImageUpload(file, URL.createObjectURL(file));
    },
    [onImageUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleGenerate = () => {
    const primaryVal = primaryHex.trim();
    if (!primaryVal || !isValidHex(primaryVal)) {
      setFormError("Please select a valid primary color");
      return;
    }

    const primary = normalizeHex(primaryVal);
    const explicitKeys: (keyof ManualRoles)[] = ["primary"];

    const secondary = fields.secondary && isValidHex(fields.secondary) ? normalizeHex(fields.secondary) : null;
    const tertiary  = fields.tertiary  && isValidHex(fields.tertiary)  ? normalizeHex(fields.tertiary)  : null;
    const accent    = fields.accent    && isValidHex(fields.accent)    ? normalizeHex(fields.accent)    : null;

    if (secondary) explicitKeys.push("secondary");
    if (tertiary)  explicitKeys.push("tertiary");
    if (accent)    explicitKeys.push("accent");

    const generated = generateHarmonyColors(primary, harmonyMode);
    const roles: ManualRoles = {
      primary,
      secondary: secondary ?? generated.secondary,
      tertiary:  tertiary  ?? generated.tertiary,
      accent:    accent    ?? generated.accent,
    };

    setFormError("");
    onManualGenerate(roles, explicitKeys, harmonyMode);
  };

  // Live preview for secondary/tertiary/accent
  const generated = generateHarmonyColors(normalizeHex(isValidHex(primaryHex) ? primaryHex : "#6366f1"), harmonyMode);

  const getSwatchColor = (key: "secondary" | "tertiary" | "accent"): string => {
    const val = fields[key];
    if (val && isValidHex(val)) return normalizeHex(val);
    return generated[key];
  };

  const isAutoGenerated = (key: "secondary" | "tertiary" | "accent"): boolean =>
    !fields[key] || !isValidHex(fields[key]);

  const OTHER_ROLES: { key: "secondary" | "tertiary" | "accent"; label: string }[] = [
    { key: "secondary", label: "Secondary" },
    { key: "tertiary",  label: "Tertiary"  },
    { key: "accent",    label: "Accent"    },
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: "100svh" }}>

      {/* ── Top bar ── */}
      <div className="border-b-2 border-[#0a0a0a] px-8 md:px-12 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 bg-[#0a0a0a]" />
          <span className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#0a0a0a]">
            Design System Generator
          </span>
        </div>
        <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb] hidden sm:block">
          Generate · Export · Use
        </span>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="border-b border-[#dc2626] bg-[#fef2f2] px-8 md:px-12 py-3 flex items-center justify-between shrink-0">
          <span className="font-mono text-[12px] text-[#dc2626]">{error}</span>
          <button onClick={onErrorDismiss} className="font-mono text-[12px] text-[#dc2626] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Loading strip ── */}
      {isLoading && (
        <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-3 flex items-center gap-4 shrink-0">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-5 h-5 bg-[#0a0a0a]"
                style={{ animation: `gridPulse 1s ease-in-out ${i * 0.12}s infinite` }}
              />
            ))}
          </div>
          <span className="font-mono text-[12px] uppercase tracking-widest text-[#888]">
            Analyzing pixel data…
          </span>
        </div>
      )}

      {/* ── Main split ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#0a0a0a]">

        {/* ── LEFT: Image upload ── */}
        <div
          className={`relative flex flex-col cursor-crosshair select-none min-h-[60vmin] md:min-h-0 transition-colors duration-150 ${
            isDragging ? "bg-[#f0f0ec]" : "hover:bg-[#f5f5f3]"
          }`}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isLoading && inputRef.current?.click()}
        >
          {/* Corner marks */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 border-[#0a0a0a] opacity-30" />
            <div className="absolute top-8 right-8 w-5 h-5 border-t-2 border-r-2 border-[#0a0a0a] opacity-30" />
            <div className="absolute bottom-8 left-8 w-5 h-5 border-b-2 border-l-2 border-[#0a0a0a] opacity-30" />
            <div className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 border-[#0a0a0a] opacity-30" />
          </div>

          <div className="relative flex flex-col h-full p-10 md:p-14 lg:p-20">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa]">01</span>
              <div className="flex gap-4">
                {["JPG", "PNG", "WEBP", "GIF"].map((f) => (
                  <span key={f} className="font-mono text-[12px] uppercase tracking-widest text-[#ccc]">{f}</span>
                ))}
              </div>
            </div>

            <div className="py-12 md:py-16">
              <h2 className="font-black text-[clamp(3rem,7vw,5.5rem)] uppercase leading-[0.86] tracking-tighter text-[#0a0a0a]">
                {isDragging ? "Release →" : <span>From<br />Image</span>}
              </h2>
            </div>

            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed border-[#0a0a0a] min-h-[42vmin] md:min-h-[280px] transition-colors duration-150 ${
                isDragging ? "bg-[#f0f0ec]" : ""
              }`}
            >
              <div className="border-2 border-[#0a0a0a] w-14 h-14 flex items-center justify-center mb-8">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path d="M9 13V4M9 4L5 8M9 4l4 4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2.5 15h13" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="font-black text-xl uppercase tracking-tight">Drop Image Here</p>
              <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#999] mt-3">
                Or Click Anywhere To Browse
              </p>
              <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#bbb] mt-5">
                JPG · PNG · WEBP · GIF · AVIF · max 10 MB
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            className="hidden"
          />
        </div>

        {/* ── RIGHT: Brand Colors with HSV picker ── */}
        <div className="flex flex-col p-10 md:p-14 lg:p-20 min-h-[60vmin] md:min-h-0">
          <span className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa]">02</span>

          <div className="py-8 md:py-10">
            <h2 className="font-black text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
              From<br />Brand<br />Colors
            </h2>
          </div>

          {/* Primary color: inline HSV picker */}
          <div className="mb-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">
              Primary Color
              <span className="text-[#dc2626] ml-2">required</span>
            </p>
            <InlineColorPicker
              value={primaryHex}
              onChange={(hex) => {
                setPrimaryHex(hex);
                if (formError) setFormError("");
              }}
            />
          </div>

          {/* Harmony mode picker */}
          <div className="mb-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">
              Color Harmony
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HARMONY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setHarmonyMode(mode.id)}
                  className="font-mono text-[12px] uppercase tracking-[0.2em] px-3 py-1.5 transition-all"
                  style={{
                    backgroundColor: harmonyMode === mode.id ? "#0a0a0a" : "transparent",
                    color: harmonyMode === mode.id ? "#f9f9f7" : "#888",
                    border: harmonyMode === mode.id ? "1px solid #0a0a0a" : "1px solid #e8e8e4",
                  }}
                  title={mode.label}
                >
                  {mode.short}
                </button>
              ))}
            </div>

            {/* Harmony preview strip */}
            <div className="flex gap-1 mt-3">
              {["primary", "secondary", "tertiary", "accent"].map((role) => {
                const val = role === "primary"
                  ? normalizeHex(isValidHex(primaryHex) ? primaryHex : "#6366f1")
                  : generated[role as keyof typeof generated];
                return (
                  <div
                    key={role}
                    className="flex-1 h-3"
                    style={{ backgroundColor: val }}
                    title={`${role}: ${val}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Secondary / Tertiary / Accent hex inputs */}
          <div className="mb-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">
              Other Colors <span className="text-[#bbb] normal-case tracking-normal ml-1">(optional — auto-generated if blank)</span>
            </p>
            <div className="space-y-4">
              {OTHER_ROLES.map(({ key, label }) => {
                const auto  = isAutoGenerated(key);
                const swatch = getSwatchColor(key);
                return (
                  <div key={key} className="flex items-center gap-4">
                    {/* Label */}
                    <div className="min-w-[72px]">
                      <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#888]">
                        {label}
                      </span>
                      <span className="font-mono text-[12px] block text-[#bbb] mt-0.5">
                        {auto ? "auto" : "custom"}
                      </span>
                    </div>

                    {/* Swatch + native picker overlay */}
                    <div className="relative w-7 h-7 shrink-0">
                      <div
                        className="w-7 h-7 border border-[#d8d8d4] transition-colors"
                        style={{ backgroundColor: swatch, opacity: auto ? 0.55 : 1 }}
                      />
                      <input
                        type="color"
                        value={isValidHex(fields[key]) ? normalizeHex(fields[key]) : swatch}
                        onChange={(e) => setField(key, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    {/* Hex text input */}
                    <input
                      type="text"
                      value={fields[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder={auto ? generated[key] : "optional"}
                      className="flex-1 font-mono text-[12px] text-[#0a0a0a] bg-transparent border-b-2 border-[#e8e8e4] pb-2 outline-none focus:border-[#0a0a0a] transition-colors placeholder-[#ccc] max-w-[150px] uppercase"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {formError && (
            <p className="font-mono text-[12px] text-[#dc2626] mb-4">{formError}</p>
          )}

          {/* CTA */}
          <div className="mt-auto">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="font-mono text-[12px] uppercase tracking-[0.2em] bg-[#0a0a0a] text-white px-10 py-4 hover:bg-[#1a1a1a] active:bg-[#333] transition-colors disabled:opacity-40"
            >
              Generate System →
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t-2 border-[#0a0a0a] px-8 md:px-12 py-4 flex items-center justify-between shrink-0">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb]">
          Colors · Typography · Spacing · Radius · Shadows · Components · WCAG · CSS / Tailwind / Figma
        </p>
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb] hidden sm:block">
          Janvi Guliyan · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
