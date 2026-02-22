"use client";

import { useEffect, useState } from "react";

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export function TableOfContents() {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Extract headings from the article
        const article = document.querySelector("article");
        if (!article) return;

        const elements = article.querySelectorAll("h1");
        const items: TOCItem[] = Array.from(elements).map((el) => ({
            id: el.id,
            text: el.textContent || "",
            level: parseInt(el.tagName[1]),
        }));
        setHeadings(items);

        // Set up intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" },
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <nav className="hidden xl:block">
            <div className="sticky top-8">
                <h2 className="text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
                    On this page
                </h2>
                <ul className="space-y-2 text-sm">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            style={{
                                paddingLeft: `${(heading.level - 1) * 12}px`,
                            }}
                        >
                            <a
                                href={`#${heading.id}`}
                                className={`block py-1 transition-colors ${
                                    activeId === heading.id
                                        ? "text-neutral-900 dark:text-neutral-100 font-medium"
                                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                                }`}
                            >
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
