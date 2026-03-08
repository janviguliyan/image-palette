"use client";

import { getContrastColor } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

export default function BrutalistTemplate({ colors }: Props) {
  const [c0, c1, c2, c3, c4, c5] = colors;

  return (
    <div
      className="min-h-[520px] bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top bar */}
      <div className="border-b-4 border-black grid grid-cols-12">
        <div className="col-span-2 border-r-4 border-black px-4 py-3 flex items-center">
          <span className="font-black text-[13px] uppercase tracking-tighter">RAW</span>
        </div>
        <nav className="col-span-7 flex border-r-4 border-black">
          {["Work", "Studio", "Lab", "Press"].map((item, i) => (
            <a
              key={item}
              className="px-4 flex items-center font-black text-[12px] uppercase tracking-[0.2em] border-r-4 border-black cursor-pointer last:border-r-0 transition-colors hover:bg-black hover:text-white"
              style={i === 0 ? { backgroundColor: c0, color: getContrastColor(c0) } : {}}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="col-span-3 flex items-center justify-end px-4">
          <button
            className="font-black text-[12px] uppercase tracking-[0.2em] border-4 border-black px-3 py-2 transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: c1, color: getContrastColor(c1) }}
          >
            Let's Talk
          </button>
        </div>
      </div>

      {/* Hero block */}
      <div className="grid grid-cols-12 border-b-4 border-black" style={{ minHeight: "240px" }}>
        {/* Main title */}
        <div
          className="col-span-12 lg:col-span-7 border-b-4 lg:border-b-0 lg:border-r-4 border-black px-8 py-8 flex flex-col justify-between"
          style={{ backgroundColor: c0 }}
        >
          <div className="font-mono text-[12px] uppercase tracking-[0.3em]" style={{ color: getContrastColor(c0), opacity: 0.6 }}>
            Est. 2019 — Independent
          </div>
          <div>
            <h1
              className="font-black uppercase leading-[0.88] tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                color: getContrastColor(c0),
              }}
            >
              WE BUILD<br />
              THE UGLY<br />
              <span style={{ WebkitTextStroke: `3px ${getContrastColor(c0)}`, color: "transparent" }}>
                BEAUTIFUL
              </span>
            </h1>
          </div>
        </div>

        {/* Stats + manifesto */}
        <div className="col-span-12 lg:col-span-5 grid grid-rows-2">
          {/* Manifesto */}
          <div className="border-b-4 border-black px-6 py-5">
            <p className="font-black text-[12px] uppercase tracking-widest text-black leading-relaxed">
              No templates. No shortcuts. Every pixel deliberate. Every choice defended.
            </p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3">
            {[
              { n: "12+", l: "Years" },
              { n: "300+", l: "Projects" },
              { n: "∞", l: "Ideas" },
            ].map(({ n, l }, i) => (
              <div
                key={l}
                className={`${i < 2 ? "border-r-4" : ""} border-black flex flex-col items-center justify-center py-4`}
                style={{ backgroundColor: i === 2 ? "black" : "white" }}
              >
                <span className={`font-black text-3xl ${i === 2 ? "text-white" : "text-black"}`}>{n}</span>
                <span className={`font-mono text-[12px] uppercase tracking-[0.3em] mt-0.5 ${i === 2 ? "text-white opacity-50" : "text-black opacity-40"}`}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b-4 border-black">
        {[
          { name: "Brand", color: c2 },
          { name: "Web", color: c3 },
          { name: "Motion", color: c4 },
          { name: "Print", color: c5 },
        ].map(({ name, color }, i) => (
          <div
            key={name}
            className={`${i < 3 ? "border-r-4" : ""} border-black px-6 py-5 cursor-pointer group transition-colors`}
            style={{ backgroundColor: color }}
          >
            <div
              className="font-black text-[12px] uppercase tracking-[0.3em] mb-1"
              style={{ color: getContrastColor(color) }}
            >
              0{i + 1}
            </div>
            <div
              className="font-black text-xl uppercase leading-none"
              style={{ color: getContrastColor(color) }}
            >
              {name}
            </div>
            <div
              className="mt-3 font-black text-lg transition-transform group-hover:translate-x-1"
              style={{ color: getContrastColor(color), opacity: 0.5 }}
            >
              →
            </div>
          </div>
        ))}
      </div>

      {/* Ticker row */}
      <div className="border-b-4 border-black bg-black py-2.5 px-6 flex items-center gap-8 overflow-hidden">
        {["BOLD", "REAL", "BRUTAL", "SHARP", "LOUD", "TRUE", "RAW"].map((word, i) => (
          <span
            key={i}
            className="font-black text-[12px] uppercase tracking-[0.4em] whitespace-nowrap flex-shrink-0"
            style={{ color: colors[i % colors.length] }}
          >
            {word} /
          </span>
        ))}
      </div>

      {/* Featured project */}
      <div className="grid grid-cols-12">
        <div
          className="col-span-12 lg:col-span-8 border-r-0 lg:border-r-4 border-black px-8 py-7"
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-gray-400 mb-2">Featured Work</p>
          <p className="font-black text-2xl uppercase tracking-tight">Manifesto — Brand Identity 2024</p>
        </div>
        <div
          className="col-span-12 lg:col-span-4 flex items-center justify-center py-6"
          style={{ backgroundColor: c0 }}
        >
          <span className="font-black text-[12px] uppercase tracking-[0.3em]" style={{ color: getContrastColor(c0) }}>
            View Project →
          </span>
        </div>
      </div>
    </div>
  );
}
