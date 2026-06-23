# AGENTS.md — Baumkuchen's Blog

## Project Overview

A personal blog built with **SvelteKit 5 + TypeScript**, using **MDUI 2** (Material Design 3 web components) for the UI layer. Content is authored as Markdown files with YAML frontmatter and compiled at build time. Deployed to **GitHub Pages** via GitHub Actions.

---

## Essential Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server (Vite) |
| `pnpm build` | Production build to `./dist` |
| `pnpm preview` | Preview production build locally |

**No test, lint, or format commands exist.** No test framework, no ESLint, no Prettier.

---

## Code Organization

```
src/
  app.css             — Global styles, dark theme CSS variables, Markdown content styling
  app.d.ts            — SvelteKit app type declarations
  app.html            — SvelteKit HTML shell
  posts/              — Markdown blog posts with YAML frontmatter
  lib/
    components/        — Actively used Svelte components (ArticleToc, Clock)
    presets/           — Reusable component templates (not all are used in routes currently)
    utils/
      posts.ts         — PostMeta interface, frontmatter parser, allPosts/pages exports
      markdown.ts      — MarkdownIt renderer
      widget.ts        — Helper functions for widget grid/card HTML generation
  routes/
    +layout.svelte     — App shell: sidebar nav, clock, main content slot
    +page.svelte       — Home page: hero + recent posts
    about/+page.svelte — About page (renders markdown from "about" page-type post)
    archive/+page.svelte — Timeline archive grouped by year
    posts/
      +page.svelte     — All posts list with search + pagination
      [slug]/+page.svelte — Individual post page with TOC, image preview, copy buttons
```

---

## Architecture & Data Flow

### Content System

Blog content lives as `.md` files in `src/posts/`. At build time, Vite's `import.meta.glob` eagerly imports all `*.md` files as raw strings (`?raw` query). A custom frontmatter parser (not `gray-matter`) extracts attributes and body text from the `---` delimited YAML block.

**PostMeta interface** (`src/lib/utils/posts.ts`):
```ts
interface PostMeta {
  title: string;
  date: string;
  updated?: string;
  category?: string;
  slug: string;
  content: string;
  type: 'post' | 'page';
  banner?: string;
}
```

Two exports from `posts.ts`:
- `allPosts` — filtered to `type === 'post'`, sorted by date descending
- `pages` — filtered to `type === 'page'`

### Markdown Rendering

Uses `markdown-it` with `html: true`, `linkify: true`, `typographer: true`. Rendered HTML is injected via `{@html renderMarkdown(content)}`.

### Routes

| Route | Source | Renderer |
|---|---|---|
| `/` | `allPosts` (latest 3) | Direct inline Svelte |
| `/posts` | `allPosts` | Direct inline Svelte (search + pagination) |
| `/posts/[slug]` | `allPosts.find()` | Direct inline Svelte |
| `/about` | `pages.find('about')` | Direct inline Svelte |
| `/archive` | `allPosts` (grouped by year) | Direct inline Svelte |

---

## Key Patterns & Conventions

### Svelte 5 Runes (Universal)

This project uses Svelte 5 runes everywhere — no `$:`, no `export let`, no `on:click`.

| Rune | Usage |
|---|---|
| `$props()` | Component props destructuring — never `export let` |
| `$state()` | Reactive local state |
| `$derived(...)` | Computed values — never `$:` |
| `$derived.by(() => { ... })` | Computed values with block body |
| `$effect(() => { ... })` | Side effects (DOM manipulation, intervals, observers) — cleanup via `return () => ...` |
| `{@render children()}` | Slot content in layout — never `<slot />` |
| `$page` (from stores) | `import { page } from '$app/stores'` for route params/URL |

### Component Props Pattern

```ts
let { title }: { title: string } = $props();
let { onclick }: { onclick?: (slug: string) => void } = $props();
```

### Event Handling

Inline `onclick` on non-interactive elements is the standard pattern:
```svelte
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div onclick={() => goto('/path')}>
```

The `a11y_click_events_have_key_events` and `a11y_no_static_element_interactions` ignore comments accompany every such usage on the same line as the element they suppress.

