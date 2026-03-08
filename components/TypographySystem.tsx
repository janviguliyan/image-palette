"use client";

import { useState, useRef, useEffect } from "react";
import { TYPOGRAPHY_SCALE, type TypographyToken, type OverrideMap, type EditableField } from "@/lib/designTokens";

const GOOGLE_FONTS = [
  // Sans-serif — Geometric / Humanist
  "Albert Sans", "Barlow", "Be Vietnam Pro", "Bricolage Grotesque", "Cabin",
  "Chivo", "DM Sans", "Exo 2", "Figtree", "Geologica", "Hanken Grotesk",
  "IBM Plex Sans", "Instrument Sans", "Inter", "Josefin Sans", "Jost",
  "Lato", "Lexend", "Manrope", "Montserrat", "Mulish", "Nunito",
  "Nunito Sans", "Onest", "Open Sans", "Outfit", "Plus Jakarta Sans",
  "Poppins", "Quicksand", "Raleway", "Readex Pro", "Red Hat Display",
  "Roboto", "Rubik", "Sora", "Source Sans 3", "Space Grotesk",
  "Titillium Web", "Urbanist", "Varela Round", "Work Sans",
  // Serif
  "Cormorant Garamond", "Crimson Text", "DM Serif Display", "EB Garamond",
  "Fraunces", "Instrument Serif", "Libre Baskerville", "Lora",
  "Merriweather", "Playfair Display", "PT Serif", "Spectral",
  // Display / Decorative
  "Caveat", "Dancing Script", "Great Vibes", "Lobster", "Pacifico",
  "Permanent Marker", "Righteous", "Secular One",
  // Monospace
  "Courier Prime", "Fira Code", "IBM Plex Mono", "Roboto Mono",
  "Source Code Pro", "Space Mono",
].sort();

type ScreenSize = "desktop" | "tablet" | "mobile";

const HEADING_TOKENS = new Set(["Display", "H1", "H2", "H3", "H4"]);

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular",
  500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black",
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

/** Extract the min value from a clamp() expression, or return the value as-is for tablet */
function getTabletSize(sizeDesktop: string): string {
  const match = sizeDesktop.match(/clamp\(\s*([^,]+),/);
  if (match) return match[1].trim();
  const rem = parseFloat(sizeDesktop);
  if (!isNaN(rem)) return `${(rem * 0.9).toFixed(3).replace(/\.?0+$/, "")}rem`;
  return sizeDesktop;
}

interface EditableCellProps {
  value: string;
  onCommit: (v: string) => void;
  mono?: boolean;
  selectOptions?: string[];
}

function EditableCell({ value, onCommit, mono = false, selectOptions }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const fontStyle: React.CSSProperties = {
    fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
    fontSize: "0.75rem",
    color: "#555",
    padding: 0,
  };

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
        style={fontStyle}
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
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={{ ...fontStyle, color: "#0a0a0a", border: "none", borderBottom: "1px solid #0a0a0a", outline: "none", background: "transparent", width: "100%" }}
      />
    );
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className="hover:border-b-[#bbb]"
      style={{
        ...fontStyle,
        cursor: "text",
        borderBottom: "1px dashed transparent",
        transition: "border-color 0.1s",
        display: "inline-block",
        minWidth: 32,
      }}
    >
      {value}
    </span>
  );
}

interface Props {
  primaryFont: string;
  secondaryFont: string;
  onPrimaryFontChange: (f: string) => void;
  onSecondaryFontChange: (f: string) => void;
  onOverridesChange?: (o: OverrideMap) => void;
}

