# AGENTS.md

## Project

Static, no-build landing site for "Piñatería Mexicana" (handmade piñata studio). Vanilla HTML5 + CSS + JS. No bundler, framework, package manifest, or dependencies. Deploys to GitHub Pages via `.github/workflows/deploy.yml` (uploads `./`).

Preview-only site: `noindex` meta tags and preview banner are intentional and permanent.

Pages: `index.html` (landing), `portafolio.html` (photo portfolio + lightbox), and the legal pages `aviso-legal.html` and `politica-privacidad.html` (text only; no `gallery.js` or `party-cursor.js`).

## Essential commands

- Local preview: `open index.html` (or any HTML file), or `npx serve .`
- Deploy: push to `main` (Actions workflow deploys `./`)
- No build/test/lint scripts exist in this repo.

## Structure

- `index.html`, `portafolio.html` — markup; Spanish is the source language and is read from markup
- `css/style.css` — tokens/palettes (`:root`, `:root[data-theme="dark"]`), layout
- `css/theme.css` — theme toggle styles + illustration swap rules
- `css/fonts.css` — `@font-face` rules for self-hosted Fraunces + Inter (files in `fonts/`, latin + latin-ext only)
- `css/party-cursor.css`, `css/lang-switch.css`, `css/portfolio.css`, `css/legal.css` (legal pages only)
- `js/theme.js` — synchronous head script: applies saved theme before paint, builds toggle button
- `js/main.js` — sticky header height sync, mobile nav toggle
- `js/i18n.js` — language switch (Spanish default, Basque), `data-i18n` / `data-i18n-attr`
- `js/lang/es.js`, `js/lang/eu.js` — string maps on `window.PinataStrings`
- `js/party-cursor.js` — custom cursor, piñata hero interaction, confetti
- `js/gallery.js` — portfolio lightbox (native `<dialog>`); only loaded on `portafolio.html`
- `img/`, `img/light/` (theme variants), `img/portfolio/` (photo sizes)
- `favicon.svg` (adapts stroke to the browser's dark scheme), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180, cream background) at the root; every page links all three in `<head>`

## Load order (do not break)

`theme.js` in `<head>` (synchronous, before first paint). At end of body, in this order: `main.js`, `lang/es.js`, `lang/eu.js`, `i18n.js`, `party-cursor.js`, and on the portfolio page `gallery.js`. i18n depends on lang files being registered first; party-cursor and gallery read `PinataI18n`.

## Theming (light default, dark via `<html data-theme="dark">`)

- Toggle persists choice in `localStorage` key `pinatas-theme`; storage failures are swallowed (private mode).
- Palettes are CSS variables in `css/style.css`.
- Illustrations are authored for dark mode (cream lines). On light, `css/theme.css` swaps `img[src$="..."]` via `content: url("../img/light/...")`. The `img/light/` copies must be kept in step. When adding art: add both versions and add a matching `content` rule in `css/theme.css`.
- The inline "A medida" star uses hard-coded cream strokes/text recolored by attribute rules in `theme.css`.

## Internationalization

- Spanish text lives in markup; `js/i18n.js` captures it at runtime into the `es` map, so missing keys fall back to Spanish automatically.
- `js/lang/es.js` holds only strings with no markup source (e.g. `hero.hint.*`, `pop.*`).
- Basque is `js/lang/eu.js`. Add keys there to add EU copy; unreleased keys fall back to ES.
- `?lang=eu` (or `eu`) in URL selects language directly and writes it to `localStorage` key `pinatas-lang`.
- Markup opts in via `data-i18n="key"` (innerHTML) or `data-i18n-attr="attr:key;attr:key"` (attributes).
- Language changes dispatch `pinata:languagechange` with `{ detail: { lang } }`; theme and party-cursor listen to it.
- Adding a new language requires: new `js/lang/<code>.js`, add code to `LANGS` in `i18n.js`, add switch button in both pages, and add button-label entry in `theme.js` `LABELS` (used for the theme toggle's aria-label).

## Interaction patterns

- `--header-h` CSS var tracks the sticky header's collapsed height (`main.js` `syncHeaderHeight`) so anchor jumps clear it. It is skipped while the mobile menu is open (header temporarily taller) and resynced on nav link click.
- Scroll past 12px adds `is-scrolled` to header.
- Gallery lightbox is a native `<dialog>` with manual prev/next/keyboard/swipe handling; images are referenced by `data-full`/`data-full-w`/`data-full-h` and alt/caption read from the figure.
- Party cursor injects its own DOM (`party-cone`, `party-stick`, `party-fx` canvas, `hero__hint`) and moves into the dialog's top layer when `pinata:toplayer` fires (`host` detail or null to return to body), so it stays visible over the lightbox. Do not assume cursor elements are direct children of `body`.
- Portfolio has no hero, so party-cursor runs in "cone only" mode (cone, trail, click confetti).

## Image asset conventions

- Dark originals in `img/`; light copies in `img/light/` (cream → `#2A2A2D`).
- Portfolio photos use responsive sizes: `name-480.webp` (4:5 crop for tiles/thumbs), `name-960.webp`, `name-full.webp` (uncropped, max 1800px), with srcset/sizes and `data-full*`/`data-thumb` on the opener button. One `.work` per piñata: extra angles are hidden `.work__angle` spans (`data-full*`, `data-thumb`, `data-alt` + `data-i18n-attr="data-alt:portfolio.<slug>.<n>.alt"`); the lightbox steps through them. Keys are `portfolio.<slug>.title` / `.<n>.alt`. Strip EXIF when exporting.
- Art is served as static files; paths are relative, so pages work from any subpath only as long as relative links stay intact (GitHub Pages serves from `/pinata-landing/`).

## Gotchas

- `css/theme.css` illustration swaps rely on `content:` on `img`, which only applies to replaced elements; rules must match the exact `src` suffix (`img/...svg`).
- Theme script must stay synchronous in `<head>`; moving it or deferring causes a flash and wrong early theme.
- `js/gallery.js` is not loaded on `index.html`; including it there would query-miss and no-op, but don't assume shared initialization.
- No tests exist; verify changes by opening both pages in a browser (light + dark, ES + EU).
- WhatsApp CTA, prices, photos, footer city/email are placeholders; `assets` are not production content.
- Git branch workflow uses `feat/*` feature branches merged via PRs (see recent history); deploy only on `main`.
- Keep markup changes synced with i18n keys; new user-visible copy needs both `data-i18n` and Basque entries (or it falls back to Spanish).
- Common mistake: editing without checking dark-mode counterpart of SVGs.
- Fonts are self-hosted (privacy requirement). Do not add Google Fonts `<link>`s or `preconnect` hints back to the pages. To change font weights or subsets, edit `css/fonts.css` and the matching files in `fonts/`.
