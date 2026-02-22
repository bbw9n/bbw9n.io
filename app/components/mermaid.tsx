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
    },
});

export function Mermaid({ chart }: { chart: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");

    useEffect(() => {
        const renderChart = async () => {
            if (containerRef.current) {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                try {
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                }
            }
        };
        renderChart();
    }, [chart]);

    return (
        <div
            ref={containerRef}
            className="my-6 overflow-x-auto rounded-lg bg-neutral-100 p-4"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