### Navigation

`import { goto } from '$app/navigation'` for programmatic navigation. `$app/stores` only for `page` (params, URL pathname).

### Styling

- **Scoped `<style>`** per component — never global except `app.css`.
- **CSS custom properties** for theming — defined in `:root` in `app.css`:
  - `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--accent` (`#bb86fc`), `--border`
- **Dark theme only** — `color-scheme: dark`, no light mode.
- Transitions use `0.2s` as standard duration.

### Markdown Frontmatter

```yaml
---
title: My Post Title
date: 2026-06-20
updated: 2026-06-22
category: 技术
slug: optional-custom-slug  # defaults to filename without .md
type: post                  # or "page"
banner: https://...         # optional hero image
---
```

**Gotcha**: The custom parser splits on the first `:` character per line. Values cannot contain colons. The parser skips empty keys silently.

**Gotcha**: Slug is either the `slug` frontmatter key or the filename stem (with hyphens preserved). Since slugs are derived from filenames in the fallback, renaming a `.md` file changes its URL.

---

## UI Components

### MDUI Components Used
- `<mdui-navigation-rail>`, `<mdui-navigation-rail-item>`
- `<mdui-card>`, `<mdui-button>`, `<mdui-text-field>`, `<mdui-chip>`, `<mdui-icon>`, `<mdui-avatar>`, `<mdui-list>`, `<mdui-list-item>`
- All from `mdui` package, CSS imported via `import 'mdui/mdui.css'`, icons via `import 'mdui/components/icon.js'`

### Custom Components

| Component | Location | Purpose |
|---|---|---|
| `Clock` | `src/lib/components/Clock.svelte` | SVG progress ring + digital clock in fixed top-right corner |
| `ArticleToc` | `src/lib/components/ArticleToc.svelte` | Fixed right sidebar table of contents with IntersectionObserver |

### Presets (Template Components)

`src/lib/presets/` contains components that look like a template library. Most are **not actively used** in routes — the routes contain inline implementations instead. These exist as reusable patterns:

| Preset | Actively Used? |
|---|---|
| `HeroSection.svelte` | Not used (home page has inline hero) |
| `PostCard.svelte` | Not used (home page has inline card) |
| `PostContent.svelte` | Not used (post page has inline content + TOC) |
| `PostList.svelte` | Not used |
| `Pagination.svelte` | Not used (posts page has inline pagination) |
| `QuickLinks.svelte` | Not used |
| `SystemInfo.svelte` | Not used |
| `Timeline.svelte` | Not used (archive page has inline timeline) |

---

## Non-Obvious Details & Gotchas

1. **Package manager is pnpm** — locked by CI config. `pnpm install`, not `npm install`.
2. **No gray-matter** — frontmatter is parsed by a custom `parseFrontmatter()` function in `posts.ts`. It's simple but doesn't handle multi-line values or colons in values.
3. **Import.meta.glob for content** — Markdown imports use `import.meta.glob('/src/posts/*.md', { eager: true, query: '?raw', import: 'default' })`. This means new posts are automatically picked up on rebuild with no registration needed.
4. **Copy button DOM injection** — The `initCopyButtons` function in the post page and `PostContent` preset directly manipulates the DOM by appending `<button>` elements to `<pre>` blocks. This runs in `$effect` with `requestAnimationFrame`.
5. **Image preview overlay** — Clicking images opens a fullscreen overlay. The pattern appears in both `[slug]/+page.svelte` and `about/+page.svelte` with slightly different overlay implementations.
6. **No error/404 page** — SvelteKit's default 404 page is active. No custom `+error.svelte` or `+404.svelte`.
7. **Build output goes to `./dist`** — SvelteKit's `@sveltejs/adapter-auto` detects GitHub Pages deployment and produces a static site at `./dist`.
8. **No `+page.server.ts` or `+layout.server.ts`** — All data is loaded at build time via eager imports. No server-side load functions, no API routes, no form actions.
9. **Chinese UI labels** — All UI text is in Chinese (主页, 文章, 归档, 搜索, etc.).
10. **Node 24 + pnpm 10.12.3** — defined in CI; development environment should match.
