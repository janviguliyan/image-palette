"use client";

import { useState, useMemo } from "react";
import SplitHomepage from "@/components/SplitHomepage";
import type { ManualRoles } from "@/components/SplitHomepage";
import PaletteResults from "@/components/PaletteResults";
import UsageSection from "@/components/UsageSection";
import ExportTriggers from "@/components/ExportTriggers";
import type { ExportType } from "@/components/ExportTriggers";
import DesignSystemPalette from "@/components/DesignSystemPalette";
import NeutralColors from "@/components/NeutralColors";
import SemanticColors from "@/components/SemanticColors";
import AccessibilityCheck from "@/components/AccessibilityCheck";
import TemplateSelector from "@/components/TemplateSelector";
import TypographySystem from "@/components/TypographySystem";
import FoundationTokens from "@/components/FoundationTokens";
import UIComponentsPreview from "@/components/UIComponentsPreview";
import {
  mapColorsToRoles,
  buildDesignSystem,
  getPaletteTemperature,
  type HarmonyMode,
} from "@/lib/colorUtils";
import type { PaletteTheme } from "@/components/PaletteResults";
import type { OverrideMap } from "@/lib/designTokens";

export default function Home() {
  const [colors, setColors]               = useState<string[]>([]);
  const [imageUrl, setImageUrl]           = useState<string | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [manualRoles, setManualRoles]     = useState<ManualRoles | null>(null);
  const [explicitRoleKeys, setExplicitRoleKeys] = useState<(keyof ManualRoles)[]>([]);
  const [inputSource, setInputSource]     = useState<"image" | "manual">("image");
  const [paletteTheme, setPaletteTheme]   = useState<PaletteTheme>("light");
  const [exportTab, setExportTab] = useState<ExportType | null>(null);
  const [harmonyMode, setHarmonyMode]     = useState<HarmonyMode>("split-complementary");
  const [primaryFont, setPrimaryFont]     = useState("Inter");
  const [secondaryFont, setSecondaryFont] = useState("Roboto");
  const [typographyOverrides, setTypographyOverrides] = useState<OverrideMap>({});

  // ── Derived ─────────────────────────────────────────────────────
  const roles = useMemo(() => {
    if (manualRoles) return manualRoles;
    if (colors.length > 0) return mapColorsToRoles(colors);
    return null;
  }, [manualRoles, colors]);

  const designSystem = useMemo(() => {
    if (!roles) return null;
    return buildDesignSystem(roles);
  }, [roles]);

  const hasResult = (imageUrl !== null && colors.length > 0) || manualRoles !== null;

  const templateColors = useMemo(() => {
    const base = manualRoles
      ? [manualRoles.primary, manualRoles.secondary, manualRoles.tertiary, manualRoles.accent]
      : colors;
    const padded = [...base];
    while (padded.length < 6) padded.push(padded[padded.length - 1] ?? "#888888");
    return padded;
  }, [manualRoles, colors]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleImageUpload = async (file: File, previewUrl: string) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(previewUrl);
    setColors([]);
    setManualRoles(null);
    setInputSource("image");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/extract-colors", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract colors");
      }
      const data = await res.json();
      setColors(data.colors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualGenerate = (roles: ManualRoles, explicitKeys: (keyof ManualRoles)[], mode: HarmonyMode) => {
    setManualRoles(roles);
    setExplicitRoleKeys(explicitKeys);
    setHarmonyMode(mode);
    setColors([]);
    setImageUrl(null);
    setError(null);
    setInputSource("manual");
  };

  // Called when user edits palette colors in PaletteResults (promotes image colors to manual)
  const handleRolesChange = (newRoles: ManualRoles) => {
    setManualRoles(newRoles);
    if (inputSource !== "manual") setInputSource("manual");
  };

  const handleReset = () => {
    setColors([]);
    setImageUrl(null);
    setError(null);
    setManualRoles(null);
    setPaletteTheme("light");
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HOMEPAGE ── */}
      {!hasResult && (
        <SplitHomepage
          onImageUpload={handleImageUpload}
          onManualGenerate={handleManualGenerate}
          isLoading={isLoading}
          error={error}
          onErrorDismiss={() => setError(null)}
        />
      )}

      {/* ── RESULTS ── */}
      {hasResult && designSystem && (
        <div className="animate-up">

          {/* ── Sticky header (Figma-styled) ── */}
          <header className="sticky top-0 z-40 bg-white border-b-2 border-black">
            <div className="flex items-center justify-between px-8 md:px-12 xl:px-20 py-5">

              {/* Logo + App name */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-[28px] h-[26px] bg-black shrink-0" />
                <span className="font-mono text-[14px] text-black whitespace-nowrap hidden sm:block">
                  DESIGN SYSTEM GENERATOR
                </span>
              </div>

              {/* Center subtitle */}
              <span className="font-mono font-medium text-[16px] md:text-[20px] text-black whitespace-nowrap hidden md:block">
                {inputSource === "image" ? "FROM IMAGE" : "FROM BRAND COLORS"}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-4 md:gap-6 shrink-0">
                <button
                  onClick={() => setExportTab("css")}
                  className="font-mono text-[13px] px-5 py-2.5 flex items-center gap-2 transition-opacity hover:opacity-85"
                  style={{
                    // backgroundColor: designSystem.roles.primary,
                    backgroundColor: "black",
                    color: "#f6f6f8",
                    // border: `1px solid ${designSystem.roles.primary}`,
                  }}
                >
                  {/* <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v7M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    <path d="M1.5 10h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                  </svg> */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 13.3333C3.63333 13.3333 3.31955 13.2029 3.05866 12.942C2.79733 12.6807 2.66666 12.3667 2.66666 12V10H4V12H12V10H13.3333V12C13.3333 12.3667 13.2029 12.6807 12.942 12.942C12.6807 13.2029 12.3667 13.3333 12 13.3333H4ZM7.33333 10.6667V5.23334L5.6 6.96667L4.66666 6.00001L8 2.66667L11.3333 6.00001L10.4 6.96667L8.66666 5.23334V10.6667H7.33333Z" fill="white"/>
                  </svg>
                  Export Design System
                </button>
                {/* <span className="font-mono text-[16px] text-[#FFFFFF] bg-[#0a0a0a] px-3 py-2 uppercase tracking-[0.2em] hover:bg-[#2A2A2A] active:bg-[#333] transition-colors"> */}
                <span className="font-mono text-[13px] border border-black px-5 py-2.5 flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
                  <a href="https://www.linkedin.com/in/janvi-guliyan-5bb10023a/" target="_blank" rel="noopener noreferrer">CONTACT US</a>
                </span>
                <button
                  onClick={handleReset}
                  className="font-mono text-[13px] border border-black px-5 py-2.5 flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
                >
                  ↩ Start Over
                </button>
              </div>
            </div>
          </header>

          {/* ① Color Palette — Section 01 */}
          <PaletteResults
            ds={designSystem}
            imageUrl={imageUrl}
            inputSource={inputSource}
            theme={paletteTheme}
            onThemeChange={setPaletteTheme}
            explicitRoleKeys={inputSource === "manual" ? explicitRoleKeys : undefined}
            onRolesChange={handleRolesChange}
            initialHarmonyMode={harmonyMode}
          />

          {/* ② Usage — Section 02 */}
          <UsageSection
            ds={designSystem}
            theme={paletteTheme}
            onThemeChange={setPaletteTheme}
          />

          {/* Export triggers — also controlled by header button via externalTab */}
          <ExportTriggers
            ds={designSystem}
            primaryFont={primaryFont}
            secondaryFont={secondaryFont}
            typographyOverrides={typographyOverrides}
            externalTab={exportTab}
            onExternalClose={() => setExportTab(null)}
          />

          {/* ③ Color Scales — Section 03 */}
          <div className="border-t-2 border-black">
            {/* Section header */}
            <div className="flex flex-col gap-10 p-8 md:p-12 xl:p-20 border-b border-black/10">
              <div className="flex items-start justify-between whitespace-nowrap">
                <div
                  className="font-black text-black"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85 }}
                >
                  <p className="mb-0">Color</p>
                  <p>Scales</p>
                </div>
                <p
                  className="font-black"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.85, color: "rgba(0,0,0,0.06)" }}
                >
                  03
                </p>
              </div>
              <p className="font-mono text-[16px] text-[#1a1c1e] max-w-2xl">
                This section has the full color scales from 50 to 900 scales. Includes main palette,
                neutral greys and semantic colors. Hover to copy a particular color.
              </p>
            </div>

            {/* Scales */}
            <DesignSystemPalette scales={designSystem.scales} roles={designSystem.roles} />

            {/* Neutral */}
            <NeutralColors
              neutral={designSystem.neutral}
              temperature={getPaletteTemperature(designSystem.roles.primary)}
            />

            {/* Semantic */}
            <SemanticColors semantic={designSystem.semantic} />
          </div>

          {/* ④ Accessibility — Section 04 */}
          <AccessibilityCheck ds={designSystem} />

          {/* ⑤ Typography System — Section 05 */}
          <TypographySystem
            primaryFont={primaryFont}
            secondaryFont={secondaryFont}
            onPrimaryFontChange={setPrimaryFont}
            onSecondaryFontChange={setSecondaryFont}
            onOverridesChange={setTypographyOverrides}
          />

          {/* ⑥ Foundation Tokens — Section 06 (keep as-is) */}
          <FoundationTokens ds={designSystem} />

          {/* ⑦ UI Components — Section 07 (keep as-is) */}
          <UIComponentsPreview ds={designSystem} />

          {/* ⑧ Templates — Section 08 (keep as-is) */}
          <div className="border-b-2 border-[#0a0a0a]">
            <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
              <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
                08
              </span>
              <div className="relative">
                <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Preview</p>
                <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
                  UI<br />Templates
                </h2>
                <p className="font-mono text-[12px] text-[#888] mt-6">
                  See your palette applied to real UI layouts
                </p>
              </div>
            </div>
            <TemplateSelector colors={templateColors} />
          </div>

          {/* Footer */}
          <footer className="px-8 md:px-12 py-8 flex items-center justify-between border-t border-[#e8e8e4]">
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb]">
              Design System Generator
            </p>
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb]">
              Janvi Guliyan · {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
