"use client";

import { useState, useEffect, useRef } from "react";

export const NAV_ITEMS = [
  { id: "color-palette",  label: "Color Palette",        number: "01" },
  { id: "usage",          label: "Usage",                number: "02" },
  { id: "color-scales",   label: "Color Scales",         number: "03" },
  { id: "accessibility",  label: "Accessibility",        number: "04" },
  { id: "typography",     label: "Typography",           number: "05" },
  { id: "foundation",     label: "Spacing & Shadows",    number: "06" },
  { id: "ui-components",  label: "UI Components",        number: "07" },
  { id: "ui-templates",   label: "UI Templates",         number: "08" },
] as const;

interface Props {
  primaryColor: string;
  onReset: () => void;
}

export default function DesignSystemSidebar({ primaryColor, onReset }: Props) {
  const [active, setActive]         = useState<string>("color-palette");
  const [collapsed, setCollapsed]   = useState(false);
  const [headerH, setHeaderH]       = useState(73);
  const sidebarRef                  = useRef<HTMLElement>(null);

  // ── Measure real header height so sidebar top is always flush ──────────
  useEffect(() => {
    const measure = () => {
      const h = document.querySelector("header");
      if (h) setHeaderH(h.getBoundingClientRect().height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const h = document.querySelector("header");
    if (h) ro.observe(h);
    return () => ro.disconnect();
  }, []);

  // ── Active-section tracking ───────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= headerH + 20) {
          setActive(item.id);
          return;
        }
      }
      setActive(NAV_ITEMS[0].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerH]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const sidebarW = collapsed ? 52 : 220;

  return (
    <>
      {/* ── Desktop sidebar — sticky, flush below header ──────────────── */}
      <nav
        ref={sidebarRef}
        className="hidden lg:flex flex-col"
        style={{
          position:   "sticky",
          top:        headerH,
          height:     `calc(100vh - ${headerH}px)`,
          width:      sidebarW,
          minWidth:   sidebarW,
          background: "#FAFAFA",
          borderRight: "2px solid #0a0a0a",
          zIndex:     30,
          transition: "width 0.2s cubic-bezier(0.4,0,0.2,1), min-width 0.2s cubic-bezier(0.4,0,0.2,1)",
          alignSelf:  "flex-start",     // keeps sticky working inside flex
          overflow:   "hidden",
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center w-full hover:bg-black/[0.04] transition-colors shrink-0"
          style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{
              transform:  collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <path d="M9 2L4 7l5 5" stroke="#999" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Nav items — scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                title={collapsed ? item.label : undefined}
                className="w-full text-left flex items-center transition-colors"
                style={{
                  gap:           collapsed ? 0 : 10,
                  padding:       collapsed ? "9px 0" : "9px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderLeft:    isActive ? `3px solid ${primaryColor}` : "3px solid transparent",
                  background:    isActive ? `${primaryColor}12` : "transparent",
                  marginBottom:  1,
                }}
              >
                <span
                  className="font-mono font-bold shrink-0"
                  style={{
                    fontSize: "10px",
                    color:    isActive ? primaryColor : "#c0c0c0",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {item.number}
                </span>
                {!collapsed && (
                  <span
                    className="font-mono uppercase tracking-[0.07em] truncate"
                    style={{
                      fontSize:   "11px",
                      fontWeight: isActive ? 700 : 500,
                      color:      isActive ? primaryColor : "#555",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Back button — always visible at bottom ─────────────────── */}
        <div style={{ borderTop: "2px solid #0a0a0a", flexShrink: 0 }}>
          <button
            onClick={onReset}
            title={collapsed ? "Start Over" : undefined}
            className="w-full flex items-center transition-colors hover:bg-black hover:text-white group"
            style={{
              gap:           collapsed ? 0 : 10,
              padding:       collapsed ? "12px 0" : "12px 14px",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            {/* Arrow icon */}
            <span
              className="shrink-0 flex items-center justify-center"
              style={{ minWidth: 18, color: "inherit" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M6 2L2 7l4 5M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {!collapsed && (
              <span
                className="font-mono uppercase tracking-[0.07em] font-bold"
                style={{ fontSize: "11px", color: "inherit" }}
              >
                Start Over
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-black flex overflow-x-auto"
        style={{ height: 52 }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex flex-col items-center justify-center flex-shrink-0 transition-colors"
              style={{
                minWidth:  68,
                padding:   "4px 6px",
                background: isActive ? `${primaryColor}12` : "transparent",
                borderTop:  isActive ? `2px solid ${primaryColor}` : "2px solid transparent",
              }}
            >
              <span className="font-mono font-bold" style={{ fontSize: "9px", color: isActive ? primaryColor : "#bbb" }}>
                {item.number}
              </span>
              <span
                className="font-mono uppercase"
                style={{
                  fontSize:   "8px",
                  color:      isActive ? primaryColor : "#888",
                  fontWeight: isActive ? 700 : 400,
                  marginTop:  2,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Back button in mobile bar */}
        <button
          onClick={onReset}
          className="flex flex-col items-center justify-center flex-shrink-0 transition-colors hover:bg-black hover:text-white"
          style={{ minWidth: 60, padding: "4px 6px", borderLeft: "2px solid #0a0a0a" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginBottom: 2 }}>
            <path d="M6 2L2 7l4 5M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono uppercase font-bold" style={{ fontSize: "8px", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
            Back
          </span>
        </button>
      </nav>
    </>
  );
}
