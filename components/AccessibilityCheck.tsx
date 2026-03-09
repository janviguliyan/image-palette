"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
        className={`flex items-center gap-2 px-2 py-1.5 font-mono text-[14px] font-semibold border 
        ${
          pass ? "text-[#126b37]" : "text-[#b42720]"
        }`}
      >
        <span>{pass ? "Pass" : "Fail"}</span>
        <span className="text-[12px]">{pass ? "✓" : "✕"}</span>
      </div>
      <p className="font-mono font-medium text-[16px] text-[#1a1c1e] whitespace-nowrap">{label}</p>
    </div>
  );
}

// ── HSV colour picker helpers ────────────────────────────────────────────────

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

function isValidHex6(v: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(v.trim());
}
function normalizeHex6(v: string) {
  const stripped = v.trim().replace(/^#/, "");
  return `#${stripped.toLowerCase()}`;
}

// ── ColorPickerPopup (portal, Figma node 40-2 design) ────────────────────────

interface PopupProps {
  hex: string;
  anchorEl: HTMLElement;
  onChange: (hex: string) => void;
  onClose: () => void;
}

function ColorPickerPopup({ hex, anchorEl, onChange, onClose }: PopupProps) {
  const safeHex = isValidHex6(hex) ? normalizeHex6(hex) : "#6366f1";
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(safeHex));
  const [hexInput, setHexInput] = useState(safeHex.slice(1).toUpperCase());

  const svRef  = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const currentHex = hsvToHex(...hsv);
  const [r, g, b]  = [
    parseInt(currentHex.slice(1, 3), 16),
    parseInt(currentHex.slice(3, 5), 16),
    parseInt(currentHex.slice(5, 7), 16),
  ];

  // Emit upstream on hsv change
  useEffect(() => { onChange(currentHex); }, [currentHex]); // eslint-disable-line

  // Sync hex input when HSV changes
  useEffect(() => { setHexInput(currentHex.slice(1).toUpperCase()); }, [currentHex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorEl]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Compute popup position (anchored below the swatch, shifted left if needed)
  const rect  = anchorEl.getBoundingClientRect();
  const PW    = 276; // popup width
  let   left  = rect.left;
  const top   = rect.bottom + 8;
  if (left + PW > window.innerWidth - 8) left = window.innerWidth - PW - 8;

  const SV_W = PW - 2; // inside border
  const SV_H = 180;

  const moveSV = useCallback((e: React.PointerEvent) => {
    const r2 = svRef.current!.getBoundingClientRect();
    const s  = Math.max(0, Math.min(1, (e.clientX - r2.left)  / r2.width));
    const v  = Math.max(0, Math.min(1, 1 - (e.clientY - r2.top) / r2.height));
    setHsv(([h]) => [h, s, v]);
  }, []);

  const moveHue = useCallback((e: React.PointerEvent) => {
    const r2 = hueRef.current!.getBoundingClientRect();
    const h  = Math.max(0, Math.min(360, ((e.clientX - r2.left) / r2.width) * 360));
    setHsv(([, s, v]) => [h, s, v]);
  }, []);

  const hueColor = `hsl(${hsv[0]}, 100%, 50%)`;
  const cx = hsv[1] * SV_W;
  const cy = (1 - hsv[2]) * SV_H;

  const applyHexInput = (raw: string) => {
    const v = raw.trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(v)) {
      setHsv(hexToHsv(`#${v}`));
    }
  };

  const applyRGB = (channel: "r" | "g" | "b", val: number) => {
    const clamped = Math.max(0, Math.min(255, val));
    const nr = channel === "r" ? clamped : r;
    const ng = channel === "g" ? clamped : g;
    const nb = channel === "b" ? clamped : b;
    const hex6 = `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
    setHsv(hexToHsv(hex6));
  };

  const inputCls = "border border-black px-2 py-1 font-mono text-[12px] text-[#212121] outline-none focus:border-[#2e31ea] w-full bg-white";

  return createPortal(
    <div
      ref={popupRef}
      style={{
        position: "fixed", top, left, zIndex: 9999, width: PW,
        backgroundColor: "#fff", border: "2px solid #0a0a0a",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
      }}
    >
      {/* SV gradient */}
      <div
        ref={svRef}
        style={{ width: SV_W, height: SV_H, position: "relative", cursor: "crosshair", userSelect: "none" }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveSV(e); }}
        onPointerMove={(e) => { if (e.buttons) moveSV(e); }}
      >
        <div style={{ position: "absolute", inset: 0, background: hueColor }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #fff, transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #000)" }} />
        {/* Crosshair */}
        <div style={{
          position: "absolute", left: cx, top: cy,
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid white", boxShadow: "0 0 0 1.5px #000",
          transform: "translate(-50%, -50%)", pointerEvents: "none",
        }} />
      </div>

      {/* Controls section */}
      <div className="flex flex-col gap-3 p-3">
        {/* Preview + sliders row */}
        <div className="flex items-center gap-3">
          {/* Current colour preview */}
          <div
            style={{ width: 40, height: 40, backgroundColor: currentHex, border: "1.5px solid #0a0a0a", flexShrink: 0 }}
          />

          {/* Hue + (placeholder) alpha sliders */}
          <div className="flex flex-col gap-2 flex-1">
            {/* Hue bar */}
            <div
              ref={hueRef}
              style={{
                height: 14, width: "100%",
                background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                position: "relative", cursor: "pointer", userSelect: "none",
                border: "1px solid #0a0a0a",
              }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveHue(e); }}
              onPointerMove={(e) => { if (e.buttons) moveHue(e); }}
            >
              <div style={{
                position: "absolute", top: -1, bottom: -1,
                left: `${(hsv[0] / 360) * 100}%`,
                width: 4, border: "2px solid white", boxShadow: "0 0 0 1px #000",
                transform: "translateX(-50%)", pointerEvents: "none",
              }} />
            </div>

            {/* Opacity bar (decorative — emits plain hex) */}
            <div style={{
              height: 14, width: "100%", position: "relative",
              border: "1px solid #0a0a0a", overflow: "hidden",
            }}>
              {/* checker */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%,#ccc),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%,#ccc)",
                backgroundSize: "8px 8px", backgroundPosition: "0 0, 4px 4px",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(to right, transparent, ${currentHex})`,
              }} />
              {/* thumb at right end (full opacity) */}
              <div style={{
                position: "absolute", top: -1, bottom: -1, right: 0,
                width: 4, border: "2px solid white", boxShadow: "0 0 0 1px #000",
                transform: "translateX(50%)", pointerEvents: "none",
              }} />
            </div>
          </div>
        </div>

        {/* HEX + RGB inputs */}
        <div className="flex gap-2 items-end">
          {/* HEX */}
          <div className="flex flex-col gap-1 flex-shrink-0" style={{ width: 90 }}>
            <span className="font-mono font-medium text-[11px] text-black">HEX</span>
            <input
              className={inputCls}
              value={hexInput}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9a-fA-F#]/g, "").slice(0, 7);
                setHexInput(v.replace(/^#/, "").toUpperCase());
              }}
              onBlur={(e) => applyHexInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyHexInput((e.target as HTMLInputElement).value); }}
              maxLength={6}
            />
          </div>

          {/* R G B */}
          {([["R", r], ["G", g], ["B", b]] as [string, number][]).map(([label, val]) => (
            <div key={label} className="flex flex-col gap-1 flex-1">
              <span className="font-mono font-medium text-[11px] text-black">{label}</span>
              <input
                className={inputCls}
                type="number" min={0} max={255}
                value={val}
                onChange={(e) => applyRGB(label.toLowerCase() as "r" | "g" | "b", parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Editable colour well (swatch → opens popup; hex field → direct type) ─────

interface ColorWellProps {
  label: string;
  color: string;
  onChange: (hex: string) => void;
  onCopy: () => void;
  copied: boolean;
}

function ColorWell({ label, color, onChange, onCopy, copied }: ColorWellProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [hexDraft, setHexDraft]   = useState(color.toUpperCase());
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Keep hex draft in sync with external colour changes
  useEffect(() => { setHexDraft(color.toUpperCase()); }, [color]);

  const commitHex = (raw: string) => {
    const norm = raw.trim().startsWith("#") ? raw.trim() : `#${raw.trim()}`;
    if (isValidHex6(norm)) onChange(normalizeHex6(norm));
    else setHexDraft(color.toUpperCase()); // revert bad input
  };

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <p className="font-mono text-[18px] text-[#1a1c1e]">{label}</p>
      <div className="border-2 border-black flex items-center gap-0 overflow-hidden">
        {/* Swatch — opens popup */}
        <button
          ref={swatchRef}
          onClick={() => setPopupOpen((o) => !o)}
          className="shrink-0 border-r border-black transition-opacity hover:opacity-80"
          style={{ width: 64, height: 64, backgroundColor: color }}
          title="Click to pick colour"
          aria-label={`Pick ${label.toLowerCase()} colour`}
        />

        {/* Direct hex input */}
        <div className="flex-1 flex items-center justify-between px-4 min-w-0">
          <input
            className="font-mono text-[15px] text-black bg-transparent outline-none border-none w-full uppercase"
            value={hexDraft}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9a-fA-F#]/g, "").slice(0, 7);
              setHexDraft(v.toUpperCase());
              const norm = v.startsWith("#") ? v : `#${v}`;
              if (isValidHex6(norm)) onChange(normalizeHex6(norm));
            }}
            onBlur={(e) => commitHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitHex((e.target as HTMLInputElement).value); }}
            spellCheck={false}
            maxLength={7}
            placeholder="#000000"
          />
          <button
            onClick={onCopy}
            className="ml-2 shrink-0 font-mono text-[13px] text-black hover:opacity-60 transition-opacity py-1.5"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Popup portal */}
      {mounted && popupOpen && swatchRef.current && (
        <ColorPickerPopup
          hex={color}
          anchorEl={swatchRef.current}
          onChange={onChange}
          onClose={() => setPopupOpen(false)}
        />
      )}
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

      {/* Color Picker — now with custom HSV popup + hex text inputs */}
      <div className="flex flex-col gap-4">
        <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Color Picker</p>

        <div className="flex gap-4 items-start flex-col sm:flex-row">
          <ColorWell
            label="Text Color"
            color={textColor}
            onChange={setTextColor}
            onCopy={() => copyHex(textColor, "text")}
            copied={copiedText}
          />
          <ColorWell
            label="Background Color"
            color={bgColor}
            onChange={setBgColor}
            onCopy={() => copyHex(bgColor, "bg")}
            copied={copiedBg}
          />
        </div>

        {/* Actions + Saved */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={reverseColors}
              className="border-2 border-black bg-[#f4f5f5] px-6 py-3 font-mono text-[14px] text-[#1a1c1e] hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              Reverse colours
            </button>
            <button
              onClick={savePair}
              className="border-2 border-black bg-[#f4f5f5] px-6 py-3 font-mono text-[14px] text-[#1a1c1e] hover:bg-[#0a0a0a] hover:text-white transition-colors"
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
      {/* <div className="border border-[#e8e8e4] bg-[#fffbeb] px-6 py-3 flex items-start gap-3">
        <span className="font-mono text-[12px] text-[#92400e] shrink-0 mt-0.5">⚠</span>
        <p className="font-mono text-[12px] text-[#92400e] leading-relaxed">
          Auto-generated palette — verify contrast ratios manually before shipping to production.
          WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).
        </p>
      </div> */}

      {/* Combo grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {combos.length === 0 ? (
          <p className="col-span-full font-mono text-[12px] text-[#aaa] text-center py-8">
            No WCAG AA-passing combinations found in this palette.
          </p>
        ) : (
          combos.map((combo, i) => <ContrastCard key={i} {...combo} />)
        )}
      </div> */}
    </div>
  );
}
