# AGENTS.md — Baumkuchen Blog

## Overview

Personal blog/portfolio site for **Baumkuchen** (ばうむくーへん), built with **Astro 7.x** (static site generation). The site has a dark cyberpunk/tech aesthetic with scanlines, animated grids, glow effects, and a custom global music player powered by Netease Cloud Music.

- **Language:** Chinese (zh-CN)
- **URL:** Deployed via GitHub Pages
- **Astro mode:** SSG (output: `build/`)

## Project Structure

```
src/
├── pages/
│   ├── index.astro          # Home — hero, featured posts
│   ├── about.md             # About page
│   ├── blog/index.astro     # Blog listing (glob-imports .md from pages/)
│   ├── music/index.astro    # Music playlist (SSR-lite: reads cached JSON)
│   ├── hello-world.md       # Blog post
│   ├── building-with-astro.md
│   └── 404.astro
├── layouts/
│   ├── Layout.astro         # Root layout: sidebar nav, global player, lyrics card, footer
│   └── BlogPost.astro       # Blog layout: title, date, banner, TOC
├── components/
│   ├── Clock.astro          # SVG analog-style clock (top-right corner)
│   ├── StartupAnimation.astro  # Boot-sequence overlay with digital rain canvas
│   ├── TableOfContents.astro   # Scroll-spy TOC for blog posts
│   └── Lyrics.astro         # (Seems superseded by inline lyrics in Layout.astro)
├── styles/
│   └── global.css           # CSS custom properties, typography, prose, scanlines
scripts/
├── fetch-music.mjs          # Fetches Netease playlist → public/music-cache.json
└── fetch-music-cache.mjs    # (related helper)
public/
├── music-cache.json         # Cached song list (generated)
├── music-cover.json         # Playlist metadata (generated)
├── favicon.ico / favicon.svg
└── _redirects               # Netlify redirects
netlify/functions/
├── auth.mjs                 # Multi-provider OAuth 2.0 handler (login/callback/session)
└── guestbook.mjs            # Guestbook comment CRUD (GitHub Issues backend)
netlify.toml                  # Netlify functions config + env var schema
.github/workflows/
└── deploy.yml               # Deploy to GitHub Pages via bun + actions
```

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Astro 7.x |
| UI | Pure `.astro` components — no React/Vue/Svelte |
| Styling | Custom CSS (no Tailwind) with CSS custom properties |
| Fonts | Inter (sans), JetBrains Mono (mono) from Google Fonts |
| Package manager | **bun** (CI), pnpm (lockfile present locally) |
| Runtime | Node >= 22.12.0 |
| Deploy | GitHub Pages via Actions |
| Proxy | Vite dev proxy for Netease lyrics API |

## Key Architecture Decisions

### Styles are `is:global`
All `<style>` blocks in `.astro` components use `is:global`. This means styles are NOT scoped — they apply globally. Be careful with selector naming to avoid unintended collisions. The convention is to prefix with component-specific classes (e.g., `.music-*`, `.dt-*`, `.gp-*`).

### Global Music Player
The player lives in `Layout.astro` and persists across navigations via `ClientRouter` (`transition:persist`). State is stored in `sessionStorage` under keys:
- `gp` — current song (name, url, time, playing)
- `gp-playlist` — full playlist array for next-song logic
- `gp-mode` — play mode: `list`, `single`, `shuffle`

Songs are played from `https://music.163.com/song/media/outer/url?id=<id>.mp3`.

### Lyrics System
Lyrics are fetched client-side from Netease API via the Vite proxy (`/api/music/lyric` → `music.163.com/api/song/lyric`). The `parseLrc()` function handles `[mm:ss.xx]`, `[mm:ss,xx]`, and `[mm:ss]` timestamp formats. Bilingual lyrics (original + translated) are supported.

### Music Data Pipeline
1. `scripts/fetch-music.mjs` fetches a Netease playlist (default ID `14292629226`) in batches of 100 songs
2. Writes `public/music-cache.json` (song array) and `public/music-cover.json` (playlist metadata)
3. `src/pages/music/index.astro` reads these JSON files at build time
4. Frontend paginates client-side (50 songs/page), search filters by name/artist

### View Transitions
The site uses `ClientRouter` from `astro:transitions`. Elements that should survive navigation use `transition:persist`:
- `.sidebar`
- `#global-player`
- `#lyrics-card`
- `#startup-overlay`
- `.dt-clock`

Scripts that run on every page must guard with a `window.__<name>_init` flag to avoid re-initialization after client-side navigations.

### Responsive Breakpoints
Consistent across all components:
- **768px** — Tablet: sidebar moves to bottom, content padding adjusts
- **600px** — Large phone: further reductions
- **400px** — Small phone: minimal sizes

