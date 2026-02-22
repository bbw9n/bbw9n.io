import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./mermaid";

function Table({ data }) {
    let headers = data.headers.map((header, index) => (
        <th key={index}>{header}</th>
    ));
    let rows = data.rows.map((row, index) => (
        <tr key={index}>
            {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
            ))}
        </tr>
    ));

    return (
        <table>
            <thead>
                <tr>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function CustomLink(props) {
    let href = props.href;

    if (href.startsWith("/")) {
        return (
            <Link href={href} {...props}>
                {props.children}
            </Link>
        );
    }

    if (href.startsWith("#")) {
        return <a {...props} />;
    }

    return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
    return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

function Code({ children, className, ...props }) {
    // For mermaid blocks, don't apply syntax highlighting - just pass through
    if (className?.includes("language-mermaid")) {
        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }
    let codeHTML = highlight(children);
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function Pre({
    children,
    ...props
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    // For code blocks, MDX passes a single code element as children
    // We need to check if it's a mermaid block and render it specially
    try {
        const child = React.Children.only(children) as React.ReactElement<{
            className?: string;
            children?: string;
        }>;

        if (child?.props?.className?.includes("language-mermaid")) {
            const code = child.props.children;
            if (typeof code === "string") {
                return <Mermaid chart={code.trim()} />;
            }
        }
    } catch {
        // If Children.only throws, just render normally
    }

    return <pre {...props}>{children}</pre>;
}

function slugify(str) {
    return str
        .toString()
        .toLowerCase()
        .trim() // Remove whitespace from both ends of a string
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level) {
    const Heading = ({ children }) => {
        let slug = slugify(children);
        return React.createElement(
            `h${level}`,
            { id: slug },
            [
                React.createElement("a", {
                    href: `#${slug}`,
                    key: `link-${slug}`,
                    className: "anchor",
                }),
            ],
            children,
        );
    };

    Heading.displayName = `Heading${level}`;

    return Heading;
}

let components = {
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    Image: RoundedImage,
    a: CustomLink,
    code: Code,
    pre: Pre,
    Table,
};

export function CustomMDX(props) {
    return (
        <MDXRemote
            {...props}
            components={{ ...components, ...(props.components || {}) }}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
    );
}
