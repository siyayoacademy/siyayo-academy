#!/usr/bin/env python3
"""V30.3.89L — local screenshot audit, pinned Explorer only. NO DEPLOY/SCORING."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = "http://127.0.0.1:8879/verb-explorer.html?mode=experience"
OUT = Path(os.environ.get("SIYAYO_VISUAL_OUT", "visual-audit-89l"))
OUT.mkdir(parents=True, exist_ok=True)
SPECS = {
    "desktop": {"width": 1440, "height": 900, "device_scale_factor": 1},
    "portrait": {"width": 390, "height": 844, "device_scale_factor": 1},
}
LOCALES = {"en": "LEARNING TRAIL", "es": "RUTA DE APRENDIZAJE", "pt": "TRILHA DE APRENDIZAGEM"}
CASES = []
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
    for mode, viewport in SPECS.items():
        for language, heading in LOCALES.items():
            errors = []
            context = browser.new_context(viewport=viewport, locale="en-US",
                                          reduced_motion="reduce", accept_downloads=False)
            page = context.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)[:400]))
            record = {"mode": mode, "language": language,
                      "viewport": [viewport["width"], viewport["height"]],
                      "source": "pinned official Explorer c7e83709, local HTTP only",
                      "checks": {}, "errors": errors}
            CASES.append(record)
            try:
                page.goto(ROOT, wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(1200)
                if not page.locator("#experienceView").is_visible():
                    page.locator('[data-mode="experience"]').click(timeout=5000)
                page.wait_for_timeout(700)
                record["checks"]["experience_visible"] = page.locator("#experienceView").is_visible()
                toolbar = page.locator('[data-preview="portrait" if-does-not-exist]')
                if mode == "portrait" and page.locator('[data-preview="portrait"]').count():
                    page.locator('[data-preview="portrait"]').click(timeout=5000)
                elif mode == "desktop" and page.locator('[data-preview="auto"]').count():
                    page.locator('[data-preview="auto"]').click(timeout=5000)

                if page.locator("#learnerIdentityInput").is_visible():
                    page.locator("#learnerIdentityInput").fill("VISUAL-LAB-89L")
                    page.locator("#learnerIdentityConfirm").click(timeout=5000)
                page.wait_for_timeout(500)
                record["checks"]["nick_visible_in_compact"] = page.locator("#learnerIdentityCompact").is_visible()

                btn = page.locator(f'[data-experience-language="{language}"]')
                btn.click(timeout=7000)
                page.wait_for_timeout(700)
                record["checks"]["language_selected"] = btn.evaluate(
                    "(e)=>e.classList.contains('active') || e.getAttribute('aria-pressed') === 'true'"
                )

                module = page.locator("#learningTrailWordPathModule")
                record["checks"]["trail_module_exists"] = module.count() == 1
                if module.count():
                    if not module.evaluate("(e)=>e.open"):
                        module.locator("summary").click(timeout=7000)
                    page.wait_for_timeout(750)
                    record["checks"]["trail_module_expanded"] = module.evaluate("(e)=>e.open")
                surface = page.locator("#learnerTrailSurface")
                record["checks"]["trail_surface_visible"] = surface.count() == 1 and surface.is_visible()
                record["checks"]["locale_heading_in_trail"] = surface.count() == 1 and heading in surface.inner_text(timeout=2000).upper()
                scroller = page.locator(".wp-poly-scroller")
                record["checks"]["wordpath_table_exists"] = scroller.count() >= 1
                if scroller.count():
                    record["wordpath"] = scroller.first.evaluate("""e=>({
                      viewportWidth:e.clientWidth,contentWidth:e.scrollWidth,
                      overflowX:getComputedStyle(e).overflowX,tabIndex:e.tabIndex,
                      hasInnerHorizontalScroll:e.scrollWidth > e.clientWidth + 1
                    })""")
                record["page"] = page.evaluate("""()=>({
                  documentWidth:document.documentElement.scrollWidth,
                  viewportWidth:window.innerWidth,
                  unexpectedHorizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
                  trailHeading:document.querySelector('#learningTrailWordPathHeading')?.textContent?.trim(),
                  trailMarker:document.querySelector('#learnerTrailSurface')?.dataset?.marker||null,
                  assessmentLanguage:document.querySelector('#learnerTrailSurface')?.dataset?.assessmentLanguage||null,
                  displayLanguage:document.querySelector('#learnerTrailSurface')?.dataset?.displayLanguage||null
                })""")
                page.locator("#learningTrailWordPathModule").scroll_into_view_if_needed(timeout=5000)
                page.wait_for_timeout(250)
                module.screenshot(path=str(OUT / f"trail-{mode}-{language}.png"),
                                  animations="disabled", timeout=15000)
                page.screenshot(path=str(OUT / f"full-{mode}-{language}.png"),
                                full_page=True, animations="disabled", timeout=20000)
                record["screenshots"] = [f"trail-{mode}-{language}.png", f"full-{mode}-{language}.png"]
            except Exception as ex:
                record["capture_error"] = str(ex)[:850]
                try:
                    page.screenshot(path=str(OUT / f"diagnostic-{mode}-{language}.png"),
                                    full_page=True, timeout=10000)
                    record["screenshots"] = [f"diagnostic-{mode}-{language}.png"]
                except Exception:
                    pass
            finally:
                context.close()
    browser.close()

report = {
    "elo": "SIYAYO V30.3.89L",
    "source": "c7e83709cacf8479847df0f3cee4ed8a563aaae6",
    "source_kind": "pinned local static site, not live Cloudflare",
    "browser_kind": "headless Chrome viewport emulation, not physical smartphone",
    "synthetic_nick": "VISUAL-LAB-89L",
    "cases": CASES,
    "notes": [
      "No accepted Pass Contract evidence or Green Pass was generated.",
      "The historical 2/3 state requires a separately authorized fixture or real learner screenshot.",
      "Source deployment equality with Cloudflare Pages remains unverified.",
      "This is an objective screenshot audit; human visual homologation is separate."
    ]
}
(OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
for item in CASES:
    print(item["mode"], item["language"], "checks", item["checks"],
          "overflow", item.get("page",{}).get("unexpectedHorizontalOverflow"),
          "error", item.get("capture_error",""))
total_ok = sum(1 for x in CASES if x.get("screenshots"))
print(f"SCREENSHOTS {total_ok}/6; failed/cannot-render={6-total_ok}")
if total_ok < 6:
    raise SystemExit(1)
