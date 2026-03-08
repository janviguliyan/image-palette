export default function HowToUse() {
  const sections = [
    {
      tool: "Figma",
      number: "A",
      steps: [
        "Click Export → Figma JSON tab, then Copy All",
        'Open Figma and install a Variables Import plugin (e.g. "Design Tokens" or "Variables Import")',
        "Open the plugin and paste the copied JSON",
        "Click Import — colors appear in Local Variables under Collections",
        "Apply tokens to fills, strokes, or effects via the Variables panel",
      ],
      hint: "Tokens follow the format color.primary.500 — each maps to a Figma variable.",
    },
    {
      tool: "CSS",
      number: "B",
      steps: [
        "Click Export → CSS Variables tab, then Copy All",
        'Paste the :root { } block into your global stylesheet (e.g. globals.css)',
        "Use variables anywhere in your CSS:",
      ],
      code: `button {\n  background: var(--color-primary-500);\n  color: var(--color-gray-50);\n}\n\na:hover {\n  color: var(--color-accent-400);\n}`,
      hint: "All scales (primary, secondary, gray, success, error, warning, info) are included.",
    },
    {
      tool: "Tailwind CSS",
      number: "C",
      steps: [
        "Click Export → Tailwind Config tab, then Copy All",
        'Paste inside theme.extend.colors in tailwind.config.js (or .ts):',
      ],
      code: `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        // ← paste here\n      }\n    }\n  }\n}`,
      hint: "Then use utility classes like bg-primary-500, text-gray-900, border-error-400.",
    },
  ];

  return (
    <div className="border-b-2 border-[#0a0a0a]">
      <div className="border-b border-[#0a0a0a] px-6 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#888]">
          08 / How to Use
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e8e8e4]">
        {sections.map(({ tool, number, steps, code, hint }) => (
          <div key={tool} className="p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#0a0a0a] flex items-center justify-center shrink-0">
                <span className="font-mono text-[12px] text-white">{number}</span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide text-[#0a0a0a]">{tool}</h3>
            </div>

            {/* Steps */}
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="font-mono text-[12px] text-[#bbb] shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="font-mono text-[12px] text-[#555] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            {/* Code snippet */}
            {code && (
              <pre className="bg-[#f4f4f2] border border-[#e8e8e4] px-3 py-2.5 text-[12px] font-mono text-[#444] leading-relaxed overflow-x-auto">
                {code}
              </pre>
            )}

            {/* Hint */}
            <p className="font-mono text-[12px] text-[#aaa] leading-relaxed border-l-2 border-[#e8e8e4] pl-3">
              {hint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
