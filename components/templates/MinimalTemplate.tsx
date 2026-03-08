"use client";

import { getContrastColor, hexToRgba, lighten } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

export default function MinimalTemplate({ colors }: Props) {
  const [c0, c1, c2, c3, c4, c5] = colors;

  return (
    <div className="bg-white min-h-[520px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5" style={{ backgroundColor: c0 }} />
          <span className="font-bold text-[13px] tracking-tight text-gray-900">Studio</span>
        </div>
        <div className="hidden sm:flex items-center gap-8 text-[12px] text-gray-400">
          {["Work", "About", "Services", "Contact"].map((item) => (
            <a key={item} className="hover:text-gray-900 transition-colors cursor-pointer">{item}</a>
          ))}
        </div>
        <button
          className="text-[12px] font-medium px-4 py-2 transition-all"
          style={{ backgroundColor: c0, color: getContrastColor(c0) }}
        >
          Get in touch
        </button>
      </nav>

      {/* Hero — two column */}
      <section className="grid grid-cols-12 min-h-[320px]">
        {/* Left: text */}
        <div className="col-span-12 lg:col-span-7 px-10 py-14 flex flex-col justify-center">
          <div
            className="inline-flex items-center gap-2 mb-6 text-[12px] font-medium px-3 py-1 w-fit"
            style={{ backgroundColor: hexToRgba(c1, 0.1), color: c1 }}
          >
            <div className="w-1.5 h-1.5" style={{ backgroundColor: c1 }} />
            Available for new projects
          </div>
          <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.0] tracking-tight text-gray-900 mb-5">
            Design that moves<br />
            <em className="not-italic" style={{ color: c0 }}>people</em>, not just<br />
            pixels.
          </h1>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-sm mb-8">
            We build brand identities and digital experiences that last — crafted with obsessive attention to detail.
          </p>
          <div className="flex items-center gap-3">
            <button
              className="text-[12px] font-semibold px-6 py-3 transition-all hover:opacity-90"
              style={{ backgroundColor: c0, color: getContrastColor(c0) }}
            >
              View selected work
            </button>
            <button className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
              Read our thinking
              <span style={{ color: c0 }}>→</span>
            </button>
          </div>
        </div>

        {/* Right: abstract color grid */}
        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 border-l border-[#f0f0f0]">
          {colors.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className={`${i < 2 ? "border-b" : ""} ${i % 2 === 0 ? "border-r" : ""} border-[#f0f0f0]`}
              style={{ backgroundColor: lighten(c, 0.82), minHeight: "80px" }}
            >
              <div className="w-full h-full flex items-end p-3">
                <span className="font-mono text-[12px] text-gray-400">{c}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work cards */}
      <section className="px-10 pb-10 border-t border-[#f0f0f0]">
        <div className="pt-8 mb-5 flex items-end justify-between">
          <p className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Selected Work</p>
          <a className="text-[12px] text-gray-400 hover:text-gray-800 cursor-pointer" style={{ color: c0 }}>View all →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Brand Identity", sub: "Maison & Co.", color: c0 },
            { label: "Web Design", sub: "Orbit Finance", color: c1 },
            { label: "Art Direction", sub: "Nuage Studio", color: c2 },
          ].map(({ label, sub, color }) => (
            <div key={label} className="group cursor-pointer">
              <div
                className="w-full aspect-video mb-3 flex items-end p-4 transition-all group-hover:scale-[1.01]"
                style={{ backgroundColor: lighten(color, 0.7) }}
              >
                <div className="w-8 h-8" style={{ backgroundColor: color }} />
              </div>
              <p className="text-[12px] font-semibold text-gray-900">{label}</p>
              <p className="text-[12px] text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Palette strip */}
      <div className="flex h-1.5 border-t border-[#f0f0f0]">
        {colors.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}
      </div>
    </div>
  );
}
