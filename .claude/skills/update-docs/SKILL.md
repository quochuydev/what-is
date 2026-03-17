---
name: update-docs
description: Update all branding, descriptions, and content across the codebase to match the current config in web/src/lib/config.ts. Use after changing site name, tagline, or description.
---

# Update Docs

Propagate branding from `web/src/lib/config.ts` to all content across the codebase.

## Instructions

### Step 1: Read the source of truth

Read `web/src/lib/config.ts` and extract:
- `site.name` — the product name
- `site.tagline` — the short tagline
- `site.description` — the one-line description
- `site.github` — GitHub URL
- `site.email` — contact email
- `app.url` — the production domain

Ask the user: **"What does your service do in one sentence?"** Use their answer as context for rewriting descriptions. If the user has already updated `config.ts` with the new values, use those directly.

### Step 2: Update all locations

Update every file below, replacing old branding with new values. For each file, read it first, then edit. Use `config.site.*` references where the file already imports config. Use literal text where the file has hardcoded strings.

#### Config-aware files (already import config — update hardcoded fragments only)

| # | File | What to update |
|---|---|---|
| 1 | `web/src/app/layout.tsx` | Lines with `"definitions at your fingertips"`, keywords array, JSON-LD `description` string |
| 2 | `web/src/app/playground/layout.tsx` | Hardcoded description: `"Look up definitions..."`, keywords |
| 3 | `web/src/app/pricing/layout.tsx` | Description mentioning the product |
| 4 | `web/src/app/blog/layout.tsx` | `"AI-powered definitions and integration guides"` |
| 5 | `web/src/app/docs/layout.tsx` | `"AI-powered definition lookups"` |
| 6 | `web/src/app/cloud/layout.tsx` | `"AI definition APIs"` |
| 7 | `web/src/app/terms/layout.tsx` | Description |
| 8 | `web/src/app/privacy/layout.tsx` | Description |
| 9 | `web/src/app/about-us/layout.tsx` | Description |
| 10 | `web/src/app/station/layout.tsx` | Description |

#### Pages with hardcoded content

| # | File | What to update |
|---|---|---|
| 11 | `web/src/app/page.tsx` | Hero heading, hero subheading, feature card titles and descriptions, stats |
| 12 | `web/src/app/playground/page.tsx` | "AI Definition Lookup" heading, "Enter any keyword..." text, feature descriptions |
| 13 | `web/src/app/pricing/page.tsx` | Heading, subheading, "1 credit = 1 definition lookup" |
| 14 | `web/src/app/cloud/page.tsx` | Page heading and any description text |
| 15 | `web/src/app/terms/page.tsx` | All references to "what-is" service name and "AI-powered definition lookup" descriptions |
| 16 | `web/src/app/about-us/page.tsx` | Any service description text (may be placeholder) |
| 17 | `web/src/app/blog/page.tsx` | Blog post titles referencing the service |
| 18 | `web/src/app/blog/[slug]/page.tsx` | Hardcoded blog post content describing the service |

#### OG Image

| # | File | What to update |
|---|---|---|
| 19 | `web/src/app/opengraph-image.tsx` | Alt text (already uses config — verify it matches) |

#### LLM discovery files

| # | File | What to update |
|---|---|---|
| 20 | `web/src/app/llms.txt/route.ts` | Full service description, features list, page descriptions, keywords |
| 21 | `web/src/app/llms-full.txt/route.ts` | Same as llms.txt |

#### Documentation (MDX)

| # | File | What to update |
|---|---|---|
| 22 | `web/content/docs/index.mdx` | Title, description, feature list |
| 23 | `web/content/docs/getting-started.mdx` | Description, any service-specific instructions |
| 24 | `web/content/docs/faq.mdx` | "What is [service]?" answer and all Q&As |
| 25 | `web/content/docs/cloud/api-keys.mdx` | Service-specific API descriptions |
| 26 | `web/content/docs/cloud/pricing.mdx` | "1 credit = 1 [action]" and pricing descriptions |
| 27 | `web/content/docs/samples/video-introduction.mdx` | "Learn [service]" text |

#### Project root

| # | File | What to update |
|---|---|---|
| 28 | `README.md` | Project description, any "AI-powered definition" references |
| 29 | `CLAUDE.md` | Domain, description of what the service does |

### Step 3: Rewrite guidelines

When rewriting content:
- **Replace service-specific terms** ("definition lookup", "definitions", "define", "keyword") with the new service's equivalent action/object
- **Keep the same tone and structure** — don't rewrite entire pages, just swap the branding
- **Replace Lorem ipsum** placeholder text with real copy based on the user's service description
- **Preserve config references** — if a file uses `config.site.name`, keep that, don't hardcode the name
- **Keep legal structure** in terms/privacy — only update the service description parts, not the legal clauses
- **Update keywords arrays** in metadata to match the new service's domain

### Step 4: Verify

After all edits:
1. Run `cd web && npx tsc --noEmit` to check for type errors
2. Grep for leftover old branding: `grep -r "definition lookup\|AI-powered definition\|what-is" web/src/ web/content/ --include="*.tsx" --include="*.ts" --include="*.mdx" -l`
3. Report any files that still contain old branding and fix them
4. Show the user a summary of all files changed

### Step 5: Summary

Output a table:

```
| File | Status |
|------|--------|
| web/src/app/layout.tsx | Updated |
| ... | ... |
```

And list any files where old branding might intentionally remain (e.g., git history references, comments).
