"use client";

import { useState, useEffect, useRef } from "react";
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

/** Shift the lightness of all palette colors by a contrast value (0–100, 50 = no change) */
function applyContrast(roles: LocalRoles, contrastValue: number): LocalRoles {
  if (contrastValue === 50) return roles;
  const shift = (contrastValue - 50) / 100; // -0.5 → lighter, +0.5 → darker
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

// ── Swatch card ────────────────────────────────────────────────────────────────

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
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textColor = getContrastColor(hex);

  return (
    <div
      className="flex-1 overflow-hidden shrink-0 relative cursor-pointer -mr-px"
      style={{ backgroundColor: hex, height: 200, minWidth: 0, border: "1px solid #000" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onCopy}
    >
      {/* Hidden native color picker */}
      <input
        ref={inputRef}
        type="color"
        value={hex.length === 7 ? hex : "#000000"}
        onChange={(e) => onEdit(e.target.value)}
        className="sr-only"
        aria-label={`Edit ${label} color`}
      />

      <div className="absolute inset-0 p-5 flex flex-col justify-between font-mono pointer-events-none">
        {/* Top row: label + edit button */}
        <div className="flex items-start justify-between">
          <p className="text-[13px] font-medium truncate" style={{ color: textColor }}>
            {label}
          </p>
          {/* Edit pencil — re-enable pointer events only for this button */}
          <button
            className="w-8 h-8 flex items-center justify-center text-[14px] transition-all rounded-sm pointer-events-auto shrink-0"
            style={{
              opacity: hovered ? 1 : 0,
              backgroundColor:
                textColor === "#ffffff" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.1)",
              color: textColor,
            }}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            title="Edit color"
            tabIndex={hovered ? 0 : -1}
          >
            ✏
          </button>
        </div>

        {/* Bottom: hex + copy hint */}
        <div style={{ color: textColor }}>
          <p className="text-[18px] font-medium mb-1">{hex.toUpperCase()}</p>
          <p
            className="text-[12px] transition-opacity"
            style={{ opacity: hovered ? 0.85 : 0 }}
          >
            {copied ? "✓ Copied!" : "Click to copy"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

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
  const [copied, setCopied]               = useState<string | null>(null);
  const [currentMode, setCurrentMode]     = useState<HarmonyMode>(
    initialHarmonyMode ?? "split-complementary"
  );
  const [localRoles, setLocalRoles]       = useState<LocalRoles>(ds.roles);
  const [contrastValue, setContrastValue] = useState(50);

  // Sync with external ds when a genuinely new palette is generated
  useEffect(() => {
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

  // Compute display colors (contrast-shifted for visual preview)
  const displayRoles = applyContrast(localRoles, contrastValue);

  const copy = async (hex: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const el = document.createElement("textarea");
      el.value = hex;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const handleTypeChange = (mode: HarmonyMode) => {
    setCurrentMode(mode);
    const newColors = generateHarmonyColors(localRoles.primary, mode);
    const newRoles: LocalRoles = {
      primary:   localRoles.primary,
      ...newColors,
    };
    setLocalRoles(newRoles);
    onRolesChange?.(newRoles);
  };

  const handleColorEdit = (key: RoleKey, newHex: string) => {
    if (key === "primary") {
      // Regenerate harmony from new primary
      const newColors = generateHarmonyColors(newHex, currentMode);
      const newRoles: LocalRoles = { primary: newHex, ...newColors };
      setLocalRoles(newRoles);
      onRolesChange?.(newRoles);
    } else {
      const newRoles = { ...localRoles, [key]: newHex };
      setLocalRoles(newRoles);
      onRolesChange?.(newRoles);
    }
  };

  const applyContrastChanges = () => {
    if (contrastValue === 50) return;
    setLocalRoles(displayRoles);
    onRolesChange?.(displayRoles);
    setContrastValue(50);
  };

  // ── Sub-component: theme swatch grid ──────────────────────────────────────

  const ThemeGrid = ({ panelKey }: { panelKey: "light" | "dark" }) => {
    const isDark = panelKey === "dark";
    return (
      <div
        className="flex-1 min-w-0 flex flex-col overflow-hidden"
        style={{
          border: "1px solid #000",
          backgroundColor: isDark ? "#1a1c1e" : "#fafafa",
        }}
      >
        {/* Swatch rows */}
        <div style={{ backgroundColor: "#eaeaea" }}>
          {/* Row 1 */}
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
          {/* Row 2 */}
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
          style={{
            fontSize: "clamp(1.2rem, 3vw, 2.5rem)",
            color: isDark ? "#fafafa" : "#1a1c1e",
          }}
        >
          {isDark ? "DARK THEME" : "LIGHT THEME"}
        </p>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="border-b-2 border-black flex flex-col gap-10 overflow-hidden pb-20 pt-10 px-8 md:px-12 xl:px-20">

      {/* Section heading */}
      <div className="flex items-start justify-between whitespace-nowrap">
        <div
          className="font-black text-black"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
        >
          <p className="mb-0">Color</p>
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

      {/* Palette type selector */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[18px] text-[#1a1c1e]">Type of palette</p>
        <div className="flex flex-wrap gap-3 items-center">
          {PALETTE_TYPES.map(({ label, mode }) => (
            <button
              key={mode}
              onClick={() => handleTypeChange(mode)}
              className="px-5 py-2.5 font-mono text-[13px] whitespace-nowrap transition-colors"
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
          Changing type regenerates secondary, tertiary & accent from your primary color.
          Use the ✏ icon on any swatch to edit individual colors directly.
        </p>
      </div>

      {/* Theme grids */}
      <div className="flex gap-8 items-start flex-col lg:flex-row">
        <ThemeGrid panelKey="light" />
        <ThemeGrid panelKey="dark" />
      </div>

      {/* Contrast slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[18px] text-[#1a1c1e]">Contrast of palette</p>
          <span className="font-mono text-[12px] text-[#aaa]">
            {contrastValue < 40
              ? "Lighter"
              : contrastValue > 60
              ? "Darker"
              : "Default"}
            {" · "}
            {contrastValue}%
          </span>
        </div>

        <div className="relative" style={{ height: 40 }}>
          {/* Visual gradient track */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #ffffff, #888888, #000000)",
              border: "1px solid #000",
            }}
          />
          {/* Draggable thumb overlay */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none transition-all"
            style={{
              left: `calc(${contrastValue}% - 16px)`,
              width: 32,
              border: "2px solid #000",
              backgroundColor: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(2px)",
            }}
          />
          {/* Transparent range input for interaction */}
          <input
            type="range"
            min="0"
            max="100"
            value={contrastValue}
            onChange={(e) => setContrastValue(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Contrast value"
          />
        </div>

        <p className="font-mono text-[12px] text-[#888]">
          Drag to preview lightness shifts. Click the button below to commit changes to the palette.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        {contrastValue !== 50 && (
          <button
            onClick={applyContrastChanges}
            className="border border-black px-6 py-3 font-mono text-[13px] flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
            style={{ backgroundColor: "#1a1c1e", color: "#f6f6f8" }}
          >
            Apply contrast changes
          </button>
        )}
        <button
          onClick={() => setContrastValue(50)}
          className="border border-black px-6 py-3 font-mono text-[13px] flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
          style={{ display: contrastValue !== 50 ? "flex" : "none" }}
        >
          Reset contrast
        </button>
        <p className="font-mono text-[12px] text-[#888] self-center">
          Use ✏ icon on swatches to edit individual colors
        </p>
      </div>
    </div>
  );
}
