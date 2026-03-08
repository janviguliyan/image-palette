"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DesignSystem,
  getContrastColor,
  generateHarmonyColors,
  type HarmonyMode,
  hexToHsl,
  hslToHex,
} from "@/lib/colorUtils";

export type PaletteTheme = "light" | "dark";

type RoleKey = "primary" | "secondary" | "tertiary" | "accent";
type LocalRoles = Record<RoleKey, string>;

interface Props {
  ds: DesignSystem;
  imageUrl: string | null;
  inputSource: "image" | "manual";
  theme: PaletteTheme;
  onThemeChange: (t: PaletteTheme) => void;
  explicitRoleKeys?: RoleKey[];
  onRolesChange?: (roles: LocalRoles) => void;
  initialHarmonyMode?: HarmonyMode;
}

const PALETTE_TYPES: { label: string; mode: HarmonyMode }[] = [
  { label: "Split",         mode: "split-complementary" },
  { label: "Analogous",     mode: "analogous"           },
  { label: "Complementary", mode: "complementary"       },
  { label: "Monochromatic", mode: "monochromatic"       },
  { label: "Triadic",       mode: "triadic"             },
  { label: "Square",        mode: "tetradic"            },
];

const ROLES: { key: RoleKey; label: string }[] = [
  { key: "primary",   label: "Primary"   },
  { key: "secondary", label: "Secondary" },
  { key: "tertiary",  label: "Tertiary"  },
  { key: "accent",    label: "Accent"    },
];

// ── Color conversion: hex <-> HSV ───────────────────────────────────────────

