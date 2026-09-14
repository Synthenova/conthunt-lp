const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/js/script.js'), 'utf8');
const nginx = fs.readFileSync(path.join(root, 'nginx.conf'), 'utf8');
const skillDocs = fs.readFileSync(path.join(root, 'docs/integrations/skill/index.html'), 'utf8');

const prompt = 'Add an MCP server named ContHunt at https://mcp.conthunt.app and sign in when asked.';
const unixInstall = 'curl -fsSL https://conthunt.app/install.sh | sh';
const windowsInstall = 'irm https://conthunt.app/install.ps1 | iex';

assert.ok(homepage.includes(prompt), 'homepage must show the exact coding-agent prompt');
assert.ok(skillDocs.includes('npx skills add https://conthunt.app'), 'skill docs must show the current install command');
assert.ok(!homepage.includes(unixInstall), 'homepage must not show the macOS/Linux installer');
assert.ok(!homepage.includes(windowsInstall), 'homepage must not show the Windows beta installer');
assert.match(
  homepage,
  /<a[^>]*href="https:\/\/agent\.conthunt\.app"[^>]*id="hero-waitlist-btn"[^>]*>[\s\S]*?GET STARTED[\s\S]*?<\/a>/,
  'homepage must retain the premium Get started CTA',
);
assert.match(
  homepage,
  /<button[^>]*id="mcp-copy-btn"[^>]*aria-label="Copy prompt"[^>]*data-copy-target="mcp-agent-prompt"[^>]*>[\s\S]*?id="mcp-agent-prompt"[\s\S]*?<\/button>/,
  'the entire prompt panel must be the copy control',
);
assert.match(homepage, /id="mcp-copy-status"[^>]*aria-live="polite"/, 'copy feedback must be announced accessibly');
assert.match(homepage, /id="mcp-copy-status"[^>]*class="sr-only"/, 'copy feedback must stay inside the prompt box visually');
assert.ok(script.includes('setTimeout(resetCopyState, 2000)'), 'copy feedback must reset after two seconds');
assert.ok(script.includes("document.addEventListener('pointerdown'"), 'outside interaction must reset copy feedback');
assert.match(homepage, /id="mcp-agent-prompt"[^>]*class="[^"]*min-w-0/, 'prompt must shrink to fit its container');
assert.ok(homepage.indexOf('id="view-demo-btn"') < homepage.indexOf('id="hero-waitlist-btn"'), 'View Demo must sit above Get started');

assert.ok(
  nginx.includes('return 302 https://raw.githubusercontent.com/Synthenova/conthunt-cli/main/install.sh;'),
  '/install.sh must redirect to the canonical installer',
);
assert.ok(
  nginx.includes('return 302 https://raw.githubusercontent.com/Synthenova/conthunt-cli/main/install.ps1;'),
  '/install.ps1 must redirect to the canonical installer',
);

console.log('CLI launch contract passed');
