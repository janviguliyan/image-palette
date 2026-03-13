"use client";

import { useState } from "react";
import { getContrastColor, type DesignSystem } from "@/lib/colorUtils";

interface Props {
  ds: DesignSystem;
}

// ── Material 3 icon set (SVG paths) ────────────────────────────────────────
export const M3_ICONS: Record<string, JSX.Element> = {
  "Arrow Right": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
    </svg>
  ),
  "Arrow Left": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
    </svg>
  ),
  "Add": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>
    </svg>
  ),
  "Close": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  ),
  "Check": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  "Search": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>
    </svg>
  ),
  "Star": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  "Favorite": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/>
    </svg>
  ),
  "Download": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"/>
    </svg>
  ),
  "Upload": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5z"/>
    </svg>
  ),
  "Share": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
    </svg>
  ),
  "Edit": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  "Delete": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  ),
  "Settings": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a6.8 6.8 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 9.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ),
  "Person": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  "Home": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  "Notifications": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  ),
  "Info": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  "Warning": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  "Lock": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  "Send": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
  "Bookmark": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  ),
  "Palette": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  "Filter": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  ),
  "Refresh": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  ),
};

const M3_ICON_NAMES = Object.keys(M3_ICONS);

// ── Shared button style helpers ─────────────────────────────────────────────
interface BtnStyle {
  bg: string;
  color: string;
  border?: string;
  opacity?: number;
  cursor?: string;
}

