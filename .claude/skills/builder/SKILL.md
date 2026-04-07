---
name: builder
description: "Research the technical details of a given URL/idea and implement an MVP for it in the playground page. Use when the user wants to quickly prototype an idea as a working playground feature."
---

# Builder

Research a URL or idea, then implement a working MVP in the playground page.

## Arguments

The user provides a description after `/builder`. It typically includes:
- A GitHub repo URL, blog post, or product URL to research
- A brief description of what they want the playground to do

Example: `/builder use https://github.com/some/repo - I want playground to show X, Y, Z`

## Instructions

### Step 1: Research the argument

1. If the argument contains a URL:
   - Use `WebFetch` to read the URL (GitHub README, docs page, blog post, etc.)
   - If it's a GitHub repo, also fetch key files like `README.md`, the main entry point, and any API/SDK docs to understand how it works technically
   - Extract: what the project does, core technical concepts, key features, architecture patterns
2. If the argument is just a text idea:
   - Use `WebSearch` to find relevant technical references, libraries, and approaches
3. Summarize your research findings to the user in 3-5 bullet points before proceeding

### Step 2: Design the MVP

Based on the research and the user's description, design a minimal but functional playground MVP:

1. Identify the **core interaction** the user wants (what does the user do? what does the playground show?)
2. Determine what can be implemented **client-side only** vs what needs an **API route**
3. Plan the UI layout based on the user's description (panels, views, controls, etc.)
4. Choose the simplest approach:
   - Prefer browser-native APIs (Canvas, WebRTC, Web Audio, etc.) when possible
   - Use mock data or simulated behavior for features that would require complex backends
   - For AI/ML features: use the existing LLM API (`/api/playground/query`) as the backend, or create a new lightweight API route if needed
   - Keep external dependencies minimal - prefer what's already in the project

Present the MVP plan to the user as a short bullet list and ask for confirmation before implementing.

### Step 3: Read current playground files

Read these files to understand the current state:
- `web/src/app/playground/page.tsx` - the main playground page
- `web/src/app/playground/layout.tsx` - the layout/metadata
- `web/src/app/api/playground/query/route.ts` - the existing API route
- `web/src/lib/config.ts` - site config

### Step 4: Implement the MVP

Implement the MVP by modifying the playground page. Follow these rules:

#### UI Rules
- Keep the existing page structure: `Header` at top, `Footer` at bottom, content in `<main>`
- Keep the existing auth gate (Clerk sign-in requirement) and credits system
- Use the existing design system: `border-border`, `bg-accent/50`, `text-muted-foreground`, `rounded-xl`, etc.
- Use Tailwind CSS only - no external UI libraries
- Make it responsive (mobile-friendly)

#### Code Rules
- Keep it in `web/src/app/playground/page.tsx` as a single "use client" component unless complexity truly demands extraction
- If you need new components, put them in `web/src/components/playground/` directory
- If you need a new API route, put it under `web/src/app/api/playground/`
- Preserve the existing credit deduction flow for any AI-powered features
- Use TypeScript with proper types
- Use React hooks for state management (no external state libraries)

#### What to simulate vs implement
- **Simulate**: Hardware access (cameras, microphones), ML model inference, real-time video processing, heavy compute
- **Implement for real**: UI layouts, interactive controls, API calls to the existing LLM, form handling, state management
- For simulated features: use placeholder visuals (colored divs, canvas drawings, sample images/videos) with realistic UI controls that show state changes
- Always make it clear in the UI when something is simulated vs real (e.g., a small "Simulated" badge)

### Step 5: Update layout metadata

Update `web/src/app/playground/layout.tsx` metadata to reflect the new playground feature:
- Update `title`, `description`, and `keywords` to match the new MVP

### Step 6: Verify

1. Run `cd web && npx tsc --noEmit` to check for type errors
2. Fix any errors
3. Show the user a summary of what was built and how to use it

## Important

- NEVER add new route paths to the app (respect CLAUDE.md router restrictions)
- NEVER install new npm packages without asking the user first
- Keep the MVP scope small - it should be buildable in one session
- If the idea is too complex for a single playground page, propose the simplest useful slice and explain what was scoped out
- The playground page replaces its current content with the new MVP - the old "AI Definition Lookup" is replaced
