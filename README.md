# Piñatas Mexicanas — Landing Page

> **Preview only.** This is a design/development scaffold — not a production site and not planned to become one. Content placeholders (prices, photos, WhatsApp number) are intentional.

Handcrafted piñata studio landing page. Dark, typographic, no build tools.

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
--bg:     #0a0a0b   /* dark ground       */
--ink:    #f4f1ea   /* primary text      */
--muted:  #a6a29a   /* secondary text    */
--pink:   #e8458b   /* accent (default)  */
--yellow: #f5b82e
--teal:   #1fa79a
```

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
