"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ColorPalette from "@/components/ColorPalette";
import TemplateSelector from "@/components/TemplateSelector";

export default function Home() {
  const [colors, setColors] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File, previewUrl: string) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(previewUrl);
    setColors([]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/extract-colors", {
        method: "POST",
        body: formData,
      });
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

  const handleReset = () => {
    setColors([]);
    setImageUrl(null);
    setError(null);
  };

  const hasResult = imageUrl && colors.length > 0;

  return (
    <div className="min-h-screen bg-[#f9f9f7]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="border-b-2 border-[#0a0a0a] bg-[#f9f9f7] sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 sm:px-10 h-12">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-[#0a0a0a]" />
            <span className="font-black text-[11px] uppercase tracking-[0.25em] text-[#0a0a0a]">
              Image Palette
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] hidden sm:block">
            Extract · Preview · Steal
          </span>
          {hasResult && (
            <button
              onClick={handleReset}
              className="font-mono text-[10px] uppercase tracking-widest border border-[#0a0a0a] px-3 py-1.5 hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              ↩ New Image
            </button>
          )}
        </div>
      </header>

      {/* ── LANDING: HERO + UPLOAD ── */}
      {!imageUrl && !isLoading && (
        <>
          {/* Hero */}
          <div className="border-b-2 border-[#0a0a0a] grid grid-cols-12">
            {/* Left: big heading */}
            <div className="col-span-12 lg:col-span-8 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0a0a0a] px-8 sm:px-12 py-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888] mb-5">
                01 / Extract
              </p>
              <h1 className="font-black text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.92] tracking-tighter text-[#0a0a0a]">
                Color<br />
                Palette<br />
                <span className="relative inline-block">
                  Extractor
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#0a0a0a]" />
                </span>
              </h1>
            </div>
            {/* Right: description */}
            <div className="col-span-12 lg:col-span-4 px-8 py-10 flex flex-col justify-between gap-6">
              <p className="text-[0.85rem] text-[#555] leading-relaxed max-w-xs">
                Upload any image. 6 dominant colors are extracted using K-Means clustering. Preview your palette across 5 distinct UI templates.
              </p>
              <div className="space-y-2 font-mono text-[10px] uppercase tracking-widest text-[#aaa]">
                {["JPG", "PNG", "WEBP", "GIF", "AVIF"].map((fmt) => (
                  <div key={fmt} className="flex items-center gap-3">
                    <div className="w-3 h-px bg-[#ccc]" />
                    {fmt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload zone */}
          <ImageUploader onUpload={handleImageUpload} />
        </>
      )}

      {/* ── LOADING ── */}
      {isLoading && (
        <div className="border-b-2 border-[#0a0a0a] px-8 py-20 animate-up">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888] mb-6">
            Processing...
          </p>
          <div className="flex gap-0 h-20">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-1 border-r border-[#0a0a0a] last:border-r-0 bg-[#e8e8e4]"
                style={{
                  animation: `gridPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#aaa] mt-3">
            Clustering pixel data
          </p>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="border-b-2 border-[#0a0a0a] px-8 py-10 animate-up">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888] mb-3">Error</p>
          <p className="font-black text-lg text-[#0a0a0a] mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="font-mono text-[10px] uppercase tracking-widest border border-[#0a0a0a] px-4 py-2 hover:bg-[#0a0a0a] hover:text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── RESULTS ── */}
      {hasResult && (
        <div className="animate-up">
          {/* Image + Palette grid */}
          <div className="border-b-2 border-[#0a0a0a] grid grid-cols-12">
            {/* Image column */}
            <div className="col-span-12 lg:col-span-3 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0a0a0a]">
              <div className="p-4 border-b border-[#0a0a0a]">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#888]">
                  Source Image
                </p>
              </div>
              <div className="relative">
                <img
                  src={imageUrl!}
                  alt="Source"
                  className="w-full object-cover"
                  style={{ maxHeight: "440px" }}
                />
              </div>
            </div>

            {/* Palette column */}
            <div className="col-span-12 lg:col-span-9">
              <ColorPalette colors={colors} />
            </div>
          </div>

          {/* Templates section */}
          <TemplateSelector colors={colors} />
        </div>
      )}

      {/* ── FOOTER ── */}
      {!hasResult && !isLoading && (
        <footer className="border-t-2 border-[#0a0a0a] mt-0">
          <div className="flex items-center justify-between px-8 py-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#aaa]">
              Image Palette — Color Extraction Tool
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#aaa]">
              Made by Janvi Guliyan, {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
