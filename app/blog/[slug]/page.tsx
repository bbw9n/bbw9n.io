import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { baseUrl } from "app/sitemap";
import { TableOfContents } from "app/components/toc";

export async function generateStaticParams() {
    let posts = getBlogPosts();

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    let { slug } = await params;
    let post = getBlogPosts().find((post) => post.slug === slug);
    if (!post) {
        return;
    }

    let {
        title,
        publishedAt: publishedTime,
        summary: description,
        image,
    } = post.metadata;
    let ogImage = image
        ? image
        : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime,
            url: `${baseUrl}/blog/${post.slug}`,
            images: [
                {
                    url: ogImage,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };
}

export default async function Blog({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    let { slug } = await params;
    let post = getBlogPosts().find((post) => post.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <section className="relative">
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.metadata.title,
                        datePublished: post.metadata.publishedAt,
                        dateModified: post.metadata.publishedAt,
                        description: post.metadata.summary,
                        image: post.metadata.image
                            ? `${baseUrl}${post.metadata.image}`
                            : `/og?title=${encodeURIComponent(post.metadata.title)}`,
                        url: `${baseUrl}/blog/${post.slug}`,
                        author: {
                            "@type": "Person",
                            name: "bbw9n.io",
                        },
                    }),
                }}
            />
            {/* Left sidebar TOC - fixed position relative to viewport */}
            <aside className="hidden xl:block fixed left-[max(1rem,calc(50%-24rem-16rem))] top-24 w-52 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <TableOfContents />
            </aside>
            {/* Main content */}
            <h1 className="title font-semibold text-2xl tracking-tighter">
                {post.metadata.title}
            </h1>
            <div className="flex justify-between items-center mt-2 mb-8 text-sm">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(post.metadata.publishedAt)}
                </p>
            </div>
            <article className="prose">
                <CustomMDX source={post.content} />
            </article>
        </section>
    );
}