function resolveButtonStyle(
  variant: "primary" | "secondary" | "ghost" | "danger",
  state: "default" | "hover" | "focused" | "active" | "disabled",
  ds: DesignSystem
): BtnStyle {
  const { scales, semantic } = ds;
  const p = scales.primary;
  const s = scales.secondary;
  const e = semantic.error;
  const pText = getContrastColor(p["500"]);
  const eText = getContrastColor(e["500"]);

  const base: Record<string, BtnStyle> = {
    primary:   { bg: p["500"], color: pText },
    secondary: { bg: s["50"],  color: s["700"], border: s["200"] },
    ghost:     { bg: "transparent", color: p["700"], border: p["200"] },
    danger:    { bg: e["500"], color: eText },
  };

  type S = "hover" | "focused" | "active" | "disabled";
  const overrides: Record<string, Record<S, Partial<BtnStyle>>> = {
    primary: {
      hover:    { bg: p["600"] },
      focused:  { bg: p["500"] },
      active:   { bg: p["700"] },
      disabled: { bg: p["200"], color: p["500"], opacity: 0.7, cursor: "not-allowed" },
    },
    secondary: {
      hover:    { bg: p["50"], border: p["300"], color: p["700"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"], border: p["600"], color: p["800"] },
      disabled: { opacity: 0.5, cursor: "not-allowed" },
    },
    ghost: {
      hover:    { bg: p["50"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"] },
      disabled: { opacity: 0.4, cursor: "not-allowed" },
    },
    danger: {
      hover:    { bg: e["600"] },
      focused:  { bg: e["500"] },
      active:   { bg: e["700"] },
      disabled: { bg: e["200"], color: e["500"], opacity: 0.6, cursor: "not-allowed" },
    },
  };

  const over = (overrides[variant] as Record<string, Partial<BtnStyle>>)[state] ?? {};
  return { ...base[variant], ...over };
}

// ── Static button cell (for the full matrix table) ─────────────────────────
function ButtonCell({
  label,
  size,
  variant,
  state,
  iconPosition,
  iconEl,
  ds,
}: {
  label?: string;
  size: "lg" | "sm";
  variant: "primary" | "secondary" | "ghost" | "danger";
  state: "default" | "hover" | "focused" | "active" | "disabled";
  iconPosition?: "left" | "right" | "only" | "none";
  iconEl?: JSX.Element;
  ds: DesignSystem;
}) {
  const resolved = resolveButtonStyle(variant, state, ds);
  const { semantic } = ds;
  const e = semantic.error;
  const p = ds.scales.primary;

  const px = size === "lg" ? "16px" : "11px";
  const py = size === "lg" ? "9px" : "6px";
  const fontSize = size === "lg" ? "0.8rem" : "0.7rem";
  const ring = state === "focused"
    ? `0 0 0 3px ${variant === "danger" ? e["100"] : p["100"]}`
    : undefined;
  const pos = iconPosition ?? "none";
  const lbl = label ?? (size === "lg" ? "Button" : "Btn");
  const icon = iconEl ?? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
    </svg>
  );

  return (
    <button
      disabled={state === "disabled"}
      style={{
        background: resolved.bg,
        color: resolved.color,
        border: resolved.border ? `1.5px solid ${resolved.border}` : "none",
        borderRadius: 6,
        padding: pos === "only" ? `${py} ${py}` : `${py} ${px}`,
        fontWeight: 600,
        fontSize,
        letterSpacing: "0.02em",
        cursor: resolved.cursor ?? "pointer",
        opacity: resolved.opacity,
        boxShadow: ring,
        display: "flex",
        alignItems: "center",
        gap: pos === "only" ? 0 : 5,
        whiteSpace: "nowrap",
        transition: "none",
      }}
    >
      {pos === "left"  && <span style={{ display: "flex", width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>{icon}</span>}
      {pos === "only"  && <span style={{ display: "flex", width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>{icon}</span>}
      {pos !== "only"  && <span>{lbl}</span>}
      {pos === "right" && <span style={{ display: "flex", width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>{icon}</span>}
    </button>
  );
}

// ── Button state matrix table ──────────────────────────────────────────────
const STATES = ["default", "hover", "focused", "active", "disabled"] as const;

function ButtonsTable({ ds }: { ds: DesignSystem }) {
  const ROWS: { label: string; variant: "primary" | "secondary" | "ghost" | "danger"; size: "lg" | "sm" }[] = [
    { label: "Primary LG",   variant: "primary",   size: "lg" },
    { label: "Primary SM",   variant: "primary",   size: "sm" },
    { label: "Secondary LG", variant: "secondary", size: "lg" },
    { label: "Secondary SM", variant: "secondary", size: "sm" },
    { label: "Ghost LG",     variant: "ghost",     size: "lg" },
    { label: "Ghost SM",     variant: "ghost",     size: "sm" },
    { label: "Danger LG",    variant: "danger",    size: "lg" },
    { label: "Danger SM",    variant: "danger",    size: "sm" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 720 }}>
        <thead>
          <tr className="border-b border-[#e8e8e4]">
            <th className="text-left pb-3 pr-6" style={{ width: 120 }}>
              <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb]">Variant</span>
            </th>
            {STATES.map((s) => (
              <th key={s} className="text-left pb-3 px-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb]">{s}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, variant, size }, i) => (
            <tr key={label} className={i < ROWS.length - 1 ? "border-b border-[#f0f0ec]" : ""}>
              <td className="py-2.5 pr-6">
                <span className="font-mono text-[11px] text-[#888] uppercase tracking-widest">{label}</span>
              </td>
              {STATES.map((state) => (
                <td key={state} className="py-2.5 px-3">
                  <div className="flex flex-col gap-1.5">
                    <ButtonCell variant={variant} size={size} state={state} iconPosition="none" ds={ds} />
                    <ButtonCell variant={variant} size={size} state={state} iconPosition="right" ds={ds} />
                    <ButtonCell variant={variant} size={size} state={state} iconPosition="left" ds={ds} />
                    <ButtonCell variant={variant} size={size} state={state} iconPosition="only" ds={ds} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-mono text-[11px] text-[#ccc] mt-4">
        Each cell shows: text only · icon right · icon left · icon only
      </p>
    </div>
  );
}

// ── Interactive button builder ────────────────────────────────────────────
function InteractiveButtonBuilder({ ds }: { ds: DesignSystem }) {
  const [variant, setVariant] = useState<"primary" | "secondary" | "ghost" | "danger">("primary");
  const [size, setSize] = useState<"lg" | "sm">("lg");
  const [showLeftIcon, setShowLeftIcon] = useState(false);
  const [showRightIcon, setShowRightIcon] = useState(true);
  const [showText, setShowText] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("Arrow Right");
  const [iconDropOpen, setIconDropOpen] = useState(false);

  const p = ds.scales.primary;
  const resolved = resolveButtonStyle(variant, "default", ds);
  const iconEl = M3_ICONS[selectedIcon];

  const px = size === "lg" ? "20px" : "14px";
  const py = size === "lg" ? "11px" : "7px";
  const fontSize = size === "lg" ? "0.9rem" : "0.78rem";
  const iconSize = size === "lg" ? 18 : 14;
  const scaledIcon = (
    <span style={{ display: "flex", width: iconSize, height: iconSize, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {M3_ICONS[selectedIcon]}
    </span>
  );

  const isIconOnly = !showText && (showLeftIcon || showRightIcon);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls panel */}
      <div className="flex flex-col gap-5" style={{ minWidth: 260 }}>
        {/* Variant */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-2">Variant</p>
          <div className="flex flex-wrap gap-2">
            {(["primary", "secondary", "ghost", "danger"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className="font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 border transition-colors"
                style={{
                  borderColor: variant === v ? p["500"] : "#ddd",
                  background: variant === v ? p["50"] : "#fff",
                  color: variant === v ? p["700"] : "#666",
                  fontWeight: variant === v ? 700 : 400,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-2">Size</p>
          <div className="flex gap-2">
            {(["lg", "sm"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 border transition-colors"
                style={{
                  borderColor: size === s ? p["500"] : "#ddd",
                  background: size === s ? p["50"] : "#fff",
                  color: size === s ? p["700"] : "#666",
                  fontWeight: size === s ? 700 : 400,
                }}
              >
                {s === "lg" ? "Large" : "Small"}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-2">Toggles</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Left Icon",  value: showLeftIcon,  set: setShowLeftIcon },
              { label: "Right Icon", value: showRightIcon, set: setShowRightIcon },
              { label: "Text",       value: showText,      set: setShowText },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer" onClick={() => set(!value)}>
                <span
                  style={{
                    width: 36, height: 20, borderRadius: 9999,
                    background: value ? p["500"] : "#ddd",
                    display: "flex", alignItems: "center", padding: "0 2px",
                    position: "relative", transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 14, height: 14, borderRadius: 9999, background: "#fff",
                      position: "absolute",
                      left: value ? 20 : 2,
                      transition: "left 0.15s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </span>
                <span className="font-mono text-[12px] text-[#555]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-2">Icon (Material 3)</p>
          <div className="relative">
            <button
              onClick={() => setIconDropOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 border font-mono text-[12px] text-[#444] transition-colors hover:border-black/30"
              style={{ borderColor: iconDropOpen ? p["500"] : "#ddd", background: "#fff" }}
            >
              <span className="flex items-center gap-2">
                <span style={{ display: "flex", width: 16, height: 16, alignItems: "center", justifyContent: "center", color: p["500"] }}>
                  {M3_ICONS[selectedIcon]}
                </span>
                {selectedIcon}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: iconDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                <path d="M2 4l4 4 4-4" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {iconDropOpen && (
              <div
                className="absolute top-full left-0 right-0 z-50 bg-white border border-[#ddd] shadow-lg"
                style={{ maxHeight: 220, overflowY: "auto" }}
              >
                {M3_ICON_NAMES.map((name) => (
                  <button
                    key={name}
                    onClick={() => { setSelectedIcon(name); setIconDropOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] transition-colors text-left"
                    style={{ background: selectedIcon === name ? p["50"] : "transparent" }}
                  >
                    <span style={{ display: "flex", width: 16, height: 16, alignItems: "center", justifyContent: "center", color: selectedIcon === name ? p["500"] : "#666" }}>
                      {M3_ICONS[name]}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: selectedIcon === name ? p["700"] : "#555" }}>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-4">Live Preview</p>
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: 140,
              background: "#f8f8f8",
              border: "1px solid #e8e8e4",
              borderRadius: 8,
            }}
          >
            <button
              style={{
                background: resolved.bg,
                color: resolved.color,
                border: resolved.border ? `1.5px solid ${resolved.border}` : "none",
                borderRadius: 8,
                padding: isIconOnly ? py : `${py} ${px}`,
                fontWeight: 600,
                fontSize,
                letterSpacing: "0.02em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: showLeftIcon || showRightIcon ? 8 : 0,
                transition: "all 0.15s",
              }}
            >
              {showLeftIcon  && scaledIcon}
              {showText      && "Button"}
              {showRightIcon && scaledIcon}
              {!showText && !showLeftIcon && !showRightIcon && (
                <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.5 }}>empty</span>
              )}
            </button>
          </div>
        </div>

        {/* All states preview */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#aaa] mb-3">All States</p>
          <div className="flex flex-wrap gap-3">
            {STATES.map((state) => {
              const s = resolveButtonStyle(variant, state, ds);
              const ring = state === "focused" ? `0 0 0 3px ${variant === "danger" ? ds.semantic.error["100"] : p["100"]}` : undefined;
              return (
                <div key={state} className="flex flex-col items-center gap-1.5">
                  <button
                    disabled={state === "disabled"}
                    style={{
                      background: s.bg,
                      color: s.color,
                      border: s.border ? `1.5px solid ${s.border}` : "none",
                      borderRadius: 6,
                      padding: `${py} ${px}`,
                      fontWeight: 600,
                      fontSize,
                      opacity: s.opacity,
                      cursor: s.cursor ?? "pointer",
                      boxShadow: ring,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "none",
                    }}
                  >
                    {showLeftIcon  && scaledIcon}
                    {showText      && "Button"}
                    {showRightIcon && scaledIcon}
                  </button>
                  <span className="font-mono text-[10px] text-[#aaa] capitalize">{state}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Form inputs ────────────────────────────────────────────────────────────
function FormInputs({ ds }: { ds: DesignSystem }) {
  const { scales, semantic, neutral } = ds;
  const p = scales.primary;
  const g = neutral;
  const err = semantic.error;

  const [textVal, setTextVal] = useState("");
  const [textFocused, setTextFocused] = useState(false);
  const [areaVal, setAreaVal] = useState("");
  const [areaFocused, setAreaFocused] = useState(false);
  const [selectVal, setSelectVal] = useState("Designer");
  const [selectFocused, setSelectFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropVal, setDropVal] = useState("Select option…");
  const [radio, setRadio] = useState("a");
  const [toggled, setToggled] = useState(false);

  const inputBase: React.CSSProperties = {
    display: "block",
    width: "100%",
    borderRadius: 6,
    fontSize: "0.875rem",
    color: g["900"],
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
  };

  const fieldStyle = (focused: boolean, error = false): React.CSSProperties => ({
    ...inputBase,
    padding: "9px 12px",
    border: `1.5px solid ${error ? err["500"] : focused ? p["500"] : g["200"]}`,
    boxShadow: focused ? `0 0 0 3px ${error ? err["100"] : p["100"]}` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const Label = ({ text, disabled }: { text: string; disabled?: boolean }) => (
    <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: disabled ? g["400"] : g["700"], marginBottom: 6 }}>
      {text}
    </label>
  );

  const FieldLabel = ({ text }: { text: string }) => (
    <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb] mb-3">{text}</p>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8 max-w-5xl">

      {/* Email — Empty */}
      <div>
        <FieldLabel text="Email · Empty" />
        <Label text="Email Address" />
        <input type="email" placeholder="hello@example.com" style={fieldStyle(false)} readOnly />
      </div>

      {/* Email — Filled */}
      <div>
        <FieldLabel text="Email · Filled" />
        <Label text="Email Address" />
        <input
          type="email"
          value={textVal || "user@example.com"}
          onChange={(e) => setTextVal(e.target.value)}
          onFocus={() => setTextFocused(true)}
          onBlur={() => setTextFocused(false)}
          style={fieldStyle(textFocused)}
        />
      </div>

      {/* Email — Error */}
      <div>
        <FieldLabel text="Email · Error" />
        <Label text="Email Address" />
        <input type="email" defaultValue="not-an-email" style={fieldStyle(false, true)} readOnly />
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.69rem", color: err["600"], marginTop: 5 }}>
          Invalid email address
        </p>
      </div>

      {/* Email — Disabled */}
      <div>
        <FieldLabel text="Email · Disabled" />
        <Label text="Email Address" disabled />
        <input
          type="email"
          disabled
          placeholder="hello@example.com"
          style={{ ...fieldStyle(false), background: g["50"], border: `1.5px solid ${g["100"]}`, color: g["400"], cursor: "not-allowed" }}
        />
      </div>

      {/* Textarea */}
      <div>
        <FieldLabel text="Textarea" />
        <Label text="Message" />
        <textarea
          placeholder="Write your message…"
          value={areaVal}
          onChange={(e) => setAreaVal(e.target.value)}
          onFocus={() => setAreaFocused(true)}
          onBlur={() => setAreaFocused(false)}
          rows={3}
          style={{ ...fieldStyle(areaFocused), resize: "vertical" }}
        />
      </div>

      {/* Select */}
      <div>
        <FieldLabel text="Select" />
        <Label text="Role" />
        <div style={{ position: "relative" }}>
          <select
            value={selectVal}
            onChange={(e) => setSelectVal(e.target.value)}
            onFocus={() => setSelectFocused(true)}
            onBlur={() => setSelectFocused(false)}
            style={{ ...fieldStyle(selectFocused), appearance: "none", paddingRight: 36 }}
          >
            <option>Designer</option>
            <option>Developer</option>
            <option>Product Manager</option>
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: g["400"], display: "flex" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Dropdown (custom) */}
      <div>
        <FieldLabel text="Dropdown" />
        <Label text="Plan" />
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen((o) => !o)}
            style={{
              ...fieldStyle(dropOpen),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <span style={{ color: dropVal.includes("Select") ? g["400"] : g["900"] }}>{dropVal}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
              <path d="M3 5l4 4 4-4" stroke={g["400"]} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {dropOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: "#fff", border: `1.5px solid ${p["300"]}`, borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              {["Free", "Pro", "Enterprise"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setDropVal(opt); setDropOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "9px 12px", fontSize: "0.875rem",
                    color: dropVal === opt ? p["700"] : g["700"],
                    background: dropVal === opt ? p["50"] : "transparent",
                    fontWeight: dropVal === opt ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search with icon */}
      <div>
        <FieldLabel text="Search" />
        <Label text="Search" />
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: searchFocused ? p["500"] : g["400"], display: "flex", pointerEvents: "none", transition: "color 0.15s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search components…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ ...fieldStyle(searchFocused), paddingLeft: 36 }}
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: g["400"], display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div>
        <FieldLabel text="Checkbox" />
        <div className="flex flex-col gap-3">
          {(["Unchecked", "Checked", "Indeterminate", "Disabled"] as const).map((lbl) => {
            const isCh  = lbl === "Checked";
            const isInd = lbl === "Indeterminate";
            const isDis = lbl === "Disabled";
            return (
              <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, cursor: isDis ? "not-allowed" : "pointer", opacity: isDis ? 0.45 : 1 }}>
                <span style={{ width: 17, height: 17, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${isCh || isInd ? p["500"] : g["300"]}`, background: isCh || isInd ? p["500"] : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isCh  && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={getContrastColor(p["500"])} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2.5 2.5 3.5-4" /></svg>}
                  {isInd && <span style={{ width: 8, height: 2, background: getContrastColor(p["500"]), borderRadius: 1, display: "block" }} />}
                </span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{lbl}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Radio */}
      <div>
        <FieldLabel text="Radio" />
        <div className="flex flex-col gap-3">
          {(["Option A", "Option B", "Option C"] as const).map((opt, i) => {
            const val = ["a", "b", "c"][i];
            const sel = radio === val;
            return (
              <label key={opt} onClick={() => setRadio(val)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span style={{ width: 17, height: 17, borderRadius: 9999, border: `1.5px solid ${sel ? p["500"] : g["300"]}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {sel && <span style={{ width: 9, height: 9, borderRadius: 9999, background: p["500"], display: "block" }} />}
                </span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{opt}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Toggle */}
      <div>
        <FieldLabel text="Toggle" />
        <div className="flex flex-col gap-3">
          {[false, true].map((on) => (
            <label key={String(on)} onClick={() => setToggled(on)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span style={{ width: 42, height: 24, borderRadius: 9999, background: on ? p["500"] : g["300"], display: "flex", alignItems: "center", padding: "0 3px", position: "relative", transition: "background 0.2s" }}>
                <span style={{ width: 18, height: 18, borderRadius: 9999, background: "#fff", position: "absolute", left: on ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{on ? "On" : "Off"}</span>
            </label>
          ))}
          {/* Disabled */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", opacity: 0.45 }}>
            <span style={{ width: 42, height: 24, borderRadius: 9999, background: g["200"], display: "flex", alignItems: "center", padding: "0 3px", position: "relative" }}>
              <span style={{ width: 18, height: 18, borderRadius: 9999, background: "#fff", position: "absolute", left: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }} />
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["400"] }}>Disabled</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────────────
function Cards({ ds }: { ds: DesignSystem }) {
  const { scales, neutral } = ds;
  const p = scales.primary;
  const g = neutral;
  const pText = getContrastColor(p["500"]);

  return (
    <div className="flex flex-wrap gap-6">
      <div style={{ background: "#fff", border: `1px solid ${g["200"]}`, borderRadius: 12, overflow: "hidden", width: 300, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)" }}>
        <div style={{ background: p["100"], height: 110, position: "relative" }}>
          <div style={{ position: "absolute", bottom: 10, left: 14, background: p["500"], color: pText, fontSize: "0.68rem", fontWeight: 600, padding: "3px 10px", borderRadius: 9999, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>New</div>
        </div>
        <div style={{ padding: "18px 18px 22px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: g["900"], marginBottom: 6, lineHeight: 1.2 }}>Design System Card</h3>
          <p style={{ fontSize: "0.875rem", color: g["500"], lineHeight: 1.6, marginBottom: 14 }}>Supporting text with comfortable reading rhythm.</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {["Design", "UI", "Tokens"].map((tag) => (
              <span key={tag} style={{ background: p["50"], color: p["700"], fontSize: "0.68rem", fontWeight: 600, padding: "3px 10px", borderRadius: 9999, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>{tag}</span>
            ))}
          </div>
          <button style={{ background: p["500"], color: pText, border: "none", borderRadius: 6, padding: "9px 18px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", width: "100%" }}>View Details</button>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${g["200"]}`, borderRadius: 12, overflow: "hidden", width: 340, display: "flex", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ background: p["500"], width: 6, flexShrink: 0 }} />
        <div style={{ padding: "18px 18px 18px 14px" }}>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem", color: p["700"], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Featured</p>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: g["900"], marginBottom: 5 }}>Horizontal Accent Card</h3>
          <p style={{ fontSize: "0.8125rem", color: g["500"], lineHeight: 1.6 }}>Side-accented variant great for lists and feeds.</p>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${g["100"]}`, borderRadius: 12, padding: "22px 22px 18px", width: 260, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: p["50"], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={p["500"]}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: g["900"], marginBottom: 6 }}>Elevated Card</h3>
        <p style={{ fontSize: "0.8125rem", color: g["500"], lineHeight: 1.6, marginBottom: 16 }}>Use for featured content, dashboard widgets.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: g["400"] }}>12 Jun 2024</span>
          <button style={{ background: "none", border: `1.5px solid ${p["200"]}`, borderRadius: 6, padding: "5px 12px", color: p["700"], fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>Open</button>
        </div>
      </div>
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────
function Badges({ ds }: { ds: DesignSystem }) {
  const { scales, semantic, neutral } = ds;
  const p = scales.primary;
  const g = neutral;
  const ok = semantic.success;
  const warn = semantic.warning;
  const err = semantic.error;
  const info = semantic.info;

  const filled = [
    { label: "Default",  bg: g["100"],    color: g["700"]    },
    { label: "Primary",  bg: p["50"],     color: p["700"]    },
    { label: "Success",  bg: ok["50"],    color: ok["700"]   },
    { label: "Warning",  bg: warn["50"],  color: warn["700"] },
    { label: "Error",    bg: err["50"],   color: err["700"]  },
    { label: "Info",     bg: info["50"],  color: info["700"] },
  ];

  const outlined = [
    { label: "Primary",  color: p["700"],    border: p["300"]    },
    { label: "Success",  color: ok["700"],   border: ok["300"]   },
    { label: "Warning",  color: warn["700"], border: warn["300"] },
    { label: "Error",    color: err["700"],  border: err["300"]  },
  ];

  const dot = [
    { label: "Active",   dot: ok["500"]   },
    { label: "Pending",  dot: warn["500"] },
    { label: "Offline",  dot: g["400"]    },
    { label: "Error",    dot: err["500"]  },
  ];

  const badgeBase: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 600, padding: "4px 10px", borderRadius: 9999, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase" };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Filled</p>
        <div className="flex flex-wrap gap-2">
          {filled.map(({ label, bg, color }) => (
            <span key={label} style={{ ...badgeBase, background: bg, color }}>{label}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Outlined</p>
        <div className="flex flex-wrap gap-2">
          {outlined.map(({ label, color, border }) => (
            <span key={label} style={{ ...badgeBase, background: "transparent", color, border: `1.5px solid ${border}`, padding: "3px 10px" }}>{label}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Status Dot</p>
        <div className="flex flex-wrap gap-3">
          {dot.map(({ label, dot: dotColor }) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", color: g["700"] }}>
              <span style={{ width: 7, height: 7, borderRadius: 9999, background: dotColor, display: "block", flexShrink: 0 }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Alerts ─────────────────────────────────────────────────────────────────
function Alerts({ ds }: { ds: DesignSystem }) {
  const { semantic } = ds;
  const alerts = [
    { title: "Success",  body: "Your design tokens have been exported successfully.",                       bg: semantic.success["50"],  border: semantic.success["200"],  accent: semantic.success["500"],  text: semantic.success["700"]  },
    { title: "Warning",  body: "Some contrast ratios may not meet AA standards. Verify before shipping.",  bg: semantic.warning["50"],  border: semantic.warning["200"],  accent: semantic.warning["500"],  text: semantic.warning["700"]  },
    { title: "Error",    body: "Failed to extract palette. Please try a higher-resolution image.",          bg: semantic.error["50"],    border: semantic.error["200"],    accent: semantic.error["500"],    text: semantic.error["700"]    },
    { title: "Info",     body: "Your palette has been generated using split-complementary color theory.",   bg: semantic.info["50"],     border: semantic.info["200"],     accent: semantic.info["500"],     text: semantic.info["700"]     },
  ];

  return (
    <div className="space-y-3 max-w-2xl">
      {alerts.map(({ title, body, bg, border, accent, text }) => (
        <div key={title} style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${accent}`, borderRadius: 8, padding: "13px 15px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: text, marginBottom: 3 }}>{title}</p>
          <p style={{ fontSize: "0.8125rem", color: text, lineHeight: 1.6, opacity: 0.85 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e8e8e4]">
      <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">{label}</p>
      </div>
      <div className="px-8 md:px-12 py-8">
        {children}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function UIComponentsPreview({ ds }: Props) {
  return (
    <div className="border-b-2 border-[#0a0a0a]">
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
          07
        </span>
        <div className="relative">
          <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Starter Kit</p>
          <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
            UI<br />Components
          </h2>
          <p className="font-mono text-[12px] text-[#888] mt-6">
            Buttons · Form Inputs · Cards · Badges · Alerts — all states, all sizes, live with your palette
          </p>
        </div>
      </div>

      <div>
        {/* Interactive button builder */}
        <SubSection label="Button Builder — Variant · Size · Icons · Material 3">
          <InteractiveButtonBuilder ds={ds} />
        </SubSection>

        {/* Full state matrix */}
        <SubSection label="Buttons — All Variants · All States (Default · Hover · Focused · Active · Disabled)">
          <ButtonsTable ds={ds} />
        </SubSection>

        <SubSection label="Form Inputs — Email · Textarea · Select · Dropdown · Search · Checkbox · Radio · Toggle">
          <FormInputs ds={ds} />
        </SubSection>

        <SubSection label="Cards — Default · Horizontal · Elevated">
          <Cards ds={ds} />
        </SubSection>

        <SubSection label="Badges — Filled · Outlined · Status">
          <Badges ds={ds} />
        </SubSection>

        <div>
          <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.35em] text-[#aaa]">Alerts — Success · Warning · Error · Info</p>
          </div>
          <div className="px-8 md:px-12 py-8">
            <Alerts ds={ds} />
          </div>
        </div>
      </div>
    </div>
  );
}
