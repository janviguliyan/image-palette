"use client";

import { hexToRgba } from "@/lib/colorUtils";

interface Props {
  colors: string[];
}

export default function TechTemplate({ colors }: Props) {
  const [c0, c1, c2, c3, c4, c5] = colors;
  const BG = "#070809";
  const BORDER = "rgba(255,255,255,0.06)";
  const DIM = "rgba(255,255,255,0.25)";
  const DIMMER = "rgba(255,255,255,0.12)";

  const glow = (c: string) => `0 0 16px ${hexToRgba(c, 0.35)}`;

  return (
    <div
      className="min-h-[520px] flex flex-col"
      style={{ backgroundColor: BG, fontFamily: "'JetBrains Mono', 'Consolas', monospace" }}
    >
      {/* Top status bar */}
      <div
        className="flex items-center gap-4 px-5 py-2 border-b text-[9px] uppercase tracking-widest"
        style={{ borderColor: BORDER, color: DIMMER }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c0, boxShadow: glow(c0) }} />
          <span style={{ color: c0 }}>LIVE</span>
        </span>
        <span>sys.io / v2.4.1</span>
        <span className="ml-auto">UTC 14:32:07</span>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-48 flex-shrink-0 flex flex-col border-r"
          style={{ borderColor: BORDER }}
        >
          {/* Logo */}
          <div className="px-4 py-4 border-b" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5"
                style={{ backgroundColor: c0, boxShadow: glow(c0) }}
              />
              <span className="text-[11px] font-bold tracking-wider uppercase text-white">SYS.IO</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3 px-2 space-y-px">
            {[
              { label: "Dashboard", active: true, c: c0 },
              { label: "Analytics", active: false, c: c1 },
              { label: "Models", active: false, c: c2 },
              { label: "Pipelines", active: false, c: c3 },
              { label: "Logs", active: false, c: c4 },
              { label: "Settings", active: false, c: c5 },
            ].map(({ label, active, c }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] cursor-pointer"
                style={{
                  backgroundColor: active ? hexToRgba(c, 0.12) : "transparent",
                  color: active ? c : DIMMER,
                  borderLeft: active ? `2px solid ${c}` : "2px solid transparent",
                }}
              >
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? c : DIMMER, boxShadow: active ? glow(c) : "none" }}
                />
                {label}
              </div>
            ))}
          </nav>

          {/* Palette dots */}
          <div className="px-4 py-3 border-t" style={{ borderColor: BORDER }}>
            <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: DIMMER }}>Palette</p>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((c) => (
                <div
                  key={c}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c, boxShadow: glow(c) }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Page header */}
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
            <div>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: DIMMER }}>
                sys.io / dashboard
              </p>
              <h1 className="text-[14px] font-bold text-white mt-0.5">System Overview</h1>
            </div>
            <button
              className="text-[9px] uppercase tracking-widest px-3 py-1.5 border font-bold"
              style={{ borderColor: hexToRgba(c0, 0.4), color: c0 }}
            >
              + Deploy
            </button>
          </div>

          <div className="flex-1 p-5 space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "CPU Usage", value: "73.2%", delta: "+4.1%", c: c0 },
                { label: "Memory", value: "12.4 GB", delta: "of 32 GB", c: c1 },
                { label: "Req / min", value: "98.7K", delta: "↑ 12%", c: c2 },
              ].map(({ label, value, delta, c }) => (
                <div
                  key={label}
                  className="p-3 border"
                  style={{
                    borderColor: hexToRgba(c, 0.2),
                    backgroundColor: hexToRgba(c, 0.05),
                  }}
                >
                  <p className="text-[8px] uppercase tracking-widest" style={{ color: DIMMER }}>{label}</p>
                  <p className="text-[22px] font-bold mt-1" style={{ color: c, textShadow: glow(c) }}>{value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: hexToRgba(c, 0.6) }}>{delta}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div
              className="p-4 border"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: DIMMER }}>Throughput / 24h</p>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: hexToRgba(c0, 0.6) }}>Live</p>
              </div>
              <div className="flex items-end gap-px h-16">
                {[0.45, 0.7, 0.5, 0.85, 0.6, 0.92, 0.72, 0.88, 0.55, 0.78, 0.96, 0.62, 0.82, 0.73, 0.52, 0.89, 0.67, 0.74, 0.91, 0.58].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      height: `${h * 100}%`,
                      backgroundColor: hexToRgba(colors[i % colors.length], 0.75),
                      boxShadow: `0 0 4px ${hexToRgba(colors[i % colors.length], 0.3)}`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Log stream */}
            <div className="border" style={{ borderColor: BORDER }}>
              <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: DIMMER }}>Event Log</p>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c0 }} />
              </div>
              {[
                { t: "14:32:01", status: "200", msg: "GET /api/v2/inference", ms: "0.8ms", c: c0 },
                { t: "14:32:00", status: "201", msg: "POST /api/v2/model/create", ms: "11ms", c: c1 },
                { t: "14:31:59", status: "200", msg: "GET /api/v2/metrics", ms: "2.1ms", c: c0 },
                { t: "14:31:58", status: "404", msg: "GET /api/v1/deprecated", ms: "0.3ms", c: c3 },
              ].map(({ t, status, msg, ms, c }) => (
                <div
                  key={msg}
                  className="flex items-center gap-4 px-3 py-1.5 border-b text-[9px]"
                  style={{ borderColor: BORDER }}
                >
                  <span style={{ color: DIMMER }}>{t}</span>
                  <span style={{ color: c, fontWeight: "bold" }}>{status}</span>
                  <span className="flex-1 truncate" style={{ color: DIMMER }}>{msg}</span>
                  <span style={{ color: hexToRgba(c, 0.5) }}>{ms}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
