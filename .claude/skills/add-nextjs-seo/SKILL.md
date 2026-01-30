---
name: add-nextjs-seo
description: Use when implementing SEO for a Next.js app - covers metadata, sitemap, robots.txt, structured data, Open Graph, llms.txt/llms-full.txt, and technical SEO setup
---

# Add Next.js SEO

Implement SEO for Next.js App Router. Use placeholders: `{DOMAIN}`, `{SITE_NAME}`, `{DESCRIPTION}`.

## Checklist

Track with TodoWrite:

- [ ] Root layout metadata
- [ ] Page-specific metadata (layout.tsx per route)
- [ ] Dynamic sitemap.ts
- [ ] robots.txt
- [ ] Structured data (JSON-LD)
- [ ] Custom 404 page
- [ ] OG image (1200x630px)
- [ ] llms.txt and llms-full.txt (LLM-friendly content)

## 1. Root Layout Metadata

`src/app/layout.tsx` - export `metadata: Metadata`:

```tsx
title: { default: "{SITE_NAME}", template: "%s | {SITE_NAME}" }
description: "{DESCRIPTION}"  // 150-160 chars
keywords: [...]
metadataBase: new URL("https://{DOMAIN}")
openGraph: { type, locale, url, title, description, siteName, images }
twitter: { card: "summary_large_image", title, description, images }
robots: { index: true, follow: true, googleBot: {...} }
verification: { google: "..." }
```

## 2. Page Metadata

Create `layout.tsx` in each route with unique `metadata`:

```tsx
// src/app/{route}/layout.tsx
export const metadata: Metadata = {
  title: "Page Title",  // Uses template: "Page Title | {SITE_NAME}"
  description: "Unique page description",
  keywords: [...],
  openGraph: { title, description, url: "https://{DOMAIN}/{route}" },
  twitter: { card, title, description }
};
```

## 3. Sitemap

`src/app/sitemap.ts`:

```tsx
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://{DOMAIN}';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/{route}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    // Add all routes...
  ];
}
```

## 4. robots.txt

`public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://{DOMAIN}/sitemap.xml
```

## 5. Structured Data

Add JSON-LD scripts to layouts:

**Organization** (root layout):
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "{SITE_NAME}",
  url: "https://{DOMAIN}"
}) }} />
```

**Article** (blog posts):
```tsx
{ "@type": "Article", headline, description, author, datePublished, dateModified }
```

**BreadcrumbList** (navigation):
```tsx
{ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position, name, item }] }
```

## 6. 404 Page

`src/app/not-found.tsx` - custom design with link to home.

## 7. OG Image

`public/og-image.png` - 1200x630px. Reference in metadata:

```tsx
images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "{SITE_NAME}" }]
```

## 8. LLMs.txt (AI-Friendly Content)

Create route handlers for LLM-optimized content discovery.

**`src/app/llms.txt/route.ts`** - Brief overview:

```tsx
export async function GET() {
  const content = `# {SITE_NAME}

> {DESCRIPTION}

## Overview

{SITE_NAME} provides [brief product/service description].

## Documentation

- [Getting Started](https://{DOMAIN}/docs/getting-started)
- [API Reference](https://{DOMAIN}/docs/api)
- [Examples](https://{DOMAIN}/docs/examples)

## Links

- Website: https://{DOMAIN}
- Documentation: https://{DOMAIN}/docs
- Full LLM context: https://{DOMAIN}/llms-full.txt
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

**`src/app/llms-full.txt/route.ts`** - Comprehensive content:

```tsx
export async function GET() {
  // Option 1: Static content
  const content = `# {SITE_NAME} - Complete Documentation

> {DESCRIPTION}

## Table of Contents

1. Overview
2. Getting Started
3. Core Features
4. API Reference
5. Examples

## 1. Overview

[Detailed overview of the product/service]

## 2. Getting Started

[Step-by-step setup instructions]

## 3. Core Features

### Feature A
[Description and usage]

### Feature B
[Description and usage]

## 4. API Reference

### Endpoints
[API documentation]

## 5. Examples

[Code examples and use cases]
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

**Dynamic content from docs** (if using fumadocs/MDX):

```tsx
import { getPages } from '@/lib/source';

export async function GET() {
  const pages = getPages();

  let content = `# {SITE_NAME} - Full Documentation\n\n`;

  for (const page of pages) {
    content += `## ${page.data.title}\n\n`;
    content += `${page.data.description || ''}\n\n`;
    // Add page content if available
  }

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

**Update robots.txt** to include llms.txt:

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://{DOMAIN}/sitemap.xml

# LLM Content
User-agent: GPTBot
User-agent: Claude-Web
User-agent: Anthropic-AI
Allow: /llms.txt
Allow: /llms-full.txt
```

## Quick Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root metadata + Organization JSON-LD |
| `src/app/{route}/layout.tsx` | Page-specific metadata |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `public/robots.txt` | Crawler rules |
| `src/app/not-found.tsx` | Custom 404 |
| `public/og-image.png` | Social sharing image |
| `src/app/llms.txt/route.ts` | LLM-friendly site overview |
| `src/app/llms-full.txt/route.ts` | Complete LLM documentation |

## Common Mistakes

| Issue | Fix |
|-------|-----|
| Generic title | Unique, keyword-rich, 50-60 chars |
| No metadataBase | Add `metadataBase: new URL(...)` |
| Duplicate descriptions | Each page unique |
| No title template | Add `template: "%s | Site"` |
| llms.txt too brief | Include key features, docs links, and API overview |
| llms-full.txt outdated | Generate dynamically from docs source |

## After Implementation

Run `/audit-seo` to verify and score.
