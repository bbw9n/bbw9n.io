# bbw9n.io

A personal blog built with Next.js, deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Content**: MDX via next-mdx-remote
- **Deployment**: Vercel

## Project Structure

```
app/
├── blog/
│   ├── posts/           # MDX blog post files
│   ├── [slug]/page.tsx  # Dynamic post page
│   ├── page.tsx         # Blog listing
│   └── utils.ts         # Blog utilities (parsing, formatting)
├── about/
│   └── page.tsx         # About page
├── components/
│   ├── nav.tsx          # Navigation bar
│   ├── mdx.tsx          # Custom MDX components
│   ├── posts.tsx        # Blog posts list
│   └── footer.tsx       # Footer
├── og/route.tsx         # Dynamic OG image generation
├── rss/route.ts         # RSS feed endpoint
├── layout.tsx           # Root layout
├── page.tsx             # Home page
├── sitemap.ts           # XML sitemap
└── global.css           # Global styles
```

## How It Works

### Blog Posts

Blog posts are written in MDX format and stored in `app/blog/posts/`. Each post requires YAML frontmatter:

```mdx
---
title: "Post Title"
publishedAt: "2025-01-01"
summary: "A brief description of the post."
---

Your content here...
```

Posts are automatically:
- Parsed and sorted by date (newest first)
- Rendered with syntax highlighting and custom components
- Added to the sitemap and RSS feed

### Key Features

- **Dynamic OG Images**: Generated at `/og?title=` for social sharing
- **RSS Feed**: Available at `/rss`
- **Sitemap**: Auto-generated at `/sitemap.xml`
- **Dark Mode**: Supported via Tailwind CSS

## Development

```bash
pnpm install
pnpm dev
```

## Deployment on Vercel

This site is deployed on Vercel. On every push to the main branch:

1. Vercel automatically builds the Next.js app
2. Static pages are pre-rendered at build time
3. Dynamic routes (blog posts, OG images) are generated on demand
4. The site is deployed to Vercel's edge network

To deploy your own:

1. Push the repo to GitHub
2. Import the project in Vercel
3. Vercel auto-detects Next.js and configures the build
4. Your site is live
