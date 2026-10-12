# Piñatería Mexicana — Landing Page

> **Preview only.** This is a design/development scaffold — not a production site and not planned to become one. Content placeholders (prices, photos, WhatsApp number) are intentional.

Handcrafted piñata studio landing page. Light "paper" theme by default with a dark option (toggle in the header, choice saved in `localStorage`). Typographic, no build tools.

## Stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom properties, CSS Grid, Flexbox) |
| Scripts | Vanilla JS (sticky header, mobile nav toggle) |
| Fonts | [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Deploy | GitHub Pages (GitHub Actions) |

No bundler. No framework. No dependencies.

## Design tokens

```css
/* light (default)            dark  — <html data-theme="dark"> */
--bg:     #f4f1ea           /* #0a0a0b  ground          */
--ink:    #0a0a0b           /* #f4f1ea  primary text    */
--muted:  #5e5a53           /* #a6a29a  secondary text  */
--pink:   #e8458b   /* accent (default, both themes) */
--yellow: #f5b82e
--teal:   #1fa79a
```

Illustrations in `img/` are drawn for dark; `img/light/` has the same files with cream/near-black swapped, swapped in by `css/theme.css`. When adding art, add both versions plus a rule in `css/theme.css`.

## Local dev

```bash
# Option 1 — just open the file
open index.html

# Option 2 — local server (no install needed)
npx serve .
```

## Deploy

Pushes to `main` trigger the GitHub Actions workflow at `.github/workflows/deploy.yml`, which deploys the `./` directory to GitHub Pages.

**One-time setup (do once in the GitHub repo settings):**

1. Make the repository public
2. Settings → Pages → Source → **GitHub Actions**

Live URL: `https://alexgc96.github.io/pinata-landing/`

## Project structure

```
pinata-landing/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── img/
    ├── logo-mark.svg
    ├── flecos.svg
    ├── pinata-hero.svg
    ├── pinata-cta.svg
    ├── product-estrella.svg
    └── product-flecos.svg
```

## Notes

- The **preview banner** and `noindex` meta tag are intentional and permanent for this repo.
- WhatsApp CTA, prices, photos, and city/email in the footer are placeholder content.
