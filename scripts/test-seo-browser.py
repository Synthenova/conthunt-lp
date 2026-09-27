"""Run with a Python environment containing Playwright and Chromium."""
import functools
import http.server
import json
import re
from pathlib import Path
import threading
import xml.etree.ElementTree as ET

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
for source in (root / 'content').glob('*/*.md'):
    output = root / ('blog' if source.parent.name == 'blog' else '') / source.stem / 'index.html'
    html = output.read_text()
    assert 'How should you apply ' not in html, source
    assert 'How this page is maintained' not in html, source
assert 'What YouTube Officially Says About Hashtags' in (root / 'blog/youtube-shorts-hashtags-guide/index.html').read_text()
for slug in ['alex', 'elena', 'lamrin', 'maya', 'zach-sanders']:
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', (root / slug / 'index.html').read_text(), re.S)
    graph = next(json.loads(block)['@graph'] for block in blocks if '"@graph"' in block)
    profile = next(item for item in graph if 'ProfilePage' in item.get('@type', []))
    person = next(item for item in graph if item.get('@type') == 'Person')
    assert profile['mainEntity']['@id'] == person['@id'], slug
    assert profile['dateModified'].endswith('Z'), slug
animation = json.loads((root / 'public/main_lottie.json').read_text())
assert animation['v'] and animation['fr'] > 0
assert animation['op'] > animation['ip'] and animation['layers']
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
for entry in ET.parse(root / 'sitemap.xml').findall('s:url', ns):
    slug = entry.findtext('s:loc', namespaces=ns).removeprefix('https://conthunt.app/blog/')
    source = root / 'content/blog' / (slug + '.md')
    if source.is_file():
        updated = re.search(r'^updated: "([\d-]+)"', source.read_text(), re.M)
        if updated:
            assert entry.findtext('s:lastmod', namespaces=ns) == updated[1], slug
server = http.server.ThreadingHTTPServer(
    ('127.0.0.1', 0),
    functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root)),
)
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        base = f'http://127.0.0.1:{server.server_port}'
        static_page = browser.new_page(java_script_enabled=False, viewport={'width': 375, 'height': 812})
        static_page.goto(base, wait_until='load')
        for selector in ['h1', '#hero-waitlist-btn']:
            assert static_page.locator(selector).evaluate('el => { for (; el; el = el.parentElement) { if (getComputedStyle(el).opacity === "0") return false; } return true; }'), selector
        static_page.close()
        page = browser.new_page(viewport={'width': 375, 'height': 600})
        requests = []
        page.on('request', lambda r: requests.append(r.url) if 'main_lottie.json' in r.url else None)
        page.goto(base, wait_until='networkidle')
        assert len(requests) == 0, requests
        page.locator('#main-lottie').scroll_into_view_if_needed()
        page.wait_for_function("document.querySelector('#main-lottie')?.getLottie?.()?.currentFrame > 0")
        assert len(requests) == 1, requests
        for route in ['/', '/docs', '/docs/integrations/skill', '/docs/integrations/mcp', '/blog/youtube-shorts-hashtags-guide', '/blog/youtube-shorts-content-ideas']:
            page.goto(base + route, wait_until='networkidle')
            for width in [320, 375, 768, 1280]:
                page.set_viewport_size({'width': width, 'height': 812})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
        browser.close()
finally:
    server.shutdown()
print('PASS: authored content has no build padding; sitemap dates match; hero is visible without JavaScript; Lottie downloads once and plays; homepage, docs and sample blogs fit four viewports.')
