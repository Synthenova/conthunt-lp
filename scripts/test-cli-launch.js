const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const nginx = fs.readFileSync(path.join(root, 'nginx.conf'), 'utf8');

const prompt = 'Install the ContHunt skill from Synthenova/conthunt-cli, then help me find viral content in my niche.';
const unixInstall = 'curl -fsSL https://conthunt.app/install.sh | sh';
const windowsInstall = 'irm https://conthunt.app/install.ps1 | iex';

assert.ok(homepage.includes(prompt), 'homepage must show the exact coding-agent prompt');
assert.ok(homepage.includes(unixInstall), 'homepage must show the macOS/Linux installer');
assert.ok(homepage.includes(windowsInstall), 'homepage must show the Windows beta installer');
assert.match(homepage, /<button[^>]*id="hero-waitlist-btn"[^>]*>/, 'primary copy control must preserve its analytics id');
assert.match(homepage, /id="hero-copy-status"[^>]*aria-live="polite"/, 'copy feedback must be announced accessibly');

assert.ok(
  nginx.includes('return 302 https://raw.githubusercontent.com/Synthenova/conthunt-cli/main/install.sh;'),
  '/install.sh must redirect to the canonical installer',
);
assert.ok(
  nginx.includes('return 302 https://raw.githubusercontent.com/Synthenova/conthunt-cli/main/install.ps1;'),
  '/install.ps1 must redirect to the canonical installer',
);

console.log('CLI launch contract passed');