function hexToHsv(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const diff = max - min;
  const v = max;
  const s = max === 0 ? 0 : diff / max;
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

function applyContrast(roles: LocalRoles, contrastValue: number): LocalRoles {
  if (contrastValue === 50) return roles;
  const shift = (contrastValue - 50) / 100;
  const adjustHex = (hex: string): string => {
    const { h, s, l } = hexToHsl(hex);
    const newL = Math.max(0.06, Math.min(0.94, l - shift * 0.5));
    return hslToHex(h, s, newL);
  };
  return {
    primary:   adjustHex(roles.primary),
    secondary: adjustHex(roles.secondary),
    tertiary:  adjustHex(roles.tertiary),
    accent:    adjustHex(roles.accent),
  };
}

// ── Inline HSV Color Picker Popover ────────────────────────────────────────

const PANEL_W = 224;
const PANEL_H = 152;

function ColorPickerPopover({
  hex,
  anchorRect,
  onEdit,
  onClose,
}: {
  hex: string;
  anchorRect: DOMRect;
  onEdit: (hex: string) => void;
  onClose: () => void;
}) {
  const safeHex  = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#6366f1";
  const [hsv, setHsv]   = useState<[number, number, number]>(() => hexToHsv(safeHex));
  const [inputVal, setInputVal] = useState(safeHex.toUpperCase());
  const panelRef = useRef<HTMLDivElement>(null);
  const hueRef   = useRef<HTMLDivElement>(null);
  const rootRef  = useRef<HTMLDivElement>(null);

  const currentHex = hsvToHex(...hsv);

  // Sync hex input text when HSV changes
  useEffect(() => { setInputVal(currentHex.toUpperCase()); }, [currentHex]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, [onClose]);

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

  // Position: prefer below the anchor, fall back to above
  const PICKER_H = PANEL_H + 120;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top  = spaceBelow > PICKER_H + 16
    ? anchorRect.bottom + 8
    : anchorRect.top - PICKER_H - 8;
  const left = Math.min(anchorRect.left, window.innerWidth - PANEL_W - 40);

  const hueColor = `hsl(${hsv[0]}, 100%, 50%)`;
  const cx = hsv[1] * PANEL_W;
  const cy = (1 - hsv[2]) * PANEL_H;

  return createPortal(
    <div
      ref={rootRef}
      style={{
        position: "fixed", top, left,
        width: PANEL_W + 28,
        background: "#ffffff",
        border: "2px solid #0a0a0a",
        boxShadow: "4px 4px 0 #0a0a0a",
        padding: 14,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* SV gradient panel */}
      <div
        ref={panelRef}
        style={{
          width: PANEL_W, height: PANEL_H,
          position: "relative", cursor: "crosshair", userSelect: "none",
          border: "1px solid #e8e8e4",
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveSV(e); }}
        onPointerMove={(e) => { if (e.buttons) moveSV(e); }}
      >
        <div style={{ position: "absolute", inset: 0, background: hueColor }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #fff, transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #000)" }} />
        {/* Crosshair cursor */}
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
          width: PANEL_W, height: 14, marginTop: 8,
          background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
          position: "relative", cursor: "pointer", userSelect: "none",
          border: "1px solid #e8e8e4",
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveHue(e); }}
        onPointerMove={(e) => { if (e.buttons) moveHue(e); }}
      >
        {/* Hue thumb */}
        <div style={{
          position: "absolute", top: -2, bottom: -2,
          left: (hsv[0] / 360) * PANEL_W,
          width: 4, border: "2px solid white",
          boxShadow: "0 0 0 1px #000",
          transform: "translateX(-50%)", pointerEvents: "none",
        }} />
      </div>

      {/* Preview + Hex input */}
      <div className="flex items-center gap-2 mt-3">
        <div style={{ width: 28, height: 28, backgroundColor: currentHex, border: "1px solid #0a0a0a", flexShrink: 0 }} />
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
          className="font-mono text-[13px] border-b-2 border-black bg-transparent outline-none flex-1 uppercase"
          style={{ padding: "2px 0" }}
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end mt-3">
        <button
          onClick={onClose}
          className="font-mono text-[12px] px-3 py-1.5 border border-[#d0d0d0] text-[#888] hover:border-black hover:text-black transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => { onEdit(currentHex); onClose(); }}
          className="font-mono text-[12px] px-4 py-1.5 bg-[#0a0a0a] text-white hover:bg-[#333] transition-colors"
        >
          Apply
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Swatch card ─────────────────────────────────────────────────────────────

function ColorSwatchCard({
  hex,
  label,
  onCopy,
  copied,
  onEdit,
}: {
  hex: string;
  label: string;
  onCopy: () => void;
  copied: boolean;
  onEdit: (color: string) => void;
}) {
  const [editOpen, setEditOpen]   = useState(false);
  const [btnRect, setBtnRect]     = useState<DOMRect | null>(null);
  const [mounted, setMounted]     = useState(false);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const textColor  = getContrastColor(hex);

  useEffect(() => { setMounted(true); }, []);

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editBtnRef.current) setBtnRect(editBtnRef.current.getBoundingClientRect());
    setEditOpen(true);
  };

  const alpha = (opacity: number) =>
    textColor === "#ffffff"
      ? `rgba(255,255,255,${opacity})`
      : `rgba(0,0,0,${opacity})`;

  return (
    <div
      className="flex-1 shrink-0 flex flex-col -mr-px"
      style={{ backgroundColor: hex, minHeight: 190, minWidth: 0, border: "1px solid #000", position: "relative" }}
    >
      {/* Top: label + hex + edit button */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12px] font-medium truncate" style={{ color: textColor }}>
            {label}
          </p>
          <p className="font-mono text-[13px] mt-0.5 truncate" style={{ color: textColor, opacity: 0.75 }}>
            {hex.toUpperCase()}
          </p>
        </div>

        {/* Edit button — always visible, slightly transparent */}
        <button
          ref={editBtnRef}
          className="w-8 h-8 flex items-center justify-center text-[13px] rounded-sm transition-all shrink-0 ml-2"
          style={{
            backgroundColor: alpha(0.12),
            color: textColor,
            border: `1px solid ${alpha(0.18)}`,
          }}
          onClick={openEdit}
          title="Edit color"
        >
          ✏
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: copy button — always visible */}
      <button
        className="w-full flex items-center gap-2 px-4 py-3 font-mono text-[12px] transition-all hover:opacity-70"
        style={{
          color: textColor,
          borderTop: `1px solid ${alpha(0.15)}`,
          backgroundColor: copied ? alpha(0.12) : "transparent",
        }}
        onClick={(e) => { e.stopPropagation(); onCopy(); }}
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 6l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2.5 8V2.5A.5.5 0 0 1 3 2h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Color picker portal */}
      {editOpen && btnRect && mounted && (
        <ColorPickerPopover
          hex={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#6366f1"}
          anchorRect={btnRect}
          onEdit={(c) => { onEdit(c); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function PaletteResults({
  ds,
  imageUrl,
  inputSource,
  theme,
  onThemeChange,
  explicitRoleKeys,
  onRolesChange,
  initialHarmonyMode,
}: Props) {
  const [copied, setCopied]             = useState<string | null>(null);
  const [currentMode, setCurrentMode]   = useState<HarmonyMode>(
    initialHarmonyMode ?? "split-complementary"
  );
  const [localRoles, setLocalRoles]     = useState<LocalRoles>(ds.roles);
  const [contrastValue, setContrastValue] = useState(50);
  const skipNextSyncRef = useRef(false);

  // Sync with a genuinely new palette from outside — but skip when the change
  // originated from this component (handleTypeChange / handleColorEdit).
  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setLocalRoles(ds.roles);
    setContrastValue(50);
    if (initialHarmonyMode) setCurrentMode(initialHarmonyMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ds.roles.primary,
    ds.roles.secondary,
    ds.roles.tertiary,
    ds.roles.accent,
  ]);

  const displayRoles = applyContrast(localRoles, contrastValue);

  const copy = async (hex: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const el = document.createElement("textarea");
      el.value = hex; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const handleTypeChange = (mode: HarmonyMode) => {
    skipNextSyncRef.current = true;
    setCurrentMode(mode);
    const newColors = generateHarmonyColors(localRoles.primary, mode);
    const newRoles: LocalRoles = { primary: localRoles.primary, ...newColors };
    setLocalRoles(newRoles);
    onRolesChange?.(newRoles);
  };

  const handleColorEdit = (key: RoleKey, newHex: string) => {
    skipNextSyncRef.current = true;
    let newRoles: LocalRoles;
    if (key === "primary") {
      const newColors = generateHarmonyColors(newHex, currentMode);
      newRoles = { primary: newHex, ...newColors };
    } else {
      newRoles = { ...localRoles, [key]: newHex };
    }
    setLocalRoles(newRoles);
    onRolesChange?.(newRoles);
  };

  const applyContrastChanges = () => {
    if (contrastValue === 50) return;
    skipNextSyncRef.current = true;
    setLocalRoles(displayRoles);
    onRolesChange?.(displayRoles);
    setContrastValue(50);
  };

  // ── Swatch grid (2×2) ────────────────────────────────────────────────────

  const SwatchGrid = ({ panelKey }: { panelKey: "light" | "dark" }) => {
    const isDark = panelKey === "dark";
    return (
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ border: "1px solid #000", backgroundColor: isDark ? "#1a1c1e" : "#fafafa" }}
      >
        {/* Swatch rows */}
        <div>
          <div className="flex items-stretch" style={{ marginBottom: -1 }}>
            {ROLES.slice(0, 2).map(({ key, label }) => {
              const id = `${panelKey}-r1-${key}`;
              return (
                <ColorSwatchCard
                  key={id}
                  hex={displayRoles[key]}
                  label={label}
                  onCopy={() => copy(displayRoles[key], id)}
                  copied={copied === id}
                  onEdit={(c) => handleColorEdit(key, c)}
                />
              );
            })}
          </div>
          <div className="flex items-stretch">
            {ROLES.slice(2, 4).map(({ key, label }) => {
              const id = `${panelKey}-r2-${key}`;
              return (
                <ColorSwatchCard
                  key={id}
                  hex={displayRoles[key]}
                  label={label}
                  onCopy={() => copy(displayRoles[key], id)}
                  copied={copied === id}
                  onEdit={(c) => handleColorEdit(key, c)}
                />
              );
            })}
          </div>
        </div>
        {/* Theme label */}
        <p
          className="font-mono font-medium text-center py-3 px-2"
          style={{ fontSize: "clamp(1rem, 2.5vw, 2rem)", color: isDark ? "#fafafa" : "#1a1c1e" }}
        >
          {isDark ? "DARK THEME" : "LIGHT THEME"}
        </p>
      </div>
    );
  };

  // ── Inner palette controls (reused in both layouts) ──────────────────────

  const paletteControls = (
    <>
      {/* Palette type selector */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[16px] text-[#1a1c1e]">Type of palette</p>
        <div className="flex flex-wrap gap-2 items-center">
          {PALETTE_TYPES.map(({ label, mode }) => (
            <button
              key={mode}
              onClick={() => handleTypeChange(mode)}
              className="px-4 py-2 font-mono text-[12px] whitespace-nowrap transition-colors"
              style={{
                backgroundColor: currentMode === mode ? "#1a1c1e" : "transparent",
                color:           currentMode === mode ? "#f6f6f8" : "#000",
                border:          "1px solid #000",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[12px] text-[#888]">
          Changing type regenerates secondary, tertiary & accent from your primary.
          Use ✏ on any swatch to edit individual colors.
        </p>
      </div>

      {/* Theme swatch grids */}
      <div className="flex gap-4 items-start flex-col md:flex-row">
        <SwatchGrid panelKey="light" />
        <SwatchGrid panelKey="dark"  />
      </div>

      {/* Contrast slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[16px] text-[#1a1c1e]">Contrast</p>
          <span className="font-mono text-[12px] text-[#aaa]">
            {contrastValue < 40 ? "Lighter" : contrastValue > 60 ? "Darker" : "Default"}
            {" · "}{contrastValue}%
          </span>
        </div>

        <div className="relative" style={{ height: 40 }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to right, #ffffff, #888888, #000000)", border: "1px solid #000" }}
          />
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `calc(${contrastValue}% - 16px)`,
              width: 32,
              border: "2px solid #000",
              backgroundColor: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(2px)",
            }}
          />
          <input
            type="range" min="0" max="100" value={contrastValue}
            onChange={(e) => setContrastValue(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Contrast value"
          />
        </div>

        <p className="font-mono text-[12px] text-[#888]">
          Drag to preview lightness shifts. Click "Apply" to commit.
        </p>
      </div>

      {/* Action buttons */}
      {contrastValue !== 50 && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={applyContrastChanges}
            className="font-mono text-[12px] px-6 py-3 flex items-center gap-2 hover:opacity-85 transition-opacity"
            style={{ backgroundColor: "#1a1c1e", color: "#f6f6f8", border: "1px solid #1a1c1e" }}
          >
            Apply contrast changes
          </button>
          <button
            onClick={() => setContrastValue(50)}
            className="font-mono text-[12px] border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="border-b-2 border-black pb-16 pt-10 px-8 md:px-12 xl:px-20 flex flex-col gap-10">

      {/* Section heading */}
      <div className="flex items-start justify-between whitespace-nowrap">
        <div
          className="font-black text-black"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
        >
          <p>Color</p>
          <p>Palette</p>
        </div>
        <p
          className="font-black"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(3rem, 8vw, 7.5rem)",
            lineHeight: 0.85,
            color: "rgba(0,0,0,0.06)",
          }}
        >
          01
        </p>
      </div>

      {/* Layout: 2-col when image present, single col otherwise */}
      {imageUrl ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: uploaded image */}
          <div className="w-full lg:w-[38%] shrink-0">
            <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#aaa] mb-3">
              Source Image
            </p>
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full border-2 border-black"
              style={{ objectFit: "cover", maxHeight: 520 }}
            />
          </div>
          {/* Right: controls */}
          <div className="flex-1 flex flex-col gap-8 min-w-0">
            {paletteControls}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {paletteControls}
        </div>
      )}
    </div>
  );
}
