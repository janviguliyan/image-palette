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

          {/* Sticky minimal header */}
          <header className="sticky top-0 z-40 border-b-2 border-[#0a0a0a] bg-[#f9f9f7]">
            <div className="flex items-center justify-between px-8 md:px-12 h-12">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 bg-[#0a0a0a]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]">
                  Design System Generator
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#bbb] hidden sm:block">
                  {inputSource === "image" ? "From Image" : "From Brand Colors"}
                </span>
                <button
                  onClick={handleReset}
                  className="font-mono text-[9px] uppercase tracking-widest border border-[#0a0a0a] px-3 py-1.5 hover:bg-[#0a0a0a] hover:text-white transition-colors"
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
            <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-6 flex flex-col sm:flex-row sm:items-end gap-2">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-2">Design Tokens</p>
                <h2 className="font-black text-[1.75rem] uppercase leading-none tracking-tighter text-[#0a0a0a]">
                  Design System
                </h2>
              </div>
              <p className="font-mono text-[9px] text-[#888] sm:mb-1 sm:ml-auto">
                50–900 scales · Neutral greys · Semantic colors
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

          {/* ④ Accessibility */}
          <AccessibilityCheck ds={designSystem} />

          {/* ⑤ Templates */}
          <div className="border-b-2 border-[#0a0a0a]">
            <div className="border-b border-[#0a0a0a] px-8 md:px-12 py-6 flex flex-col sm:flex-row sm:items-end gap-2">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#aaa] mb-2">Preview</p>
                <h2 className="font-black text-[1.75rem] uppercase leading-none tracking-tighter text-[#0a0a0a]">
                  UI Templates
                </h2>
              </div>
              <p className="font-mono text-[9px] text-[#888] sm:mb-1 sm:ml-auto">
                See your palette applied to real UI layouts
              </p>
            </div>
            <TemplateSelector colors={templateColors} />
          </div>

          {/* Footer */}
          <footer className="px-8 md:px-12 py-5 flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-widest text-[#ccc]">
              Design System Generator
            </p>
            <p className="font-mono text-[8px] uppercase tracking-widest text-[#ccc]">
              Janvi Guliyan, {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