export default function TypographySystem({
  primaryFont,
  secondaryFont,
  onPrimaryFontChange,
  onSecondaryFontChange,
  onOverridesChange,
}: Props) {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");

  // Track all font links — only clean up on unmount, never remove on font change
  // (removing the link causes the font to briefly revert to fallback)
  const fontLinksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    [primaryFont, secondaryFont]
      .filter((f, i, arr) => arr.indexOf(f) === i) // deduplicate
      .forEach((f) => {
        const href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap`;
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
          fontLinksRef.current.push(link);
        }
      });
  }, [primaryFont, secondaryFont]);

  // Clean up all font links only when the component unmounts
  useEffect(() => {
    const links = fontLinksRef.current;
    return () => { links.forEach((l) => { if (document.head.contains(l)) document.head.removeChild(l); }); };
  }, []);

  const getToken = (t: TypographyToken): TypographyToken => ({
    ...t,
    ...(overrides[t.token] ?? {}),
  });

  const update = (token: string, field: EditableField, value: string) => {
    const next: OverrideMap = {
      ...overrides,
      [token]: {
        ...overrides[token],
        [field]: field === "weight" ? parseInt(value) || overrides[token]?.weight : value,
      },
    };
    setOverrides(next);
    onOverridesChange?.(next);
  };

  const hasOverride = (token: string) =>
    !!overrides[token] && Object.keys(overrides[token]!).length > 0;

  const resetToken = (token: string) => {
    const next = { ...overrides };
    delete next[token];
    setOverrides(next);
    onOverridesChange?.(next);
  };

  const resetAll = () => {
    setOverrides({});
    onOverridesChange?.({});
  };

  const anyOverride = Object.keys(overrides).length > 0;

  /** Get the font family for a given token, based on screen size and font picker */
  const getFontFamily = (t: TypographyToken): string => {
    if (t.family === "mono") return "JetBrains Mono, monospace";
    if (HEADING_TOKENS.has(t.name)) return `'${primaryFont}', sans-serif`;
    return `'${secondaryFont}', sans-serif`;
  };

  /** Get the size to display in the table based on screen size tab */
  const getDisplaySize = (t: TypographyToken): string => {
    const ov = overrides[t.token] ?? {};
    const desktop = (ov.sizeDesktop as string) ?? t.sizeDesktop;
    if (screenSize === "mobile")  return t.sizeMobile;
    if (screenSize === "tablet")  return getTabletSize(desktop);
    return desktop;
  };

  return (
    <div className="border-t-2 border-black flex flex-col gap-10 overflow-clip p-8 md:p-12 xl:p-20">

      {/* Section heading */}
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between whitespace-nowrap">
          <div
            className="font-black text-black"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
          >
            <p className="mb-0">Typography</p>
            <p>System</p>
          </div>
          <p
            className="font-black"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85, color: "rgba(0,0,0,0.06)" }}
          >
            05
          </p>
        </div>
        <p className="font-mono text-[16px] text-[#1a1c1e] max-w-2xl">
          Choose your heading and body fonts. The table below updates live. Click any value to edit it manually.
        </p>
      </div>

      {/* Font Picker */}
      <div className="flex flex-col gap-4">
        <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Font Picker</p>
        <div className="flex gap-10 items-stretch flex-col lg:flex-row">

          {/* Font selectors */}
          <div className="flex-1 flex flex-col justify-between gap-6 min-w-0">

            {/* Primary Font (headings) */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[16px] text-[#1a1c1e]">
                Primary Font <span className="text-[#888] text-[12px]">(Display, H1–H4)</span>{" "}
                <span className="text-[#dc262f]">*</span>
              </p>
              <div className="border-2 border-black p-4">
                <div className="flex items-center justify-between">
                  <select
                    value={primaryFont}
                    onChange={(e) => onPrimaryFontChange(e.target.value)}
                    className="font-mono text-[16px] text-[#1a1c1e] bg-transparent border-none outline-none w-full cursor-pointer appearance-none"
                  >
                    {GOOGLE_FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <span className="font-mono text-[#1a1c1e] shrink-0 ml-2">▾</span>
                </div>
              </div>
            </div>

            {/* Secondary Font (body) */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[16px] text-[#1a1c1e]">
                Secondary Font <span className="text-[#888] text-[12px]">(Body, Caption, Button)</span>
              </p>
              <div className="border-2 border-black p-4">
                <div className="flex items-center justify-between">
                  <select
                    value={secondaryFont}
                    onChange={(e) => onSecondaryFontChange(e.target.value)}
                    className="font-mono text-[16px] text-[#1a1c1e] bg-transparent border-none outline-none w-full cursor-pointer appearance-none"
                  >
                    {GOOGLE_FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <span className="font-mono text-[#1a1c1e] shrink-0 ml-2">▾</span>
                </div>
              </div>
            </div>
          </div>

          {/* Font Preview */}
          <div
            className="flex-1 flex flex-col gap-4 p-6 overflow-hidden min-w-0 border-2 border-black"
            style={{ backgroundColor: "#f9f9f7", color: "#0a0a0a", minHeight: 180 }}
          >
            <p
              className="font-bold leading-tight"
              style={{ fontFamily: `'${primaryFont}', sans-serif`, fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              {primaryFont}
            </p>
            <p
              className="font-medium text-[16px] leading-relaxed"
              style={{ fontFamily: `'${secondaryFont}', sans-serif`, color: "#444" }}
            >
              {secondaryFont} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Viverra dolor vitae imperdiet.
            </p>
          </div>
        </div>
      </div>

      {/* Screen Sizes tabs */}
      <div className="flex flex-col gap-4">
        <p className="font-mono font-medium text-[24px] text-[#1a1c1e]">Screen Sizes</p>
        <div className="flex items-center">
          {([
            { key: "desktop", label: "DESKTOP [1200px +]"       },
            { key: "tablet",  label: "TAB [1199px – 800px]"     },
            { key: "mobile",  label: "MOBILE [799px – 320px]"   },
          ] as { key: ScreenSize; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setScreenSize(key)}
              className="flex-1 font-mono text-[13px] px-4 py-3 transition-colors"
              style={{
                backgroundColor: screenSize === key ? "#1a1c1e" : "transparent",
                color:           screenSize === key ? "#f6f6f8" : "#000",
                border:          "1px solid #000",
                borderRight:     key !== "mobile" ? "none" : "1px solid #000",
                fontWeight:      screenSize === key ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable table */}
      <div className="-mx-8 md:-mx-12 xl:-mx-20 border-t border-[#e8e8e4]">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 1100 }}>

            {/* Table header */}
            <div className="border-b border-[#e8e8e4] bg-[#f8f8f5]">
              <div className="px-8 md:px-12 py-2 flex items-center justify-between">
                <div
                  className="grid items-center w-full"
                  style={{ gridTemplateColumns: "240px 100px 64px 96px 110px 80px 72px 90px 1fr 32px", columnGap: 16 }}
                >
                  {["Preview","Scale","Family","Weight","Size","Case","Leading","Tracking","Usage",""].map((h, i) => (
                    <span key={i} className="font-mono text-[12px] uppercase tracking-widest text-[#bbb]">{h}</span>
                  ))}
                </div>
                {anyOverride && (
                  <button
                    onClick={resetAll}
                    className="font-mono text-[12px] uppercase tracking-widest text-[#e44] hover:text-[#c00] ml-4 shrink-0"
                  >
                    Reset all
                  </button>
                )}
              </div>
            </div>

            {/* Rows */}
            <div>
              {TYPOGRAPHY_SCALE.map((raw, i) => {
                const t      = getToken(raw);
                const family = getFontFamily(t);
                const displaySize = getDisplaySize(t);
                const sample = PREVIEW_SAMPLES[t.name] ?? t.usage;
                const isLast = i === TYPOGRAPHY_SCALE.length - 1;
                const modified = hasOverride(raw.token);

                return (
                  <div
                    key={raw.token}
                    className={`grid items-center px-8 md:px-12 py-3 group hover:bg-[#f8f8f5] transition-colors ${!isLast ? "border-b border-[#e8e8e4]" : ""}`}
                    style={{ gridTemplateColumns: "240px 100px 64px 96px 110px 80px 72px 90px 1fr 32px", columnGap: 16 }}
                  >
                    {/* Preview */}
                    <div className="pr-4 overflow-hidden" style={{ maxWidth: 240 }}>
                      <p
                        style={{
                          fontFamily: family,
                          fontSize: `clamp(0.75rem, 1.5vw, ${t.sizeDesktop})`,
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
                      <p className="font-mono text-[12px] text-[#888] uppercase tracking-[0.06em]">{t.name}</p>
                      <p className="font-mono text-[12px] text-[#ccc] mt-0.5 truncate">{raw.token}</p>
                    </div>

                    {/* Family tag */}
                    <div>
                      <span
                        className="font-mono text-[12px] uppercase tracking-widest px-1.5 py-0.5 border border-[#e8e8e4] text-[#888]"
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
                      <p className="font-mono text-[12px] text-[#ccc] mt-0.5">{WEIGHT_NAMES[t.weight] ?? ""}</p>
                    </div>

                    {/* Size (screen-size aware) */}
                    <div>
                      <EditableCell
                        value={screenSize === "desktop" ? t.sizeDesktop : displaySize}
                        onCommit={(v) => screenSize === "desktop" ? update(raw.token, "sizeDesktop", v) : undefined}
                        mono
                      />
                      {screenSize !== "desktop" && (
                        <p className="font-mono text-[12px] text-[#aaa] mt-0.5">{screenSize}</p>
                      )}
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
                      <p className="font-mono text-[12px] text-[#aaa] leading-relaxed">{t.usage}</p>
                    </div>

                    {/* Reset */}
                    <div className="flex justify-end">
                      {modified && (
                        <button
                          onClick={() => resetToken(raw.token)}
                          title="Reset to default"
                          className="font-mono text-[12px] text-[#e44] hover:text-[#c00] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="font-mono text-[12px] text-[#bbb] border-t border-[#e8e8e4] pt-4">
        Edits are local previews only — export CSS / Tailwind to lock in values &nbsp;·&nbsp; Click any value cell to edit
      </p>
    </div>
  );
}
