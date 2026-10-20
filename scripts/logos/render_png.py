"""Render public/brand/*.svg to transparent PNGs (1024 and 512) with headless Chromium (Playwright)."""
from pathlib import Path

from playwright.sync_api import sync_playwright

BRAND = Path(__file__).resolve().parent.parent.parent / "public" / "brand"


def main() -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for svg in sorted(BRAND.glob("logo-*.svg")):
            for size in (1024, 512):
                page = browser.new_page(viewport={"width": size, "height": size})
                page.set_content(f'<html><body style="margin:0;background:transparent"><img src="{svg.as_uri()}" '
                                 f'width="{size}" height="{size}"></body></html>')
                page.goto(svg.as_uri())
                page.set_viewport_size({"width": size, "height": size})
                page.evaluate(f"document.documentElement.style.width='{size}px';document.documentElement.style.height='{size}px'")
                page.screenshot(path=str(BRAND / f"{svg.stem}-{size}.png"), omit_background=True)
                page.close()
            print("rendered", svg.stem)
        browser.close()


if __name__ == "__main__":
    main()
