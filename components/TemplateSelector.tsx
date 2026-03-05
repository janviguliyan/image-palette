"use client";

import { useState } from "react";
import MinimalTemplate from "./templates/MinimalTemplate";
import BrutalistTemplate from "./templates/BrutalistTemplate";
import TechTemplate from "./templates/TechTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import EditorialTemplate from "./templates/EditorialTemplate";

interface Props {
  colors: string[];
}

// Abstract mini-thumbnail components (CSS-only, palette-aware)
function MinimalThumb({ colors }: { colors: string[] }) {
  return (
    <div className="w-full h-full bg-white p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2" style={{ backgroundColor: colors[0] }} />
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="h-2 bg-gray-900 w-3/4" />
        <div className="h-1 bg-gray-200 w-1/2" />
      </div>
      <div className="flex gap-1">
        <div className="h-4 w-10 flex-shrink-0" style={{ backgroundColor: colors[0] }} />
        <div className="h-4 flex-1 bg-gray-100" />
      </div>
    </div>
  );
}

function BrutalistThumb({ colors }: { colors: string[] }) {
  return (
    <div className="w-full h-full bg-white border-2 border-black flex flex-col">
      <div className="flex border-b-2 border-black" style={{ height: "40%" }}>
        <div className="flex-1 border-r-2 border-black" style={{ backgroundColor: colors[0] }} />
        <div className="flex-1 bg-black" />
      </div>
      <div className="flex flex-1">
        {colors.slice(1, 4).map((c, i) => (
          <div
            key={i}
            className={`flex-1 ${i < 2 ? "border-r-2 border-black" : ""}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

function TechThumb({ colors }: { colors: string[] }) {
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: "#0a0b0d" }}>
      <div className="w-6 border-r flex flex-col py-2 gap-1 items-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {colors.slice(0, 4).map((c, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: i === 0 ? 1 : 0.4 }} />
        ))}
      </div>
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        <div className="grid grid-cols-3 gap-1">
          {colors.slice(0, 3).map((c, i) => (
            <div key={i} className="h-4 rounded-sm" style={{ backgroundColor: `${c}22`, border: `1px solid ${c}44` }} />
          ))}
        </div>
        <div className="flex gap-px flex-1 items-end">
          {[0.5, 0.7, 0.4, 0.9, 0.6, 0.8].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 100}%`, backgroundColor: colors[i % colors.length], opacity: 0.7 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CreativeThumb({ colors }: { colors: string[] }) {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: "#f5f5f0" }}>
      {colors.slice(0, 3).map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-60"
          style={{
            backgroundColor: c,
            width: `${45 + i * 10}%`,
            height: `${45 + i * 10}%`,
            top: `${10 + i * 15}%`,
            left: `${5 + i * 20}%`,
            filter: "blur(1px)",
          }}
        />
      ))}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="h-2 bg-gray-900 w-2/3 mb-1" />
        <div className="h-1 bg-gray-400 w-1/2" />
      </div>
    </div>
  );
}

function EditorialThumb({ colors }: { colors: string[] }) {
  return (
    <div className="w-full h-full bg-[#faf9f7] flex flex-col">
      <div className="h-3 border-b-2 border-black flex items-center px-2">
        <div className="h-1 w-8" style={{ backgroundColor: colors[0] }} />
      </div>
      <div className="flex-1 flex">
        <div className="flex-[2] border-r border-gray-200 p-2 flex flex-col gap-1">
          <div className="h-2 bg-gray-900 w-full" />
          <div className="h-1 bg-gray-200 w-3/4" />
          <div className="h-1 bg-gray-200 w-4/5" />
          <div className="mt-1 border-l-2 pl-1" style={{ borderColor: colors[1] }}>
            <div className="h-1 bg-gray-300 w-full" />
          </div>
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1.5">
          <div className="h-1.5 bg-gray-200 w-full" />
          <div className="h-1.5 bg-gray-200 w-3/4" />
          <div className="flex-1 mt-1" style={{ backgroundColor: colors[4] }} />
        </div>
      </div>
      <div className="flex h-1.5">
        {colors.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}
      </div>
    </div>
  );
}

const TEMPLATES = [
  {
    id: "minimal",
    label: "Minimal",
    tag: "Clean",
    description: "Generous space, single-accent palette. Portfolio & product.",
    Thumb: MinimalThumb,
    Component: MinimalTemplate,
  },
  {
    id: "brutalist",
    label: "Brutalist",
    tag: "Raw",
    description: "Thick borders, full-bleed blocks, confrontational type.",
    Thumb: BrutalistThumb,
    Component: BrutalistTemplate,
  },
  {
    id: "tech",
    label: "Tech Dark",
    tag: "Data",
    description: "Dark ambient, glowing accents, live dashboard layout.",
    Thumb: TechThumb,
    Component: TechTemplate,
  },
  {
    id: "creative",
    label: "Creative",
    tag: "Playful",
    description: "Color explosions, overlapping shapes, kinetic energy.",
    Thumb: CreativeThumb,
    Component: CreativeTemplate,
  },
  {
    id: "editorial",
    label: "Editorial",
    tag: "Refined",
    description: "Typographic grid, serif hierarchy, magazine structure.",
    Thumb: EditorialThumb,
    Component: EditorialTemplate,
  },
];

export default function TemplateSelector({ colors }: Props) {
  const [activeId, setActiveId] = useState("minimal");
  const active = TEMPLATES.find((t) => t.id === activeId)!;
  const ActiveComponent = active.Component;

  return (
    <div className="border-t-2 border-[#0a0a0a]" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Section header */}
      <div className="border-b border-[#222] px-6 sm:px-10 py-4 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#555]">
          03 / Template Preview
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#333]">
          {TEMPLATES.length} designs
        </p>
      </div>

      {/* Template card grid */}
      <div className="grid grid-cols-5 border-b border-[#1a1a1a]">
        {TEMPLATES.map((t, idx) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`tpl-card group flex flex-col text-left transition-all duration-150 ${
                idx < TEMPLATES.length - 1 ? "border-r border-[#1a1a1a]" : ""
              } ${isActive ? "bg-[#111]" : "hover:bg-[#111]"}`}
            >
              {/* Mini thumbnail */}
              <div className="tpl-thumb relative overflow-hidden border-b border-[#1a1a1a]" style={{ paddingBottom: "62%" }}>
                <div className="absolute inset-0">
                  <t.Thumb colors={colors} />
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white" />
                )}
              </div>

              {/* Card info */}
              <div className="px-3 py-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-[11px] uppercase tracking-wider text-white">
                    {t.label}
                  </span>
                  <span
                    className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5"
                    style={{
                      backgroundColor: isActive ? "#fff" : "#222",
                      color: isActive ? "#000" : "#555",
                    }}
                  >
                    {t.tag}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-[#444] leading-relaxed hidden sm:block">
                  {t.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active template indicator bar */}
      <div className="flex border-b border-[#1a1a1a] h-0.5">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="flex-1 transition-colors duration-200"
            style={{ backgroundColor: t.id === activeId ? colors[0] || "#fff" : "transparent" }}
          />
        ))}
      </div>

      {/* Full preview */}
      <div
        key={activeId}
        className="animate-up"
      >
        {/* Preview label */}
        <div className="px-6 sm:px-10 py-3 flex items-center justify-between border-b border-[#1a1a1a]">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#444]">
            {active.label} — Live Preview
          </p>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#222]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#222]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#222]" />
          </div>
        </div>

        {/* Template render */}
        <div className="overflow-hidden" style={{ minHeight: "520px" }}>
          <ActiveComponent colors={colors} />
        </div>
      </div>
    </div>
  );
}
