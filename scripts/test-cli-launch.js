const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const nginx = fs.readFileSync(path.join(root, 'nginx.conf'), 'utf8');

const prompt = 'Run npx skills add Synthenova/conthunt-cli --skill conthunt -g to install the ContHunt skill, then use it to find viral content in my niche.';
const unixInstall = 'curl -fsSL https://conthunt.app/install.sh | sh';
const windowsInstall = 'irm https://conthunt.app/install.ps1 | iex';

assert.ok(homepage.includes(prompt), 'homepage must show the exact coding-agent prompt');
assert.ok(!homepage.includes(unixInstall), 'homepage must not show the macOS/Linux installer');
assert.ok(!homepage.includes(windowsInstall), 'homepage must not show the Windows beta installer');
assert.match(
  homepage,
  /<a[^>]*href="https:\/\/agent\.conthunt\.app"[^>]*id="hero-waitlist-btn"[^>]*>[\s\S]*?GET STARTED[\s\S]*?<\/a>/,
  'homepage must retain the premium Get started CTA',
);
assert.match(
  homepage,
  /<button[^>]*id="hero-copy-btn"[^>]*aria-label="Copy prompt"[^>]*data-copy-target="hero-agent-prompt"[^>]*>[\s\S]*?id="hero-agent-prompt"[\s\S]*?<\/button>/,
  'the entire prompt panel must be the copy control',
);
assert.match(homepage, /id="hero-copy-status"[^>]*aria-live="polite"/, 'copy feedback must be announced accessibly');
assert.match(homepage, /id="hero-agent-prompt"[^>]*class="[^"]*truncate/, 'prompt must stay on one truncated line');
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
