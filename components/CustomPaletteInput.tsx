"use client";

import { useState } from "react";

interface Roles {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

interface Props {
  onGenerate: (roles: Roles) => void;
}

function isValidHex(val: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim());
}

function normalizeHex(val: string): string {
  const clean = val.trim().startsWith("#") ? val.trim() : `#${val.trim()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean.toLowerCase();
}

const FALLBACKS: Record<keyof Roles, string> = {
  primary:   "#6366f1",
  secondary: "#8b5cf6",
  tertiary:  "#a855f7",
  accent:    "#ec4899",
};

export default function CustomPaletteInput({ onGenerate }: Props) {
  const [fields, setFields] = useState<Record<keyof Roles, string>>({
    primary: "",
    secondary: "",
    tertiary: "",
    accent: "",
  });
  const [errors, setErrors] = useState<Record<keyof Roles, string>>({
    primary: "", secondary: "", tertiary: "", accent: "",
  });

  const update = (key: keyof Roles, val: string) => {
    setFields((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<keyof Roles, string> = { primary: "", secondary: "", tertiary: "", accent: "" };
    let valid = true;

    if (!fields.primary) {
      newErrors.primary = "Primary color is required";
      valid = false;
    } else if (!isValidHex(fields.primary)) {
      newErrors.primary = "Invalid hex (e.g. #3b82f6)";
      valid = false;
    }

    for (const key of ["secondary", "tertiary", "accent"] as (keyof Roles)[]) {
      if (fields[key] && !isValidHex(fields[key])) {
        newErrors[key] = "Invalid hex (e.g. #3b82f6)";
        valid = false;
      }
    }

    if (!valid) { setErrors(newErrors); return; }

    const primary = normalizeHex(fields.primary);
    onGenerate({
      primary,
      secondary: fields.secondary ? normalizeHex(fields.secondary) : FALLBACKS.secondary,
      tertiary:  fields.tertiary  ? normalizeHex(fields.tertiary)  : FALLBACKS.tertiary,
      accent:    fields.accent    ? normalizeHex(fields.accent)    : FALLBACKS.accent,
    });
  };

  const FIELD_CONFIG: { key: keyof Roles; label: string; required: boolean; placeholder: string }[] = [
    { key: "primary",   label: "Primary",   required: true,  placeholder: "#3b82f6" },
    { key: "secondary", label: "Secondary", required: false, placeholder: "#8b5cf6" },
    { key: "tertiary",  label: "Tertiary",  required: false, placeholder: "#a855f7" },
    { key: "accent",    label: "Accent",    required: false, placeholder: "#ec4899" },
  ];

  return (
    <form onSubmit={handleSubmit} className="px-8 py-10">
      <div className="max-w-2xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#888] mb-6">
          Enter your brand colors
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {FIELD_CONFIG.map(({ key, label, required, placeholder }) => {
            const val = fields[key];
            const err = errors[key];
            const validColor = val && isValidHex(val) ? normalizeHex(val) : null;

            return (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="font-mono text-[12px] uppercase tracking-widest text-[#555] flex items-center gap-1.5">
                  {label}
                  {required && <span className="text-[#dc2626]">*</span>}
                  {!required && <span className="text-[#bbb]">(optional)</span>}
                </label>

                <div className="relative flex items-center gap-0 border-2 border-[#0a0a0a] focus-within:border-[#0a0a0a] bg-white">
                  {/* Color preview swatch */}
                  <div
                    className="w-9 h-9 shrink-0 border-r border-[#0a0a0a]"
                    style={{ backgroundColor: validColor ?? "#f0f0ec" }}
                  />
                  {/* Native color picker hidden behind swatch */}
                  <input
                    type="color"
                    value={validColor ?? "#6366f1"}
                    onChange={(e) => update(key, e.target.value)}
                    className="absolute left-0 w-9 h-9 opacity-0 cursor-pointer"
                  />
                  {/* Text input */}
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 font-mono text-[12px] text-[#0a0a0a] bg-transparent outline-none placeholder-[#ccc]"
                  />
                </div>

                {err && (
                  <span className="font-mono text-[12px] text-[#dc2626]">{err}</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="font-mono text-[12px] uppercase tracking-widest bg-[#0a0a0a] text-white px-8 py-3 hover:bg-[#333] transition-colors"
        >
          Generate Design System →
        </button>

        <p className="font-mono text-[12px] text-[#bbb] mt-3">
          Optional fields will be auto-generated from your primary color if left blank.
        </p>
      </div>
    </form>
  );
}
