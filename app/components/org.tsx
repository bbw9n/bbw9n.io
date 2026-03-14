import { unified } from "unified";
import uniorgParse from "uniorg-parse";
import uniorg2rehype from "uniorg-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import { Mermaid } from "./mermaid";
import React from "react";

// Rehype plugin: convert div.example to pre (preserves whitespace for ASCII art)
function rehypeOrgExample() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element) => {
            if (
                node.tagName === "div" &&
                Array.isArray(node.properties?.className) &&
                (node.properties.className as string[]).includes("example")
            ) {
                node.tagName = "pre";
            }
        });
    };
}

// Rehype plugin: extract mermaid blocks into placeholder divs
// and skip shiki highlighting for them
function rehypeExtractMermaid() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element) => {
            if (node.tagName !== "pre") return;
            const code = node.children.find(
                (c): c is Element =>
                    c.type === "element" && c.tagName === "code",
            );
            if (!code) return;
            const classes = (code.properties?.className as string[]) || [];
            if (!classes.some((c) => c === "language-mermaid")) return;

            // Extract text content from code element
            const text = code.children
                .filter((c) => c.type === "text")
                .map((c) => (c as { value: string }).value)
                .join("");

            // Replace with a placeholder div
            node.tagName = "div";
            node.properties = {
                className: ["mermaid-placeholder"],
                "data-chart": text.trim(),
            };
            node.children = [];
        });
    };
}

const processor = unified()
    .use(uniorgParse)
    .use(uniorg2rehype)
    .use(rehypeOrgExample)
    .use(rehypeExtractMermaid)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
        behavior: "prepend",
        properties: { className: ["anchor"] },
    })
    .use(rehypeShiki, {
        themes: {
            light: "github-light",
            dark: "github-dark",
        },
    })
    .use(rehypeStringify);

export async function CustomOrg({ source }: { source: string }) {
    const result = String(await processor.process(source));

    // Split HTML on mermaid placeholders to interleave React Mermaid components
    const parts = result.split(
        /<div class="mermaid-placeholder" data-chart="([^"]*)"><\/div>/,
    );

    if (parts.length === 1) {
        // No mermaid blocks
        return (
            <div
                className="org-content"
                dangerouslySetInnerHTML={{ __html: result }}
            />
        );
    }

    // parts alternate: [html, chartData, html, chartData, ...]
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            // HTML segment
            if (parts[i]) {
                elements.push(
                    <div
                        key={`html-${i}`}
                        className="org-content"
                        dangerouslySetInnerHTML={{ __html: parts[i] }}
                    />,
                );
            }
        } else {
            // Mermaid chart data (HTML-entity encoded in data attribute)
            const chart = parts[i]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            elements.push(<Mermaid key={`mermaid-${i}`} chart={chart} />);
        }
    }

    return <>{elements}</>;
}
