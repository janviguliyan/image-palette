"use client";

import { getContrastColor, hexToRgba, lighten } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

export default function EditorialTemplate({ colors }: Props) {
  const [c0, c1, c2, c3, c4, c5] = colors;

  return (
    <div
      className="min-h-[520px] bg-[#faf9f6]"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Masthead top bar */}
      <div
        className="py-1.5 px-8 flex items-center justify-between border-b"
        style={{ backgroundColor: c0, borderColor: "transparent" }}
      >
        <p
          className="text-[9px] font-bold tracking-[0.35em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: getContrastColor(c0) }}
        >
          Spring 2025 — Issue XII
        </p>
        <div className="flex gap-5">
          {["Subscribe", "Archive"].map((item) => (
            <a
              key={item}
              className="text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: getContrastColor(c0),
                opacity: 0.65,
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Masthead title */}
      <div
        className="border-b-2 border-black px-8 py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
      >
        <h1
          className="text-[clamp(2.4rem,6vw,4rem)] font-black uppercase leading-none tracking-[-0.03em]"
        >
          <em className="not-italic" style={{ color: c1 }}>The</em> Review
        </h1>
        <div
          className="flex items-center gap-3 pb-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div className="h-px w-10 bg-gray-300" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400">
            Design & Culture
          </p>
        </div>
      </div>

      {/* Main editorial grid */}
      <div className="grid grid-cols-12 border-b border-gray-200">

        {/* Lead article */}
        <article className="col-span-12 lg:col-span-8 border-b lg:border-b-0 lg:border-r border-gray-200 px-8 py-7">
          {/* Category */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-2 h-2 rotate-45" style={{ backgroundColor: c2 }} />
            <span
              className="text-[9px] font-bold tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", color: c2 }}
            >
              Cover Story
            </span>
          </div>

          <h2
            className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black leading-[1.1] tracking-tight mb-4"
          >
            The Colors That{" "}
            <em style={{ color: c0 }}>Define</em>
            <br />Our Generation
          </h2>

          <p
            className="text-[13px] text-gray-600 leading-relaxed mb-5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            In a world saturated with visual noise, a generation of designers is returning to what is fundamental — the emotional language of color. What does it truly mean to choose a palette?
          </p>

          {/* Pull quote */}
          <blockquote
            className="border-l-4 pl-5 py-1 my-5"
            style={{ borderColor: c1 }}
          >
            <p
              className="text-[17px] font-bold italic leading-snug"
            >
              "Color is the first thing you feel,<br />and the last thing you forget."
            </p>
            <cite
              className="text-[10px] text-gray-400 mt-2 block not-italic"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              — Iris Tanaka, Creative Director
            </cite>
          </blockquote>

          <p
            className="text-[13px] text-gray-500 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            From sun-bleached terracottas to deep digital indigos, the palettes of 2025 speak a language that transcends trend cycles. They carry the weight of place, memory, and ambition.
          </p>

          {/* Color reference row */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
            <p
              className="text-[9px] uppercase tracking-widest text-gray-400 mr-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Palette
            </p>
            {colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-6 h-6 border border-white shadow-sm"
                  style={{ backgroundColor: c }}
                />
                <span
                  className="text-[8px] font-mono text-gray-300"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {c.slice(1).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Story 2 */}
          <div className="px-6 py-6 border-b border-gray-200">
            <span
              className="text-[8px] font-bold tracking-[0.35em] uppercase block mb-2"
              style={{ fontFamily: "'Inter', sans-serif", color: c3 }}
            >
              Perspective
            </span>
            <h3 className="text-[15px] font-bold leading-snug mb-2">
              Why Brutalism<br />
              <em>Is Beautiful</em>
            </h3>
            <p
              className="text-[11px] text-gray-500 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              The raw, unfinished aesthetic is having a moment — more refined than it appears.
            </p>
          </div>

          {/* Story 3 */}
          <div className="px-6 py-6 border-b border-gray-200">
            <span
              className="text-[8px] font-bold tracking-[0.35em] uppercase block mb-2"
              style={{ fontFamily: "'Inter', sans-serif", color: c4 }}
            >
              In Practice
            </span>
            <h3 className="text-[15px] font-bold leading-snug mb-2">
              Grids That<br />
              <em>Break Rules</em>
            </h3>
            <p
              className="text-[11px] text-gray-500 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Five studios doing layout work that makes Swiss modernism look cautious.
            </p>
          </div>

          {/* Subscribe */}
          <div
            className="mt-auto px-6 py-5"
            style={{ backgroundColor: c5 }}
          >
            <p
              className="font-black text-[13px] mb-1"
              style={{ color: getContrastColor(c5) }}
            >
              Subscribe
            </p>
            <p
              className="text-[10px] mb-4 opacity-65"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: getContrastColor(c5),
              }}
            >
              Six issues per year. No filler.
            </p>
            <button
              className="w-full py-2.5 text-[10px] font-bold transition-opacity hover:opacity-90"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: getContrastColor(c5),
                color: c5,
              }}
            >
              Get the Review
            </button>
          </div>
        </aside>
      </div>

      {/* Footer color rule */}
      <div className="flex h-2">
        {colors.map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}
