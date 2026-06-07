"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Repeat one color across all 12 mermaid section scales (used by the mindmap
// for branch fills / labels).
function scale(prefix: "cScale" | "cScaleLabel", color: string) {
    return Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => [`${prefix}${i}`, color]),
    );
}

// Mindmap palette: calm light-gray (or dark-gray) branch nodes with a clean
// contrasting root. Branch fills come from cScale*, branch text from
// cScaleLabel*, while the root uses git0 / gitBranchLabel0.
function mermaidThemeVariables(isDark: boolean) {
    if (isDark) {
        return {
            primaryColor: "#2b2b2b",
            primaryTextColor: "#e5e5e5",
            primaryBorderColor: "#555555",
            lineColor: "#666666",
            secondaryColor: "#2b2b2b",
            tertiaryColor: "#222222",
            textColor: "#e5e5e5",
            mainBkg: "#2b2b2b",
            nodeBorder: "#555555",
            git0: "#4a4a4a",
            gitBranchLabel0: "#e5e5e5",
            ...scale("cScale", "#2b2b2b"),
            ...scale("cScaleLabel", "#cfcfcf"),
        };
    }
    return {
        primaryColor: "#e0e0e0",
        primaryTextColor: "#1a1a1a",
        primaryBorderColor: "#333333",
        lineColor: "#333333",
        secondaryColor: "#f5f5f5",
        tertiaryColor: "#fafafa",
        textColor: "#1a1a1a",
        mainBkg: "#ffffff",
        nodeBorder: "#333333",
        git0: "#ffffff",
        gitBranchLabel0: "#333333",
        ...scale("cScale", "#e8e8e8"),
        ...scale("cScaleLabel", "#555555"),
    };
}

function applyMermaidTheme(isDark: boolean) {
    mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        fontFamily: "inherit",
        themeVariables: mermaidThemeVariables(isDark),
    });
}

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
    isDark: boolean,
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
            // In dark mode, invert strokes/text to light so they read on the
            // dark card instead of the default near-black ink.
            exportWithDarkMode: isDark,
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

// Tracks whether the page is currently in dark mode (the `.dark` class on
// <html>), updating live when the theme toggle flips it.
function useIsDark(): boolean {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const el = document.documentElement;
        const update = () => setIsDark(el.classList.contains("dark"));
        update();
        const observer = new MutationObserver(update);
        observer.observe(el, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

export function Mermaid({ chart }: { chart: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const isDark = useIsDark();

    useEffect(() => {
        let cancelled = false;

        const renderChart = async () => {
            const { chart: cleaned, maxWidth } = extractSizeHint(chart);

            // Prefer the hand-drawn Excalidraw style for supported diagrams,
            // but fall back to plain mermaid on anything unsupported or on error.
            if (isExcalidrawSupported(cleaned)) {
                try {
                    const result = await renderExcalidrawSvg(
                        cleaned,
                        maxWidth,
                        isDark,
                    );
                    if (!cancelled) setSvg(result);
                    return;
                } catch (error) {
                    console.error(
                        "Excalidraw rendering failed, falling back to mermaid:",
                        error,
                    );
                }
            }

            applyMermaidTheme(isDark);
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
    }, [chart, isDark]);

    return (
        <div
            ref={containerRef}
            className="my-6 flex justify-center overflow-x-auto rounded-lg bg-neutral-100 p-4 dark:bg-neutral-900"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