### Animation Patterns
- `.fade-in` class triggers `fadeIn` animation (opacity 0 → 1, translateY 10px → 0)
- `.stagger-N` classes add delays (0.1s increments) for sequential reveals
- `@keyframes` are defined in `global.css`

## Commands

```
astro dev --background    # Start dev server (background mode)
astro dev stop            # Stop background server
astro dev status          # Check if server is running
astro dev logs            # View server logs
npm run build             # Fetch music + build (output: build/)
npm run preview           # Preview production build
node scripts/fetch-music.mjs [playlistId]  # Refresh music cache
```

## Known Issues / Gotchas

### CI/CD outDir mismatch ⚠️
`astro.config.mjs` sets `outDir: 'build'`, but `.github/workflows/deploy.yml` uploads `path: ./dist`. Additionally, `dist/` is **committed to the repo** (stale — still contains deleted pages like `guestbook/`). The `.gitignore` lists `dist/` but committed files aren't removed by gitignore. This should be fixed by either:
- Aligning CI to use `build/`, or changing `outDir` to `dist`
- Running `git rm -r --cached dist/` to stop tracking it

### `.claude/settings.local.json` stale paths
Allowlist entries reference `/home/baumkuchen/blog/...` (old project location). Harmless but should be updated if permissions break.

## Development Notes

- **Dev server:** Always use `astro dev --background` (per CLAUDE.md)
- **Build:** `npm run build` runs `fetch-music.mjs` first, then `astro build`
- **Output dir:** `build/` (not `dist/`) — configured in `astro.config.mjs` (but see CI/CD mismatch above)
- **Lyrics proxy in production:** Vite dev proxy only works locally; production relies on `public/_redirects` (Netlify-style 200 rewrite) to proxy `/api/music/lyric` → `music.163.com/api/song/lyric`
- **No content collections:** Blog posts are `.md` files in `src/pages/` with `listed: false` frontmatter to hide from blog index
- **No TypeScript strictness issues:** tsconfig extends `astro/tsconfigs/strict` but the codebase uses minimal TS (mostly JS in scripts)
- **CSS custom properties** are defined in `:root` in `global.css` — use these, don't hardcode colors
- The `Lyrics.astro` component appears to be an older/alternate implementation; the active lyrics system is the inline script in `Layout.astro`
- No test framework, linter, or formatter configured

## Guestbook

The guestbook page (`/guestbook`) is a multi-provider OAuth discussion system.

### Architecture
```
Browser -> Netlify Function (/auth) -> OAuth Provider (GitHub/Google/GitLab/Gitee/...)
Browser -> Netlify Function (/guestbook) -> GitHub Issues API
```

- **Auth:** `netlify/functions/auth.mjs` -- generic OAuth 2.0 handler with PKCE. Supports any standard OAuth provider via env var configuration.
- **Comments:** `netlify/functions/guestbook.mjs` -- CRUD backed by GitHub Issue comments via bot token (`GITHUB_BOT_TOKEN` env var). User identity from OAuth session, storage via bot.
- **Session:** HMAC-signed JWT stored in HttpOnly `gb_session` cookie.

### Supported Providers
Built-in support for GitHub, Google, GitLab, Gitee. Additional providers can be added via env vars:
```
OAUTH_<NAME>_CLIENT_ID, OAUTH_<NAME>_CLIENT_SECRET,
OAUTH_<NAME>_AUTHORIZE_URL, OAUTH_<NAME>_TOKEN_URL,
OAUTH_<NAME>_USERINFO_URL
```

### Required Env Vars (in Netlify)
| Variable | Description |
|----------|-------------|
| `OAUTH_JWT_SECRET` | HMAC key for session tokens |
| `GITHUB_BOT_TOKEN` | GitHub PAT with `public_repo` scope |
| `SITE_URL` | Site URL for OAuth redirect URIs |
| `OAUTH_<PROVIDER>_CLIENT_ID` | OAuth client ID per provider |
| `OAUTH_<PROVIDER>_CLIENT_SECRET` | OAuth client secret per provider |

### OAuth Redirect URI
Register with each OAuth provider: `https://<site>/.netlify/functions/auth?action=callback`

### Local Dev
Use `netlify dev` to run functions locally. The Vite proxy in `astro.config.mjs` forwards `/.netlify/functions/*` to `localhost:8888`.

This feature requires **Netlify hosting** -- the functions won't run on GitHub Pages.

## Adding a Blog Post

1. Create `src/pages/<slug>.md` with frontmatter:
   ```md
   ---
   title: "Post Title"
   date: "2026-01-01"
   description: "Brief description"
   banner: "https://picsum.photos/seed/slug/720/240"
   layout: ../layouts/BlogPost.astro
   ---
   ```
2. `listed: false` hides it from the blog index
3. It will auto-appear on `/blog` via `import.meta.glob('../*.md')`
