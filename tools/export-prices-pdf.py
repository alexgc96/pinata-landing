#!/usr/bin/env python3
"""Render the "Nuestras piñatas" price list (css/print.css) to a shareable PDF.

One 4:5 page (1080 x 1350 px) per language, always in the light palette.
Optionally also a PNG of the same page, ready to post.

Setup (once):
  python3 -m pip install playwright
  python3 -m playwright install chromium   # skip if Chromium is already installed

Examples:
  python3 tools/export-prices-pdf.py                    # -> pdf-out/precios_es.pdf + precios_eu.pdf
  python3 tools/export-prices-pdf.py --png              # also precios_es.png / precios_eu.png
  python3 tools/export-prices-pdf.py --lang es --out ~/Desktop
  python3 tools/export-prices-pdf.py --chromium /path/to/chrome   # use an existing browser
"""
import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
NAMES = {"es": "precios_es", "eu": "prezioak_eu"}
W, H = 1080, 1350


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", choices=["es", "eu"], action="append", help="language(s); default: both")
    ap.add_argument("--out", default="pdf-out", help="output folder (default: pdf-out, git-ignored)")
    ap.add_argument("--png", action="store_true", help="also write a 1080x1350 PNG per language")
    ap.add_argument("--chromium", help="path to a Chromium/Chrome binary (default: Playwright's own)")
    args = ap.parse_args()

    out = Path(args.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)
    url = (ROOT / "index.html").as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chromium) if args.chromium else p.chromium.launch()
        for lang in args.lang or ["es", "eu"]:
            page = browser.new_page(viewport={"width": W, "height": H})
            # force the light palette whatever the saved preference is
            page.add_init_script("try{localStorage.setItem('pinatas-theme','light')}catch(e){}")
            page.goto(f"{url}?lang={lang}")
            page.emulate_media(media="print")
            page.evaluate("document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; })")
            page.evaluate("Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))])")
            page.wait_for_timeout(300)
            pdf = out / f"{NAMES[lang]}.pdf"
            page.pdf(path=str(pdf), width=f"{W}px", height=f"{H}px", print_background=True, prefer_css_page_size=True)
            print(pdf)
            if args.png:
                png = out / f"{NAMES[lang]}.png"
                page.screenshot(path=str(png), clip={"x": 0, "y": 0, "width": W, "height": H})
                print(png)
            page.close()
        browser.close()


if __name__ == "__main__":
    main()
