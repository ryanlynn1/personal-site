# CLAUDE.md - Project Context for ryanlynn.ai

## Project Overview

A **retro desktop personal website** for Ryan Lynn at ryanlynn.ai. The site emulates a vintage computer environment (early Macintosh + Windows 95 aesthetic) with modern polish, inspired by PostHog's website design.

**Core experience:**
- "Hello" splash screen on first load (classic Mac tribute)
- Interactive desktop with clickable icons
- Draggable, stackable windows containing content
- Paper texture background with subtle noise

**Tone:** Nostalgic, early-internet, "creative technologist" vibe. Clean and intentional, not gimmicky.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Astro** | Static site framework (ships zero JS by default) |
| **Vanilla JavaScript** | Window manager, splash screen, keyboard nav |
| **CSS** | Custom properties, no preprocessors |

**Why Astro:** Perfect for content-focused sites. Components without runtime overhead. Builds to static HTML that can be hosted anywhere.

---

## Project Structure

```
ryanlynn.ai/
├── public/
│   ├── favicon.svg
│   └── images/icons/        # Custom SVG desktop icons
│       ├── about.svg
│       ├── projects.svg
│       ├── writing.svg
│       ├── contact.svg
│       └── notes.svg
├── src/
│   ├── components/
│   │   ├── SplashScreen.astro   # "Hello" intro with SVG Mac
│   │   ├── MenuBar.astro        # Top bar with clock
│   │   ├── Desktop.astro        # Main container + texture
│   │   ├── DesktopIcon.astro    # Clickable icon component
│   │   ├── Window.astro         # Draggable window shell
│   │   └── Button.astro         # Win95-style beveled button
│   ├── layouts/
│   │   └── Layout.astro         # Base HTML template
│   ├── pages/
│   │   └── index.astro          # Main page (all content here)
│   ├── scripts/
│   │   ├── window-manager.js    # Window state, drag, z-index
│   │   ├── keyboard.js          # Keyboard navigation
│   │   └── splash.js            # Splash screen logic
│   └── styles/
│       ├── global.css           # Reset, design tokens
│       ├── texture.css          # Paper background effect
│       ├── menubar.css          # Top menu bar
│       ├── desktop.css          # Icons, layout
│       ├── window.css           # Window chrome styling
│       ├── buttons.css          # Beveled buttons
│       ├── splash.css           # Splash screen
│       └── content.css          # Window content styling
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Key Components

### WindowManager (`src/scripts/window-manager.js`)
- Manages window open/close state
- Handles dragging via title bar (desktop only)
- Z-index stacking (click brings to front)
- Mobile: windows are full-screen, one at a time

### SplashScreen (`src/components/SplashScreen.astro`)
- Shows custom SVG of classic Mac with "hello." text
- Auto-dismisses after 2.5 seconds
- Skip button + click anywhere + keyboard to dismiss
- Respects `prefers-reduced-motion`
- Uses sessionStorage to only show once per session

### Desktop Icons
- Double-click to open on desktop
- Single tap to open on mobile
- Keyboard: Enter to open, arrow keys to navigate

### Windows
- 5 windows: About, Projects, Writing, Contact, Notes.txt (easter egg)
- Classic window chrome with close button
- Draggable by title bar
- Content is scrollable

---

## Design System

### CSS Custom Properties (`src/styles/global.css`)

```css
/* Key colors */
--color-bg: #f4f1eb;              /* Warm paper background */
--color-window-bg: #ffffff;
--color-title-bar-active: #000080; /* Classic blue */
--color-selection: #000080;

/* Spacing (8px rhythm) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;

/* Z-index layers */
--z-icons: 10;
--z-window-base: 100;
--z-menu-bar: 1000;
--z-splash: 9999;
```

### Window Chrome Style
- 1px beveled border (light top/left, dark bottom/right)
- Title bar: blue gradient, white text
- Shadow: `4px 4px 0px rgba(0,0,0,0.15)` (crisp, not blurred)

### Buttons
- Win95-style beveled appearance
- Pressed state inverts bevel + adds inset shadow

---

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

---

## Customization Guide

### Content Placeholders

All placeholder content is in `src/pages/index.astro` marked with `<!-- PLACEHOLDER: -->` comments:

1. **About Window**
   - Name and tagline
   - Bio paragraph
   - "Now" section bullets

2. **Projects Window**
   - OuterEdge, StartingIt, Bullpen descriptions
   - Additional project cards

3. **Writing Window**
   - Article titles and links
   - Substack URL

4. **Contact Window**
   - Email address
   - LinkedIn, X (Twitter), GitHub URLs

### Styling Customization
- Colors: Edit `src/styles/global.css` design tokens
- Icons: Replace SVGs in `public/images/icons/`
- Splash image: Edit SVG in `src/components/SplashScreen.astro`

---

## Current Status

### Complete
- [x] Astro project structure
- [x] Splash screen with custom SVG Mac illustration
- [x] Menu bar with live clock
- [x] Desktop with 5 custom icons
- [x] Window system (open, close, drag, z-index)
- [x] All 5 windows with placeholder content
- [x] Keyboard navigation (Enter, Escape, Tab, arrows)
- [x] Mobile responsive (dock + full-screen windows)
- [x] Paper texture background
- [x] Win95-style beveled buttons
- [x] `prefers-reduced-motion` support
- [x] Production build working

### To Do (User Tasks)
- [ ] Replace placeholder content with real info
- [ ] Update contact links
- [ ] Add real project descriptions
- [ ] Link Substack articles
- [ ] Deploy to hosting (Vercel/Netlify recommended)
- [ ] Configure ryanlynn.ai domain

---

## Architecture Notes

### Why No React/Vue/Svelte?
Astro's component model gives us the DX benefits (scoped styles, reusable components) without shipping a framework runtime. The window manager is ~200 lines of vanilla JS.

### Mobile Strategy
- Menu bar hidden (no room)
- Icons move to bottom dock
- Windows become full-screen modals
- Only one window open at a time
- Touch events handled in window-manager.js

### Accessibility
- `role="dialog"` on windows
- `aria-hidden` toggled on open/close
- Focus trapped in open windows
- Focus returns to icon on close
- Keyboard fully supported

---

## Deployment

Build outputs static files to `dist/`. Deploy anywhere:

```bash
npm run build
# Upload dist/ to Vercel, Netlify, Cloudflare Pages, etc.
```

Recommended: Vercel or Netlify (free tier, automatic deploys from git).
