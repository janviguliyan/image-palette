"use client";

import { useState, useMemo } from "react";
import SplitHomepage from "@/components/SplitHomepage";
import type { ManualRoles } from "@/components/SplitHomepage";
import PaletteResults from "@/components/PaletteResults";
import ExportTriggers from "@/components/ExportTriggers";
import DesignSystemPalette from "@/components/DesignSystemPalette";
import NeutralColors from "@/components/NeutralColors";
import SemanticColors from "@/components/SemanticColors";
import AccessibilityCheck from "@/components/AccessibilityCheck";
import TemplateSelector from "@/components/TemplateSelector";
import TypographySystem from "@/components/TypographySystem";
import FoundationTokens from "@/components/FoundationTokens";
import UIComponentsPreview from "@/components/UIComponentsPreview";
import FigmaExportModal from "@/components/FigmaExportModal";
import {
  mapColorsToRoles,
  buildDesignSystem,
  getPaletteTemperature,
} from "@/lib/colorUtils";
import type { PaletteTheme } from "@/components/PaletteResults";

export default function Home() {
  const [colors, setColors]               = useState<string[]>([]);
  const [imageUrl, setImageUrl]           = useState<string | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [manualRoles, setManualRoles]     = useState<ManualRoles | null>(null);
  const [explicitRoleKeys, setExplicitRoleKeys] = useState<(keyof ManualRoles)[]>([]);
  const [inputSource, setInputSource]     = useState<"image" | "manual">("image");
  const [paletteTheme, setPaletteTheme]   = useState<PaletteTheme>("light");
  const [figmaModalOpen, setFigmaModalOpen] = useState(false);

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

  // For template selector — works for both image & manual
  // Pad to at least 6 so templates can safely destructure c0–c5 without undefined
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

  const handleManualGenerate = (roles: ManualRoles, explicitKeys: (keyof ManualRoles)[]) => {
    setManualRoles(roles);
    setExplicitRoleKeys(explicitKeys);
    setColors([]);
    setImageUrl(null);
    setError(null);
    setInputSource("manual");
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
    <div className="min-h-screen bg-[#f9f9f7]" style={{ fontFamily: "'Inter', sans-serif" }}>

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

          {/* Sticky header */}
          <header className="sticky top-0 z-40 border-b-2 border-[#0a0a0a] bg-[#f9f9f7]">
            <div className="flex items-center justify-between px-8 md:px-12 h-16">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 bg-[#0a0a0a]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]">
                  Design System Generator
                </span>
              </div>
              <div className="flex items-center gap-3 md:gap-6">
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#bbb] hidden sm:block">
                  {inputSource === "image" ? "— From Image" : "— From Brand Colors"}
                </span>
                <button
                  onClick={() => setFigmaModalOpen(true)}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] px-4 py-2 transition-colors hidden md:block"
                  style={{ background: designSystem.roles.primary, color: "#fff", border: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Open in Figma
                </button>
                <button
                  onClick={handleReset}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] border border-[#0a0a0a] px-4 py-2 hover:bg-[#0a0a0a] hover:text-white transition-colors"
                >
                  ↩ Start Over
                </button>
              </div>
            </div>
          </header>

          {/* ① Palette section */}
          <PaletteResults
            ds={designSystem}
            imageUrl={imageUrl}
            inputSource={inputSource}
            theme={paletteTheme}
            onThemeChange={setPaletteTheme}
            explicitRoleKeys={inputSource === "manual" ? explicitRoleKeys : undefined}
          />

          {/* ② Export triggers */}
          <ExportTriggers ds={designSystem} />

          {/* ③ Design System — section wrapper */}
          <div className="border-b-2 border-[#0a0a0a]">
            {/* Section header */}
            <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
              <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
                03
              </span>
              <div className="relative">
                <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Design Tokens</p>
                <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
                  Design<br />System
                </h2>
                <p className="font-mono text-[9px] text-[#888] mt-6">
                  50–900 scales · Neutral greys · Semantic colors
                </p>
              </div>
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

          {/* ④ Accessibility */}
          <AccessibilityCheck ds={designSystem} />

          {/* ⑤ Typography System */}
          <TypographySystem />

          {/* ⑥ Foundation Tokens */}
          <FoundationTokens ds={designSystem} />

          {/* ⑦ UI Components */}
          <UIComponentsPreview ds={designSystem} />

          {/* ⑧ Templates */}
          <div className="border-b-2 border-[#0a0a0a]">
            <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-14 md:py-20 relative overflow-hidden">
              <span className="absolute right-8 md:right-12 top-0 bottom-0 flex items-center font-black text-[clamp(7rem,18vw,14rem)] leading-none tracking-tighter text-[#0a0a0a] opacity-[0.05] select-none pointer-events-none">
                08
              </span>
              <div className="relative">
                <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-5">Preview</p>
                <h2 className="font-black text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-tighter text-[#0a0a0a]">
                  UI<br />Templates
                </h2>
                <p className="font-mono text-[9px] text-[#888] mt-6">
                  See your palette applied to real UI layouts
                </p>
              </div>
            </div>
            <TemplateSelector colors={templateColors} />
          </div>

          {/* Figma export modal */}
          {figmaModalOpen && (
            <FigmaExportModal ds={designSystem} onClose={() => setFigmaModalOpen(false)} />
          )}

          {/* Footer */}
          <footer className="px-8 md:px-12 py-8 flex items-center justify-between border-t border-[#e8e8e4]">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#bbb]">
              Design System Generator
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#bbb]">
              Janvi Guliyan · {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
