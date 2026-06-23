# AGENTS.md — test-blog

A personal dark-themed blog built with **Astro 5**, **MDUI 2** (Material Design component library), and custom Markdown-powered content. Single-developer project with Chinese-language UI (`zh-CN`).

## Commands

| Command | Usage |
|---------|-------|
| `bun dev` | Start dev server (Astro) |
| `bun build` | Static production build to `build/` |
| `bun preview` | Preview the production build locally |

No test runner, no linter, no type-check script configured.

## Project Structure

```
src/
├── pages/           # Route pages (Astro file-based routing)
│   ├── 404.astro                   # 404 page
│   ├── index.astro                 # Home — shows 3 most recent posts
│   ├── posts/
│   │   ├── index.astro             # All posts — searchable, paginated (5/page)
│   │   └── [...slug].astro         # Dynamic post detail page (SSG via getStaticPaths)
│   ├── archive/
│   │   └── index.astro             # Timeline grouped by year
│   └── about/
│       └── index.astro             # About page — renders `about.md` content
├── layouts/
│   └── Layout.astro                # App shell — sidebar nav, clock, <slot/>
├── lib/
│   ├── utils/
│   │   ├── posts.ts                # Frontmatter parser + PostMeta type
│   │   ├── markdown.ts             # markdown-it renderer (singleton instance)
│   │   └── widget.ts               # Browser-only system info (not currently used in any page)
│   └── components/
│       ├── ArticleToc.astro        # Fixed-position TOC sidebar (hides <1200px)
│       └── Clock.astro             # SVG progress ring + digital clock
├── posts/           # Markdown source files (frontmatter + body)
│   ├── about.md                    # type: page (displayed on /about)
│   └── *.md                        # type: post (default)
└── styles/
    └── app.css                     # CSS custom properties (dark theme), base styles
```

## Content Model (posts.ts)

All content lives in `/src/posts/*.md`. Files are loaded via `import.meta.glob` with `?raw` query (not Astro's built-in content collections). A custom `parseFrontmatter()` function does naive `key: value` parsing from `---` delimiters.

```typescript
interface PostMeta {
  title: string;      // falls back to filename-with-hyphens
  date: string;       // required for posts
  updated?: string;   // optional revision date
  category?: string;  // freeform, used as a filter tag
  slug: string;       // falls back to filename stem
  content: string;    // raw markdown body (after frontmatter)
  type: 'post' | 'page';
  banner?: string;    // image URL for cards
}
```

Frontmatter fields are `key: value` (space after colon required for correct parsing). No support for multiline or quoted values.

### Content rules

- A post with `type: page` and `slug: about` is the about page — it's the only page fetched by slug name in `about/index.astro`
- Posts with `type: post` (or missing type) appear on home, posts list, and archive
- Sort order: descending by `date` (newest first)
- All files in `/src/posts/*.md` are included — there's no draft/exclude mechanism

## Architecture & Data Flow

1. **Build-time SSG**: Every `.md` file is read via `import.meta.glob('/src/posts/*.md', { eager: true, query: '?raw' })` at page build time
2. **`parsePostsFromModules()`** extracts frontmatter into `PostMeta` objects
3. **`renderMarkdown()`** renders `post.content` via a shared `markdown-it` instance (singleton, configured with `html: true`, `linkify: true`, `typographer: true`)
4. Pages receive content as props or inline data — no API, no database, no runtime fetching
5. Posts detail uses **`getStaticPaths()`** for dynamic route generation (`[...slug]`)

## Key Conventions

- **Dark theme only**: `mdui-theme-dark` class on `<html>`, hardcoded `#121212` backgrounds. Color variables defined in `app.css` (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--accent: #bb86fc`, `--border`)
- **Navigation**: Uses `navigate()` from `astro:transitions/client` (exposed globally as `window.__nav` from Layout) for ViewTransitions client-side navigation. MDUI web components' `onclick` calls `__nav(path)` directly since `<a>` wrapping doesn't work with shadow DOM. Active state managed via `currentPath` prop, corrected client-side on `astro:page-load`.
- **Transitions**: Uses `astro:transitions` (`ViewTransitions`). Only `main-content` participates in view transitions; sidebar and clock have `transition:persist` to stay stable.
- **Client interaction patterns**: All page navigation uses `window.__nav(path)` from Layout's global (which calls `navigate()` from `astro:transitions/client`). Client-side search and pagination on `/posts` operate on `JSON.parse`'d data from a `data-posts` attribute.
- **Chinese-language UI**: All labels, messages, and date formatting use Chinese (`zh-CN` locale). `formatDate()` in `archive/index.astro` manually formats as `X月X日`.

## MDUI Usage

The project uses **MDUI 2** (a Material Design Web Components library). Components are imported via side-effect in Layout's `<script>` block:

```js
import 'mdui';
import 'mdui/components/icon.js';
```

Components used: `mdui-card`, `mdui-navigation-rail`, `mdui-navigation-rail-item`, `mdui-button`, `mdui-text-field`, `mdui-chip`, `mdui-list`, `mdui-list-item`, `mdui-avatar`. Icons use Material Icons font (loaded from Google Fonts in Layout `<head>`).

## Non-obvious Details / Gotchas

- **`widget.ts` is unused** — it defines `getSystemInfo()` for browser system info but no page imports it
- **Posts content is rendered with `set:html`** — raw HTML from markdown-it, no sanitization
- **Copy-to-clipboard** in `[...slug].astro` has a fallback to `document.execCommand('copy')` for non-HTTPS contexts
- **Image preview overlay** is duplicated in `[...slug].astro` and `about/index.astro` with slightly different markup (not extracted to a shared component)
- **No Astro content collections** — the project uses `import.meta.glob` + manual frontmatter parsing, which means no built-in schema validation, no content type safety, and no collections API
- **No draft support** — all `.md` files in `/src/posts/` are published. To hide a post, move it out of the directory or rename the file
- **`bun.lock`** is checked in — package manager is Bun (not npm/pnpm)
- **No `strict` or `include` in tsconfig** — TypeScript is loose despite `"strict": true`; many files lack type annotations
- **ViewTransitions + module scripts**: Astro `<script>` blocks become module scripts that may not reliably re-execute on client-side navigation. Always use `astro:page-load` event listeners for DOM initialization, and re-query DOM elements inside the listener (they're fresh on each navigation). See `posts/index.astro` and `[...slug].astro` for the established pattern: call init both immediately and on `astro:page-load`.
- **MDUI components + navigation**: MDUI web components consume clicks inside their shadow DOM, so wrapping them in `<a>` tags doesn't work — Astro's ViewTransitions won't intercept the click. Use `navigate()` from `astro:transitions/client` directly in the component's `onclick` handler (exposed globally as `window.__nav` from Layout).
- **Mobile layout**: Below 768px, the sidebar and clock are hidden, and a bottom navigation bar appears. Styles use `!important` overrides in `app.css` to reduce padding/margins on small screens. Sidebar navigation is preserved as a bottom nav bar with text buttons.
- **Splash screen**: On external entry (full page load), a 3-second splash overlay shows the GitHub avatar, cycles through project file paths, and fills a native `<progress>` bar. Uses `window.__splashDone` flag to skip on subsequent ViewTransitions navigations. Falls back to `astro:page-load` listener to hide the splash silently on navigation.
