"""Run with a Python environment containing Playwright and Chromium."""
import functools
import http.server
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
animation = json.loads((root / 'public/main_lottie.json').read_text())
assert animation['v'] and animation['fr'] > 0
assert animation['op'] > animation['ip'] and animation['layers']
server = http.server.ThreadingHTTPServer(
    ('127.0.0.1', 0),
    functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root)),
)
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 375, 'height': 812})
        requests = []
        page.on('request', lambda r: requests.append(r.url) if 'main_lottie.json' in r.url else None)
        base = f'http://127.0.0.1:{server.server_port}'
        page.goto(base, wait_until='networkidle')
        page.locator('#main-lottie').scroll_into_view_if_needed()
        page.wait_for_function("document.querySelector('#main-lottie').getLottie()?.currentFrame > 0")
        assert len(requests) == 1, requests
        for route in ['/docs', '/docs/integrations/skill', '/docs/integrations/mcp']:
            page.goto(base + route, wait_until='networkidle')
            for width in [320, 375, 768, 1280]:
                page.set_viewport_size({'width': width, 'height': 812})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
        browser.close()
finally:
    server.shutdown()
print('PASS: Lottie validates, downloads once and plays; all docs fit four viewports.')
