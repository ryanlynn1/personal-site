# CLAUDE.md - Project Context for ryanlynn.ai

## Project Overview

A **minimal, content-first personal site** for Ryan Lynn at ryanlynn.ai, modeled on
[drew.tech](https://drew.tech). The purpose is publishing: blog posts now, a newsletter later.
The design is clean and typographic with a light/dark theme, plus a "Work" history rail on the
home page.

**Core experience:**
- Home: hero (name + tagline), a "Latest" featured post, a short list of recent posts, and a
  sticky **Work rail** (job/education history) on the right.
- Posts archive (`/posts`): every post grouped by year.
- Post detail (`/posts/[slug]`): clean reading layout (prose).
- Newsletter (`/newsletter`): a "Coming soon" page (no signup form yet, by design).
- **Light/dark mode:** follows the visitor's system preference by default, with a manual toggle
  (persisted in `localStorage`, no flash on load).

**Tone:** Considered, understated, "founder who writes." Not flashy.

> History: earlier this repo was a retro "RyanOS" desktop UI. That was fully replaced. The old
> version remains in git history if ever needed.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Astro** | Static site framework (ships ~zero JS) |
| **Astro Content Collections** | Blog posts as Markdown files with typed frontmatter |
| **Vanilla CSS** | Custom-property design tokens, no preprocessors/frameworks |
| **Tiny inline JS** | Only the theme toggle |

---

## Project Structure

```
personal-site/
├── public/
│   ├── rl-headshot.jpeg          # author avatar (post bylines)
│   ├── rl-headshot-avatar.png    # favicon (the headshot)
│   ├── blog/                     # inline images referenced by posts
│   └── logos/                    # Work-rail logos (intelligentnoise-black.svg, michigan.png)
├── src/
│   ├── content/blog/*.md         # ← blog posts live here (one Markdown file per post)
│   ├── content.config.ts         # blog collection schema (Zod)
│   ├── data/
│   │   ├── site.ts               # name, tagline, hero copy, nav, social links, SEO
│   │   └── work.ts               # Work-rail entries (supports nested children)
│   ├── lib/categories.ts         # category labels + date formatting
│   ├── layouts/Layout.astro      # base HTML, <head>/SEO, theme no-flash script
│   ├── components/
│   │   ├── Header.astro          # brand + nav + ThemeToggle
│   │   ├── ThemeToggle.astro     # sun/moon button, system-default aware
│   │   ├── Footer.astro
│   │   ├── WorkRail.astro        # the "Work" card (nested entries supported)
│   │   └── PostRow.astro         # a post list item (meta + title + excerpt)
│   ├── pages/
│   │   ├── index.astro           # home
│   │   ├── posts/index.astro     # archive by year
│   │   ├── posts/[slug].astro    # post detail + prose styles
│   │   ├── newsletter.astro      # coming soon
│   │   └── 404.astro
│   └── styles/global.css         # reset + design tokens (light/dark) + primitives
├── astro.config.mjs
└── package.json
```

---

## Common Edits

### Add / edit a blog post
Create `src/content/blog/<slug>.md`. The filename is the URL slug (`/posts/<slug>`). Frontmatter:

```yaml
---
title: "Post title"
excerpt: "1–2 sentence summary shown in lists."
category: "implementation"   # ai-strategy | implementation | industry-insights | case-analysis | leadership | news
tags: ["a", "b"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-05-09"     # controls ordering; future dates still render (static build)
featured: true
readTimeMinutes: 12
metaTitle: "…"                # optional
metaDescription: "…"          # optional
---
Markdown body… (GFM: headings, blockquotes, tables, images from /blog/…)
```

Cross-links between posts should use `/posts/<slug>`.

### Change hero / header / nav / social
Edit `src/data/site.ts`.

### Update the Work rail
Edit `src/data/work.ts`. Each entry: `company`, `role`, `start`, `end`, plus optional
`logo` (path in /public), `monogram` + `monogramBg` (brand-colored fallback tile), `note`
(small accent line, e.g. "Zell Entrepreneur"), and `children` (nested, de-emphasized sub-roles
rendered in italic gray — used for ZLCF under the MBA).

### Colors / typography
Edit the design tokens at the top of `src/styles/global.css` (`:root` for light,
`:root[data-theme='dark']` + the `prefers-color-scheme` block for dark). Accent is the
IntelligentNoise green.

---

## Commands

```bash
npm run dev      # dev server (localhost:4321)
npm run build    # production build → dist/
npm run preview  # preview the built site
```

---

## Notes / To Do

- **Work-rail logos:** all real marks live in `public/logos/` — `intelligentnoise-black.svg`,
  `michigan.png`, `ssc-intralinks.png` (blue SS&C wordmark), `grant-thornton.png` (purple swirl).
  To change one, drop a new file in `public/logos/` and point `src/data/work.ts` at it. (The
  `monogram` + `monogramBg` fields still exist as a colored-tile fallback if a logo is missing.)
- **Newsletter:** intentionally a "Coming soon" page with no signup form. Wire a provider later.
- **Deploy:** static `dist/` — host on Vercel/Netlify/Cloudflare Pages; configure the ryanlynn.ai
  domain.
```
