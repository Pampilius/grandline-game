"""Smoke test: opens the built game in headless Chrome, plays a few clicks,
and fails if any JS error, console error, or on-screen error box appears.
Usage: python3 scripts/smoke.py play/GrandLine.html
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

path = pathlib.Path(sys.argv[1]).resolve()
errors: list[str] = []

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    page = browser.new_page()
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("dialog", lambda d: d.accept())

    page.goto(path.as_uri())
    page.fill("#name", "Smoke")
    page.click("#start")
    page.wait_for_selector(".bar", timeout=15000)
    for _ in range(5):
        page.click("#end-day")
    page.click("#debug")
    page.click("#dbg-skip")
    page.click("#dbg-money")
    assert "healthy" in page.inner_text(".debug"), "debug state check not healthy"
    assert "Day 16" in page.inner_text(".bar"), "day counter wrong: " + page.inner_text(".bar")

    page.reload()  # save must survive a reload
    page.wait_for_selector(".bar", timeout=15000)
    assert "Smoke" in page.inner_text(".bar"), "save did not persist across reload"
    if page.locator(".error-box").count():
        errors.append("error box shown: " + page.inner_text(".error-box"))
    page.screenshot(path="/tmp/grandline-smoke.png", full_page=True)
    browser.close()

if errors:
    print("SMOKE FAILED:\n" + "\n".join(errors))
    sys.exit(1)
print("Smoke test passed.")
