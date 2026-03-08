"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onUpload: (file: File, previewUrl: string) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export default function ImageUploader({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        alert("Unsupported format. Please use JPG, PNG, WEBP, GIF, or AVIF.");
        return;
      }
      const url = URL.createObjectURL(file);
      onUpload(file, url);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-crosshair border-b-2 border-[#0a0a0a] transition-colors duration-150 select-none
        ${isDragging ? "drag-active" : "hover:bg-[#f2f2ee]"}`}
      style={{ minHeight: "52vh" }}
    >
      {/* Cross-hair grid lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Horizontal center */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#0a0a0a] opacity-10" />
        {/* Vertical center */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0a0a0a] opacity-10" />
        {/* Corner targets */}
        {[
          "top-6 left-6", "top-6 right-6",
          "bottom-6 left-6", "bottom-6 right-6",
        ].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-5 h-5 opacity-20`}>
            <div className="absolute top-0 left-0 w-full h-px bg-[#0a0a0a]" />
            <div className="absolute top-0 left-0 h-full w-px bg-[#0a0a0a]" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full gap-6 px-8 py-16">
        {/* Upload icon — minimal square */}
        <div className={`border-2 border-[#0a0a0a] w-14 h-14 flex items-center justify-center transition-colors ${isDragging ? "bg-[#0a0a0a]" : "bg-transparent"}`}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className={isDragging ? "text-white" : "text-[#0a0a0a]"}
          >
            <path d="M11 16V6M11 6L7 10M11 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <path d="M4 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </div>

        {/* Main text */}
        <div className="text-center">
          <p className="font-black text-[clamp(1.4rem,4vw,2.8rem)] uppercase leading-none tracking-tighter text-[#0a0a0a] mb-3">
            {isDragging ? "Release to Upload" : "Drop Image Here"}
          </p>
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#aaa]">
            or click anywhere to browse
          </p>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-6">
          {["JPG", "PNG", "WEBP", "GIF", "AVIF"].map((fmt, i) => (
            <span key={fmt} className="flex items-center gap-6">
              <span className="font-mono text-[12px] uppercase tracking-widest text-[#bbb]">{fmt}</span>
              {i < 4 && <span className="w-px h-3 bg-[#ddd]" />}
            </span>
          ))}
          <span className="w-px h-3 bg-[#ddd]" />
          <span className="font-mono text-[12px] uppercase tracking-widest text-[#bbb]">Max 10 MB</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        className="hidden"
      />
    </div>
  );
}
