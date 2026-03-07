import { NextRequest, NextResponse } from "next/server";

interface ColorRgb { r: number; g: number; b: number; a: number; }

function hexToFigmaRgb(hex: string): ColorRgb {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
    a: 1,
  };
}

function remToPx(rem: string): number {
  // e.g. "1.5rem" → 24, "0.125rem" → 2, "9999px" → 9999
  if (rem.endsWith("px")) return parseFloat(rem);
  return Math.round(parseFloat(rem) * 16);
}

export async function POST(req: NextRequest) {
  try {
    const { pat, fileKey, designSystem } = await req.json();

    if (!pat || !fileKey || !designSystem) {
      return NextResponse.json({ error: "Missing pat, fileKey, or designSystem" }, { status: 400 });
    }

    const { scales, neutral, semantic } = designSystem;

    // ── Build variable collections, modes, variables, values ─────────────────

    const variableCollections: object[] = [];
    const variableModes: object[] = [];
    const variables: object[] = [];
    const variableValues: object[] = [];

    let colIdx = 0;
    let varIdx = 0;

    function makeCollection(name: string) {
      const colId = `vco:${colIdx}`;
      const modeId = `vco:${colIdx}:m`;
      colIdx++;
      variableCollections.push({ action: "CREATE", id: colId, name, initialModeId: modeId });
      variableModes.push({ action: "CREATE", id: modeId, name: "Default", variableCollectionId: colId });
      return { colId, modeId };
    }

    function addColorVar(name: string, colId: string, modeId: string, hex: string) {
      const vid = `v:${varIdx++}`;
      variables.push({ action: "CREATE", id: vid, name, variableCollectionId: colId, resolvedType: "COLOR" });
      variableValues.push({ action: "UPDATE", variableId: vid, modeId, value: hexToFigmaRgb(hex) });
    }

    function addFloatVar(name: string, colId: string, modeId: string, px: number) {
      const vid = `v:${varIdx++}`;
      variables.push({ action: "CREATE", id: vid, name, variableCollectionId: colId, resolvedType: "FLOAT" });
      variableValues.push({ action: "UPDATE", variableId: vid, modeId, value: px });
    }

    // ── 1. Color collections ──────────────────────────────────────────────────
    const colorGroups: [string, Record<string, string>][] = [
      ["Primary",   scales.primary],
      ["Secondary", scales.secondary],
      ["Tertiary",  scales.tertiary],
      ["Accent",    scales.accent],
      ["Neutral",   neutral],
      ["Success",   semantic.success],
      ["Error",     semantic.error],
      ["Warning",   semantic.warning],
      ["Info",      semantic.info],
    ];

    const { colId: colorColId, modeId: colorModeId } = makeCollection("Colors");
    for (const [group, scale] of colorGroups) {
      for (const [step, hex] of Object.entries(scale)) {
        addColorVar(`${group}/${step}`, colorColId, colorModeId, hex as string);
      }
    }

    // ── 2. Spacing collection ─────────────────────────────────────────────────
    const spacingScale = [
      { name: "0.5", value: "0.125rem" }, { name: "1",  value: "0.25rem"  },
      { name: "2",   value: "0.5rem"   }, { name: "3",  value: "0.75rem"  },
      { name: "4",   value: "1rem"     }, { name: "5",  value: "1.25rem"  },
      { name: "6",   value: "1.5rem"   }, { name: "8",  value: "2rem"     },
      { name: "10",  value: "2.5rem"   }, { name: "12", value: "3rem"     },
      { name: "16",  value: "4rem"     }, { name: "20", value: "5rem"     },
      { name: "24",  value: "6rem"     }, { name: "32", value: "8rem"     },
    ];
    const { colId: spaceColId, modeId: spaceModeId } = makeCollection("Spacing");
    for (const s of spacingScale) {
      addFloatVar(s.name, spaceColId, spaceModeId, remToPx(s.value));
    }

    // ── 3. Border radius collection ───────────────────────────────────────────
    const radiusScale = [
      { name: "None", value: "0px"    }, { name: "XS",   value: "2px"    },
      { name: "SM",   value: "4px"    }, { name: "MD",   value: "8px"    },
      { name: "LG",   value: "12px"   }, { name: "XL",   value: "16px"   },
      { name: "2XL",  value: "24px"   }, { name: "Pill", value: "9999px" },
    ];
    const { colId: radColId, modeId: radModeId } = makeCollection("Border Radius");
    for (const r of radiusScale) {
      addFloatVar(r.name, radColId, radModeId, remToPx(r.value));
    }

    // ── 4. Typography size collection ─────────────────────────────────────────
    const typographyScale = [
      { name: "Display",    size: 60, weight: 900, lineHeight: 0.9  },
      { name: "H1",         size: 48, weight: 800, lineHeight: 0.95 },
      { name: "H2",         size: 36, weight: 700, lineHeight: 1.0  },
      { name: "H3",         size: 28, weight: 700, lineHeight: 1.1  },
      { name: "H4",         size: 20, weight: 600, lineHeight: 1.2  },
      { name: "Body Large", size: 18, weight: 400, lineHeight: 1.65 },
      { name: "Body",       size: 16, weight: 400, lineHeight: 1.7  },
      { name: "Body Small", size: 14, weight: 400, lineHeight: 1.6  },
      { name: "Button",     size: 14, weight: 600, lineHeight: 1    },
      { name: "Caption",    size: 12, weight: 400, lineHeight: 1.5  },
      { name: "Label",      size: 12, weight: 600, lineHeight: 1    },
      { name: "Code",       size: 14, weight: 400, lineHeight: 1.7  },
    ];
    const { colId: typeColId, modeId: typeModeId } = makeCollection("Typography");
    for (const t of typographyScale) {
      addFloatVar(`${t.name}/Size`,        typeColId, typeModeId, t.size);
      addFloatVar(`${t.name}/Weight`,      typeColId, typeModeId, t.weight);
      addFloatVar(`${t.name}/Line Height`, typeColId, typeModeId, t.lineHeight);
    }

    // ── POST to Figma Variables API ───────────────────────────────────────────
    const body = { variableCollections, variableModes, variables, variableValues };

    const figmaRes = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Figma-Token": pat,
      },
      body: JSON.stringify(body),
    });

    if (!figmaRes.ok) {
      const errText = await figmaRes.text();
      return NextResponse.json(
        { error: `Figma API error ${figmaRes.status}: ${errText}` },
        { status: figmaRes.status }
      );
    }

    const result = await figmaRes.json();

    return NextResponse.json({
      ok: true,
      fileUrl: `https://www.figma.com/file/${fileKey}`,
      variableCount: variables.length,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
