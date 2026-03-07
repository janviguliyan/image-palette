"use client";

import { useState } from "react";
import { getContrastColor, type DesignSystem } from "@/lib/colorUtils";

interface Props {
  ds: DesignSystem;
}

// ── Shared icon SVGs ──────────────────────────────────────────────────────────
const ArrowRight = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7h10M8 3l4 4-4 4" />
  </svg>
);

const StarIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill={color} stroke="none">
    <path d="M7 1l1.5 4h4l-3.3 2.4 1.2 4L7 9 3.6 11.4l1.2-4L1.5 5H5.5z" />
  </svg>
);

const PlusIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M7 2v10M2 7h10" />
  </svg>
);

const TrashIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h10M5 4V3h4v1M5 6v5M9 6v5M3 4l.7 7h6.6L11 4" />
  </svg>
);

// ── Button state cell ─────────────────────────────────────────────────────────
interface BtnStyle {
  bg: string;
  color: string;
  border?: string;
  opacity?: number;
  cursor?: string;
}

function ButtonCell({
  label,
  size,
  variant,
  state,
  ds,
}: {
  label?: string;
  size: "lg" | "sm";
  variant: "primary" | "secondary" | "ghost" | "danger";
  state: "default" | "hover" | "focused" | "active" | "disabled";
  ds: DesignSystem;
}) {
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

  const stateStyle: Record<string, Partial<BtnStyle>> = {
    primary: {
      hover:    { bg: p["600"] },
      focused:  { bg: p["500"] },
      active:   { bg: p["700"] },
      disabled: { bg: p["200"], color: p["500"], opacity: 0.7, cursor: "not-allowed" },
    }[state] ?? {},
    secondary: {
      hover:    { bg: p["50"], border: p["300"], color: p["700"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"], border: p["600"], color: p["800"] },
      disabled: { opacity: 0.5, cursor: "not-allowed" },
    }[state] ?? {},
    ghost: {
      hover:    { bg: p["50"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"] },
      disabled: { opacity: 0.4, cursor: "not-allowed" },
    }[state] ?? {},
    danger: {
      hover:    { bg: e["600"] },
      focused:  { bg: e["500"] },
      active:   { bg: e["700"] },
      disabled: { bg: e["200"], color: e["500"], opacity: 0.6, cursor: "not-allowed" },
    }[state] ?? {},
  };

  const resolved: BtnStyle = { ...base[variant], ...stateStyle[variant] };
  const px = size === "lg" ? "18px" : "12px";
  const py = size === "lg" ? "10px" : "6px";
  const fontSize = size === "lg" ? "0.8125rem" : "0.72rem";

  const ring = state === "focused"
    ? `0 0 0 3px ${variant === "danger" ? e["100"] : p["100"]}`
    : undefined;

  const label_ = label ?? (size === "lg" ? "Button" : "Btn");

  return (
    <button
      disabled={state === "disabled"}
      style={{
        background: resolved.bg,
        color: resolved.color,
        border: resolved.border ? `1.5px solid ${resolved.border}` : "none",
        borderRadius: 6,
        padding: `${py} ${px}`,
        fontWeight: 600,
        fontSize,
        letterSpacing: "0.02em",
        cursor: resolved.cursor ?? "pointer",
        opacity: resolved.opacity,
        boxShadow: ring,
        transition: "none",
        display: "flex",
        alignItems: "center",
        gap: 5,
        whiteSpace: "nowrap",
      }}
    >
      {label_}
    </button>
  );
}

function ButtonCellWithIcon({
  size,
  variant,
  state,
  iconPosition,
  ds,
}: {
  size: "lg" | "sm";
  variant: "primary" | "secondary" | "ghost" | "danger";
  state: "default" | "hover" | "focused" | "active" | "disabled";
  iconPosition: "left" | "right" | "only";
  ds: DesignSystem;
}) {
  const { scales, semantic } = ds;
  const p = scales.primary;
  const e = semantic.error;
  const pText = getContrastColor(p["500"]);
  const eText = getContrastColor(e["500"]);

  const base: Record<string, BtnStyle> = {
    primary:   { bg: p["500"], color: pText },
    secondary: { bg: scales.secondary["50"],  color: scales.secondary["700"], border: scales.secondary["200"] },
    ghost:     { bg: "transparent", color: p["700"], border: p["200"] },
    danger:    { bg: e["500"], color: eText },
  };

  const stateStyle: Record<string, Partial<BtnStyle>> = {
    primary: {
      hover:    { bg: p["600"] },
      focused:  { bg: p["500"] },
      active:   { bg: p["700"] },
      disabled: { bg: p["200"], color: p["500"], opacity: 0.7, cursor: "not-allowed" },
    }[state] ?? {},
    secondary: {
      hover:    { bg: p["50"], border: p["300"], color: p["700"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"], border: p["600"], color: p["800"] },
      disabled: { opacity: 0.5, cursor: "not-allowed" },
    }[state] ?? {},
    ghost: {
      hover:    { bg: p["50"] },
      focused:  { bg: p["50"], border: p["500"] },
      active:   { bg: p["100"] },
      disabled: { opacity: 0.4, cursor: "not-allowed" },
    }[state] ?? {},
    danger: {
      hover:    { bg: e["600"] },
      focused:  { bg: e["500"] },
      active:   { bg: e["700"] },
      disabled: { bg: e["200"], color: e["500"], opacity: 0.6, cursor: "not-allowed" },
    }[state] ?? {},
  };

  const resolved: BtnStyle = { ...base[variant], ...stateStyle[variant] };
  const px = size === "lg" ? "14px" : "10px";
  const py = size === "lg" ? "10px" : "6px";
  const fontSize = size === "lg" ? "0.8125rem" : "0.72rem";
  const iconColor = resolved.color;
  const ring = state === "focused"
    ? `0 0 0 3px ${variant === "danger" ? e["100"] : p["100"]}`
    : undefined;

  return (
    <button
      disabled={state === "disabled"}
      style={{
        background: resolved.bg,
        color: resolved.color,
        border: resolved.border ? `1.5px solid ${resolved.border}` : "none",
        borderRadius: 6,
        padding: iconPosition === "only" ? `${py} ${py}` : `${py} ${px}`,
        fontWeight: 600,
        fontSize,
        letterSpacing: "0.02em",
        cursor: resolved.cursor ?? "pointer",
        opacity: resolved.opacity,
        boxShadow: ring,
        display: "flex",
        alignItems: "center",
        gap: iconPosition === "only" ? 0 : 5,
      }}
    >
      {iconPosition === "left"  && <ArrowRight color={iconColor} size={12} />}
      {iconPosition === "only"  && <ArrowRight color={iconColor} size={12} />}
      {iconPosition !== "only"  && (size === "lg" ? "Button" : "Btn")}
      {iconPosition === "right" && <ArrowRight color={iconColor} size={12} />}
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e8e8e4]">
      <div className="border-b border-[#e8e8e4] px-8 md:px-12 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#aaa]">{label}</p>
      </div>
      <div className="px-8 md:px-12 py-8">
        {children}
      </div>
    </div>
  );
}

// ── Buttons table ─────────────────────────────────────────────────────────────
const STATES = ["default", "hover", "focused", "active", "disabled"] as const;
type BtnState = typeof STATES[number];

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
      <table className="w-full border-collapse" style={{ minWidth: 760 }}>
        <thead>
          <tr className="border-b border-[#e8e8e4]">
            <th className="text-left pb-3 pr-6" style={{ width: 110 }}>
              <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">Variant</span>
            </th>
            {STATES.map((s) => (
              <th key={s} className="text-left pb-3 px-3">
                <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb]">{s}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, variant, size }, i) => (
            <tr key={label} className={`${i < ROWS.length - 1 ? "border-b border-[#f0f0ec]" : ""}`}>
              <td className="py-2.5 pr-6">
                <span className="font-mono text-[8px] text-[#888] uppercase tracking-widest">{label}</span>
              </td>
              {STATES.map((state) => (
                <td key={state} className="py-2.5 px-3">
                  <div className="flex flex-col gap-1.5">
                    <ButtonCell variant={variant} size={size} state={state} ds={ds} />
                    <ButtonCellWithIcon variant={variant} size={size} state={state} iconPosition="right" ds={ds} />
                    <ButtonCellWithIcon variant={variant} size={size} state={state} iconPosition="left" ds={ds} />
                    <ButtonCellWithIcon variant={variant} size={size} state={state} iconPosition="only" ds={ds} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-mono text-[7px] text-[#ccc] mt-4">
        Each cell shows: text only · icon right · icon left · icon only
      </p>
    </div>
  );
}

// ── Form inputs ───────────────────────────────────────────────────────────────
function FormInputs({ ds }: { ds: DesignSystem }) {
  const { scales, semantic, neutral } = ds;
  const p = scales.primary;
  const g = neutral;
  const err = semantic.error;

  const [textVal, setTextVal] = useState("");
  const [textFocused, setTextFocused] = useState(false);
  const [areaVal, setAreaVal] = useState("");
  const [areaFocused, setAreaFocused] = useState(false);
  const [selectFocused, setSelectFocused] = useState(false);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("a");
  const [toggled, setToggled] = useState(false);

  const inputBase = {
    display: "block",
    width: "100%",
    borderRadius: 6,
    fontSize: "0.875rem",
    color: g["900"],
    background: "#fff",
    transition: "border-color 0.15s, box-shadow 0.15s",
    outline: "none",
  };

  const stateInputStyle = (focused: boolean, error = false) => ({
    ...inputBase,
    padding: "9px 12px",
    border: `1.5px solid ${error ? err["500"] : focused ? p["500"] : g["200"]}`,
    boxShadow: focused ? `0 0 0 3px ${error ? err["100"] : p["100"]}` : "none",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8 max-w-4xl">
      {/* Text — empty */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Text · Empty</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["700"], marginBottom: 6 }}>Email Address</label>
        <input type="email" placeholder="hello@example.com" style={stateInputStyle(false)} readOnly />
      </div>

      {/* Text — filled */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Text · Filled</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["700"], marginBottom: 6 }}>Email Address</label>
        <input
          type="email"
          value={textVal || "user@example.com"}
          onChange={(e) => setTextVal(e.target.value)}
          onFocus={() => setTextFocused(true)}
          onBlur={() => setTextFocused(false)}
          style={stateInputStyle(textFocused)}
        />
      </div>

      {/* Text — error */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Text · Error</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["700"], marginBottom: 6 }}>Email Address</label>
        <input type="email" defaultValue="not-an-email" style={stateInputStyle(false, true)} readOnly />
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: err["600"], marginTop: 5 }}>Invalid email address</p>
      </div>

      {/* Text — disabled */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Text · Disabled</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["400"], marginBottom: 6 }}>Email Address</label>
        <input type="email" disabled placeholder="hello@example.com" style={{ ...stateInputStyle(false), background: g["50"], border: `1.5px solid ${g["100"]}`, color: g["400"], cursor: "not-allowed" }} />
      </div>

      {/* Textarea */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Textarea</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["700"], marginBottom: 6 }}>Message</label>
        <textarea
          placeholder="Write your message…"
          value={areaVal}
          onChange={(e) => setAreaVal(e.target.value)}
          onFocus={() => setAreaFocused(true)}
          onBlur={() => setAreaFocused(false)}
          rows={3}
          style={{
            ...inputBase,
            padding: "9px 12px",
            border: `1.5px solid ${areaFocused ? p["500"] : g["200"]}`,
            boxShadow: areaFocused ? `0 0 0 3px ${p["100"]}` : "none",
            resize: "vertical",
          }}
        />
      </div>

      {/* Select */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Select</p>
        <label style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: g["700"], marginBottom: 6 }}>Role</label>
        <select
          onFocus={() => setSelectFocused(true)}
          onBlur={() => setSelectFocused(false)}
          style={{
            ...inputBase,
            padding: "9px 12px",
            border: `1.5px solid ${selectFocused ? p["500"] : g["200"]}`,
            boxShadow: selectFocused ? `0 0 0 3px ${p["100"]}` : "none",
            appearance: "none",
          }}
        >
          <option>Designer</option>
          <option>Developer</option>
          <option>Product Manager</option>
        </select>
      </div>

      {/* Checkboxes */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Checkbox</p>
        <div className="flex flex-col gap-3">
          {(["Unchecked", "Checked", "Indeterminate", "Disabled"] as const).map((label) => {
            const isChecked = label === "Checked";
            const isIndet  = label === "Indeterminate";
            const isDis    = label === "Disabled";
            return (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: isDis ? "not-allowed" : "pointer", opacity: isDis ? 0.45 : 1 }}>
                <span
                  style={{
                    width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                    border: `1.5px solid ${isChecked || isIndet ? p["500"] : g["300"]}`,
                    background: isChecked || isIndet ? p["500"] : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {isChecked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={getContrastColor(p["500"])} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2.5 2.5 3.5-4" /></svg>}
                  {isIndet  && <span style={{ width: 8, height: 2, background: getContrastColor(p["500"]), borderRadius: 1, display: "block" }} />}
                </span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Radio */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Radio</p>
        <div className="flex flex-col gap-3">
          {(["Option A", "Option B", "Option C"] as const).map((opt, i) => {
            const val = ["a", "b", "c"][i];
            const sel = radio === val;
            return (
              <label key={opt} onClick={() => setRadio(val)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span style={{ width: 16, height: 16, borderRadius: 9999, border: `1.5px solid ${sel ? p["500"] : g["300"]}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {sel && <span style={{ width: 8, height: 8, borderRadius: 9999, background: p["500"], display: "block" }} />}
                </span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{opt}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Toggle */}
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Toggle</p>
        <div className="flex flex-col gap-3">
          {[false, true].map((on) => (
            <label key={String(on)} onClick={() => setToggled(on)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span style={{
                width: 40, height: 22, borderRadius: 9999, background: on ? p["500"] : g["300"],
                display: "flex", alignItems: "center",
                padding: "0 3px",
                transition: "background 0.15s",
                position: "relative",
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 9999, background: "#fff",
                  position: "absolute",
                  left: on ? 21 : 3,
                  transition: "left 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }} />
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["700"] }}>{on ? "On" : "Off"}</span>
            </label>
          ))}
          {/* Disabled */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", opacity: 0.45 }}>
            <span style={{ width: 40, height: 22, borderRadius: 9999, background: g["200"], display: "flex", alignItems: "center", padding: "0 3px", position: "relative" }}>
              <span style={{ width: 16, height: 16, borderRadius: 9999, background: "#fff", position: "absolute", left: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }} />
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: g["400"] }}>Disabled</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────
function Cards({ ds }: { ds: DesignSystem }) {
  const { scales, neutral } = ds;
  const p = scales.primary;
  const g = neutral;
  const pText = getContrastColor(p["500"]);

  return (
    <div className="flex flex-wrap gap-6">
      {/* Default card */}
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

      {/* Horizontal accent card */}
      <div style={{ background: "#fff", border: `1px solid ${g["200"]}`, borderRadius: 12, overflow: "hidden", width: 340, display: "flex", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ background: p["500"], width: 6, flexShrink: 0 }} />
        <div style={{ padding: "18px 18px 18px 14px" }}>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem", color: p["700"], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Featured</p>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: g["900"], marginBottom: 5 }}>Horizontal Accent Card</h3>
          <p style={{ fontSize: "0.8125rem", color: g["500"], lineHeight: 1.6 }}>Side-accented variant great for lists and feeds.</p>
        </div>
      </div>

      {/* Elevated / action card */}
      <div style={{ background: "#fff", border: `1px solid ${g["100"]}`, borderRadius: 12, padding: "22px 22px 18px", width: 260, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: p["50"], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <StarIcon color={p["500"]} size={16} />
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

// ── Badges ────────────────────────────────────────────────────────────────────
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

  const badgeBase = { fontSize: "0.68rem", fontWeight: 600, padding: "4px 10px", borderRadius: 9999, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase" as const };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Filled</p>
        <div className="flex flex-wrap gap-2">
          {filled.map(({ label, bg, color }) => (
            <span key={label} style={{ ...badgeBase, background: bg, color }}>{label}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Outlined</p>
        <div className="flex flex-wrap gap-2">
          {outlined.map(({ label, color, border }) => (
            <span key={label} style={{ ...badgeBase, background: "transparent", color, border: `1.5px solid ${border}`, padding: "3px 10px" }}>{label}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#bbb] mb-3">Status dot</p>
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

// ── Alerts ────────────────────────────────────────────────────────────────────
function Alerts({ ds }: { ds: DesignSystem }) {
  const { semantic } = ds;
  const ok = semantic.success;
  const warn = semantic.warning;
  const err = semantic.error;
  const info = semantic.info;

  const alerts = [
    { title: "Success",  body: "Your design tokens have been exported successfully.",                              bg: ok["50"],   border: ok["200"],   accent: ok["500"],   text: ok["700"]   },
    { title: "Warning",  body: "Some contrast ratios may not meet AA standards. Verify before shipping.",          bg: warn["50"], border: warn["200"], accent: warn["500"], text: warn["700"] },
    { title: "Error",    body: "Failed to extract palette. Please try a higher-resolution image.",                 bg: err["50"],  border: err["200"],  accent: err["500"],  text: err["700"]  },
    { title: "Info",     body: "Your palette has been generated using split-complementary color theory.",          bg: info["50"], border: info["200"], accent: info["500"], text: info["700"] },
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

// ── Main export ───────────────────────────────────────────────────────────────
export default function UIComponentsPreview({ ds }: Props) {
  return (
    <div className="border-b-2 border-[#0a0a0a]">
      {/* Section header */}
      <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
          07
        </span>
        <div className="relative">
          <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Starter Kit</p>
          <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
            UI<br />Components
          </h2>
          <p className="font-mono text-[9px] text-[#888] mt-6">
            Buttons · Form · Cards · Badges · Alerts — all states, all sizes, live with your palette
          </p>
        </div>
      </div>

      <div>
        <SubSection label="Buttons — Default · Hover · Focused · Active · Disabled">
          <ButtonsTable ds={ds} />
        </SubSection>

        <SubSection label="Form Inputs — Text · Textarea · Select · Checkbox · Radio · Toggle">
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
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#aaa]">Alerts — Success · Warning · Error · Info</p>
          </div>
          <div className="px-8 md:px-12 py-8">
            <Alerts ds={ds} />
          </div>
        </div>
      </div>
    </div>
  );
}
