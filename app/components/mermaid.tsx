"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: "inherit",
    themeVariables: {
        primaryColor: "#e0e0e0",
        primaryTextColor: "#1a1a1a",
        primaryBorderColor: "#333333",
        lineColor: "#333333",
        secondaryColor: "#f5f5f5",
        tertiaryColor: "#fafafa",
        textColor: "#1a1a1a",
        mainBkg: "#ffffff",
        nodeBorder: "#333333",
        clusterBkg: "#f0f0f0",
        titleColor: "#1a1a1a",
        actorLineColor: "#333333",
        signalColor: "#333333",
        signalTextColor: "#1a1a1a",
        labelTextColor: "#1a1a1a",
        loopTextColor: "#1a1a1a",
        noteBkgColor: "#f5f5f5",
        noteTextColor: "#1a1a1a",
        noteBorderColor: "#333333",
        activationBorderColor: "#333333",
        sequenceNumberColor: "#ffffff",
        // Mindmap palette: calm light-gray branch nodes with a clean
        // white root. Branch fills come from cScale*, branch text from
        // cScaleLabel*, while the root uses git0 / gitBranchLabel0.
        git0: "#ffffff",
        gitBranchLabel0: "#333333",
        cScale0: "#e8e8e8",
        cScale1: "#e8e8e8",
        cScale2: "#e8e8e8",
        cScale3: "#e8e8e8",
        cScale4: "#e8e8e8",
        cScale5: "#e8e8e8",
        cScale6: "#e8e8e8",
        cScale7: "#e8e8e8",
        cScale8: "#e8e8e8",
        cScale9: "#e8e8e8",
        cScale10: "#e8e8e8",
        cScale11: "#e8e8e8",
        cScaleLabel0: "#555555",
        cScaleLabel1: "#555555",
        cScaleLabel2: "#555555",
        cScaleLabel3: "#555555",
        cScaleLabel4: "#555555",
        cScaleLabel5: "#555555",
        cScaleLabel6: "#555555",
        cScaleLabel7: "#555555",
        cScaleLabel8: "#555555",
        cScaleLabel9: "#555555",
        cScaleLabel10: "#555555",
        cScaleLabel11: "#555555",
    },
});

// mermaid-to-excalidraw only handles flowchart / sequence / class diagrams.
// Everything else (e.g. mindmap) falls back to plain mermaid rendering.
function isExcalidrawSupported(chart: string): boolean {
    const first = chart.trim().split("\n")[0]?.trim().toLowerCase() ?? "";
    return (
        first.startsWith("flowchart") ||
        first.startsWith("graph") ||
        first.startsWith("sequencediagram") ||
        first.startsWith("classdiagram")
    );
}

// Excalidraw resolves its fonts (and a font-subsetting web worker) relative to
// this asset path. Under the bundler the worker URL resolves to a blocked
// file:// path, so point fonts at the CDN and skip font inlining (which is what
// spawns the worker) when exporting below.
const EXCALIDRAW_VERSION = "0.18.1";
function ensureExcalidrawAssetPath() {
    const w = window as unknown as { EXCALIDRAW_ASSET_PATH?: string };
    if (!w.EXCALIDRAW_ASSET_PATH) {
        w.EXCALIDRAW_ASSET_PATH = `https://unpkg.com/@excalidraw/excalidraw@${EXCALIDRAW_VERSION}/dist/prod/`;
    }
}

// Optional per-diagram size hint written as a leading mermaid comment, e.g.
//   %% maxw: 420 %%
// Caps that single diagram's width (in px) without affecting the others.
function extractSizeHint(chart: string): { chart: string; maxWidth: number | null } {
    const match = chart.match(/%%\s*maxw(?:idth)?\s*:\s*(\d+)\s*%%/i);
    if (!match) return { chart, maxWidth: null };
    const cleaned = chart.replace(match[0], "").replace(/^\s*\n/, "");
    return { chart: cleaned, maxWidth: parseInt(match[1], 10) };
}

// Render a flowchart in the hand-drawn Excalidraw style by converting the
// mermaid definition into Excalidraw elements and exporting them to SVG.
async function renderExcalidrawSvg(
    chart: string,
    maxWidth: number | null,
): Promise<string> {
    ensureExcalidrawAssetPath();

    const [{ parseMermaidToExcalidraw }, { convertToExcalidrawElements, exportToSvg }] =
        await Promise.all([
            import("@excalidraw/mermaid-to-excalidraw"),
            import("@excalidraw/excalidraw"),
        ]);

    const { elements, files } = await parseMermaidToExcalidraw(chart, {
        themeVariables: { fontSize: "16px" },
    });
    const excalidrawElements = convertToExcalidrawElements(elements);
    const svgEl = await exportToSvg({
        elements: excalidrawElements,
        files: files ?? null,
        exportPadding: 16,
        // Skip font inlining: it spawns a font-subsetting web worker whose
        // bundled URL can't be loaded cross-origin. The hand-drawn font is
        // loaded onto the page from the CDN asset path instead.
        skipInliningFonts: true,
        appState: {
            exportBackground: false,
            exportWithDarkMode: false,
        },
    });

    // Stretch to fill the container by default; if a size hint was given, cap
    // this one diagram's width instead (centered).
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    const widthRule = maxWidth ? `max-width:${maxWidth}px` : "max-width:100%";
    svgEl.setAttribute(
        "style",
        `${widthRule};height:auto;display:block;margin:0 auto;`,
    );
    return svgEl.outerHTML;
}

export function Mermaid({ chart }: { chart: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");

    useEffect(() => {
        let cancelled = false;

        const renderChart = async () => {
            const { chart: cleaned, maxWidth } = extractSizeHint(chart);

            // Prefer the hand-drawn Excalidraw style for supported diagrams,
            // but fall back to plain mermaid on anything unsupported or on error.
            if (isExcalidrawSupported(cleaned)) {
                try {
                    const result = await renderExcalidrawSvg(cleaned, maxWidth);
                    if (!cancelled) setSvg(result);
                    return;
                } catch (error) {
                    console.error(
                        "Excalidraw rendering failed, falling back to mermaid:",
                        error,
                    );
                }
            }

            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            try {
                const { svg } = await mermaid.render(id, cleaned);
                if (!cancelled) setSvg(svg);
            } catch (error) {
                console.error("Mermaid rendering error:", error);
            }
        };

        renderChart();
        return () => {
            cancelled = true;
        };
    }, [chart]);

    return (
        <div
            ref={containerRef}
            className="my-6 flex justify-center overflow-x-auto rounded-lg bg-neutral-100 p-4"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
