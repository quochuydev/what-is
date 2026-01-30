---
name: audit-seo
description: Use when auditing SEO for a Next.js website - checks technical SEO, metadata, content quality, structured data, llms.txt/llms-full.txt, and generates a comprehensive report
---

# SEO Audit

Audit SEO for Next.js App Router projects. Output report to `docs/SEO-AUDIT-REPORT-{YYMMDD}.md`.

## Audit Checklist

### 1. Technical SEO

| Item | Check | Good | Bad |
|------|-------|------|-----|
| Build | `npm run build` | No errors | Fails |
| Sitemap | `src/app/sitemap.ts` or `public/sitemap.xml` | Exists | Missing |
| robots.txt | `public/robots.txt` | Configured | Missing |
| URLs | Route structure | Kebab-case | Query params |
| 404 | `src/app/not-found.tsx` | Custom | Default |
| Canonical | Page metadata | Set | Missing |

### 2. On-Page SEO

| Item | Check | Good | Bad |
|------|-------|------|-----|
| Titles | `metadata.title` | Unique, 50-60 chars | Generic |
| Descriptions | `metadata.description` | Unique, 150-160 chars | Missing |
| Keywords | `metadata.keywords` | Targeted | Missing |
| H1 | Page content | One per page | Multiple |
| Headings | H1 > H2 > H3 | Proper nesting | Skipped |
| Open Graph | `metadata.openGraph` | Complete | Missing |
| Twitter | `metadata.twitter` | Card + title | Missing |

### 3. Content Quality

| Item | Check | Good | Bad |
|------|-------|------|-----|
| Word count | Main pages | 500+ words | <200 |
| Internal links | `<Link>` usage | Contextual | None |
| Alt text | `<Image>` tags | Descriptive | Missing |

### 4. Performance

| Item | Check | Good | Bad |
|------|-------|------|-----|
| Images | `next/image` usage | Optimized | Raw `<img>` |
| Client components | `'use client'` | Minimal | Excessive |

### 5. Structured Data

| Item | Check | Good | Bad |
|------|-------|------|-----|
| JSON-LD | `application/ld+json` | Present | Missing |
| Organization | Root layout | Defined | Missing |
| Article | Blog posts | On posts | Missing |
| Breadcrumbs | Nav pages | Present | Missing |
| OG image | `public/og-image.png` | 1200x630 | Missing |

### 6. LLM Content (AI Discoverability)

| Item | Check | Good | Bad |
|------|-------|------|-----|
| llms.txt | `src/app/llms.txt/route.ts` | Exists + accessible | Missing |
| llms-full.txt | `src/app/llms-full.txt/route.ts` | Exists + accessible | Missing |
| llms.txt content | Response body | Site name, description, docs links | Empty/generic |
| llms-full.txt content | Response body | Comprehensive docs, API info | Brief/outdated |
| robots.txt LLM rules | `public/robots.txt` | Allows LLM bots | Blocks or missing |
| Cross-reference | llms.txt links | Points to llms-full.txt | Missing link |

## Scoring

| Range | Status |
|-------|--------|
| 90-100 | Excellent |
| 80-89 | Good |
| 70-79 | Fair |
| 60-69 | Poor |
| <60 | Critical |

**Deductions:** Critical item missing: -10, Important: -5, Nice-to-have: -2

## Report Template

```markdown
# SEO Audit Report - {PROJECT}
**Date:** {DATE}
**Domain:** {DOMAIN}

## Score: {SCORE}/100

| Category | Score | Status |
|----------|-------|--------|
| Technical | /100 | |
| On-Page | /100 | |
| Content | /100 | |
| Performance | /100 | |
| Structured Data | /100 | |
| LLM Content | /100 | |

## Issues Found
### Critical
### High Priority
### Medium Priority

## Quick Wins
- [ ] ...
```

## Execution

1. `npm run build` - check build status
2. Check `public/` for sitemap, robots.txt
3. Grep `metadata` in layout/page files
4. Search `application/ld+json` for structured data
5. Check `next/image` usage
6. Check `src/app/llms.txt/route.ts` exists
7. Check `src/app/llms-full.txt/route.ts` exists
8. Verify robots.txt includes LLM bot rules (GPTBot, Claude-Web, Anthropic-AI)
9. If dev server running, fetch `/llms.txt` and `/llms-full.txt` to validate content
10. Calculate scores
11. Write report to `docs/SEO-AUDIT-REPORT-{YYMMDD}.md`
