"use client";

import { getContrastColor, hexToRgba, lighten, darken } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

export default function CreativeTemplate({ colors }: Props) {
  const [c0, c1, c2, c3, c4, c5] = colors;

  return (
    <div
      className="min-h-[520px] relative overflow-hidden"
      style={{ backgroundColor: lighten(c5, 0.82), fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background ambient blobs */}
      <div className="absolute pointer-events-none inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-24 rounded-full opacity-25"
          style={{ width: 380, height: 380, backgroundColor: c0, filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-0 -left-20 rounded-full opacity-20"
          style={{ width: 300, height: 300, backgroundColor: c2, filter: "blur(50px)" }}
        />
        <div
          className="absolute top-1/3 left-1/3 rounded-full opacity-15"
          style={{ width: 200, height: 200, backgroundColor: c4, filter: "blur(40px)" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-8 pt-7 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: c0, color: getContrastColor(c0) }}
          >
            C
          </div>
          <span className="font-black tracking-tighter text-[#111] text-[13px]">CHROMA™</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 text-[12px] font-bold"
            style={{ backgroundColor: hexToRgba(c1, 0.15), color: c1 }}
          >
            Work
          </button>
          <button
            className="px-4 py-2 text-[12px] font-bold"
            style={{ backgroundColor: c0, color: getContrastColor(c0) }}
          >
            Say hello →
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 px-8 pt-4 pb-8">
        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold mb-5"
          style={{ backgroundColor: c2, color: getContrastColor(c2) }}
        >
          ✦ Creative Studio · 2025
        </div>

        {/* Hero headline */}
        <h1
          className="font-black leading-[0.9] tracking-tight mb-7"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: "#111",
          }}
        >
          We make
          <span
            className="mx-3 px-3 py-1 inline-block"
            style={{ backgroundColor: c0, color: getContrastColor(c0) }}
          >
            magic
          </span>
          <br />
          happen{" "}
          <em className="not-italic" style={{ color: c1 }}>for real.</em>
        </h1>

        {/* Service cards — rotated stacked */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { title: "Brand", sub: "Identity & systems", color: c0, rot: "-2deg" },
            { title: "Motion", sub: "Film & animation", color: c1, rot: "1.5deg" },
            { title: "3D", sub: "Objects & space", color: c2, rot: "-1.5deg" },
            { title: "Web", sub: "Interaction & code", color: c3, rot: "2deg" },
          ].map(({ title, sub, color, rot }) => (
            <div
              key={title}
              className="flex-shrink-0 p-5 w-36 cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{
                backgroundColor: color,
                color: getContrastColor(color),
                transform: `rotate(${rot})`,
              }}
            >
              <span className="font-black text-[12px] uppercase tracking-[0.2em] block mb-6 opacity-60">
                0{["Brand", "Motion", "3D", "Web"].indexOf(title) + 1}
              </span>
              <p className="font-black text-xl leading-none">{title}</p>
              <p className="text-[12px] font-medium mt-1 opacity-70">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tag cloud */}
        <div className="flex flex-wrap gap-2 mb-7">
          {["Illustration", "Typography", "Color", "Motion", "3D", "Strategy", "UX"].map(
            (tag, i) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-[12px] font-bold border"
                style={{
                  backgroundColor: hexToRgba(colors[i % colors.length], 0.1),
                  color: colors[i % colors.length],
                  borderColor: hexToRgba(colors[i % colors.length], 0.3),
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>

        {/* CTA bottom bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: "#111" }}
        >
          <div>
            <p className="text-white font-black text-[15px]">Start something bold.</p>
            <p className="text-white text-[12px] opacity-40 mt-0.5">We don't do boring.</p>
          </div>
          <div className="flex items-center gap-3">
            {colors.slice(0, 4).map((c) => (
              <div key={c} className="w-3 h-3" style={{ backgroundColor: c }} />
            ))}
            <button
              className="ml-2 px-5 py-2.5 font-black text-[12px]"
              style={{ backgroundColor: c0, color: getContrastColor(c0) }}
            >
              Let's go ✦
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
