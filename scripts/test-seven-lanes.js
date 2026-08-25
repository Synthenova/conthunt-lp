#!/usr/bin/env node
/**
 * Asserts the seven-lane SEO edits against shipped sources + last build output.
 * Run after `node scripts/build-blog.js`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const fail = [];
const ok = [];

function exists(p, label) {
    if (fs.existsSync(p)) ok.push(`exists ${label}`);
    else fail.push(`missing ${label}: ${p}`);
}

function notExists(p, label) {
    if (!fs.existsSync(p)) ok.push(`gone ${label}`);
    else fail.push(`still present ${label}: ${p}`);
}

function read(p) {
    return fs.readFileSync(p, 'utf8');
}

const TEMPLATE = 'in 2026 with practical steps, examples, and ContHunt tips';

const hubs = {
    'instagram-reels-content-ideas': 'Instagram Reels Content Ideas That Get Watched',
    'youtube-shorts-hashtags-guide': 'Best Hashtags for YouTube Shorts',
    'best-instagram-analytics-tools': 'Best Instagram Analytics Tools Compared',
    'short-form-video-best-practices': 'Short-Form Video Best Practices: Hooks, Captions, Hashtags',
    'vidiq-alternatives': 'Best vidIQ Alternatives (Free and Paid)',
};

for (const [slug, title] of Object.entries(hubs)) {
    const htmlPath = path.join(ROOT, 'blog', slug, 'index.html');
    exists(htmlPath, `hub html ${slug}`);
    if (!fs.existsSync(htmlPath)) continue;
    const html = read(htmlPath);
    if (html.includes(`<h1>${title}</h1>`)) ok.push(`h1 ${slug}`);
    else fail.push(`h1 mismatch ${slug}`);
    if (html.includes(`<title>${title}</title>`)) ok.push(`title ${slug}`);
    else fail.push(`title mismatch ${slug}`);
    if (html.includes(TEMPLATE)) fail.push(`template meta still on ${slug}`);
    else ok.push(`no template meta ${slug}`);
}

const clonesTo = {
    'best-instagram-analytics-tools': [
        'instagram-analytics',
        'instagram-analytics-app',
        'instagram-analytics-ultimate-guide',
        'how-to-view-instagram-analytics',
    ],
    'youtube-shorts-content-ideas': [
        'youtube-shorts-content-ideas-beauty',
        'youtube-shorts-content-ideas-cooking',
        'youtube-shorts-content-ideas-fitness',
        'youtube-shorts-content-ideas-gaming',
        'youtube-shorts-content-ideas-tech',
        'youtube-shorts-content-ideas-travel',
        'educational-content-ideas-youtube-shorts',
        'youtube-shorts-ideas-without-showing-face',
    ],
};

const nginx = read(path.join(ROOT, 'nginx.conf'));
for (const [hub, slugs] of Object.entries(clonesTo)) {
    for (const slug of slugs) {
        notExists(path.join(ROOT, 'content/blog', `${slug}.md`), `md ${slug}`);
        for (const loc of [`/blog/${slug}`, `/blog/${slug}/`]) {
            const block = `location = ${loc} {\n            return 301 https://$host/blog/${hub};`;
            if (nginx.includes(`location = ${loc}`) && nginx.includes(`/blog/${hub}`)) {
                ok.push(`301 ${loc} -> ${hub}`);
            } else {
                fail.push(`missing 301 ${loc} -> ${hub}`);
            }
        }
    }
}

const keep = [
    'how-to-monetize-youtube-shorts',
    'can-you-use-copyrighted-music-on-youtube-shorts',
    'vidiq-review',
    'youtube-shorts-content-ideas',
];
for (const slug of keep) exists(path.join(ROOT, 'content/blog', `${slug}.md`), `keep ${slug}`);

const news = [
    ['instagram-reels-hashtags', 'instagram reels hashtags', '/blog/instagram-reels-content-ideas'],
    ['instagram-reels-algorithm', 'instagram reels algorithm', '/blog/instagram-reels-content-ideas'],
    ['youtube-shorts-hashtags-title-vs-description', 'youtube shorts hashtags in title vs description', '/blog/youtube-shorts-hashtags-guide'],
    ['youtube-tags-vs-hashtags', 'youtube tags vs hashtags', '/blog/youtube-shorts-hashtags-guide'],
    ['youtube-seo-tools', 'youtube seo tool', '/blog/vidiq-alternatives'],
];

const sitemap = read(path.join(ROOT, 'sitemap.xml'));
for (const [slug, primary, hub] of news) {
    exists(path.join(ROOT, 'content/blog', `${slug}.md`), `new md ${slug}`);
    exists(path.join(ROOT, 'blog', slug, 'index.html'), `new html ${slug}`);
    const loc = `https://conthunt.app/blog/${slug}`;
    if (sitemap.includes(loc)) ok.push(`sitemap ${slug}`);
    else fail.push(`sitemap missing ${slug}`);
    const html = fs.existsSync(path.join(ROOT, 'blog', slug, 'index.html'))
        ? read(path.join(ROOT, 'blog', slug, 'index.html'))
        : '';
    const blob = html.toLowerCase();
    if (blob.includes(primary)) ok.push(`primary in html ${slug}`);
    else fail.push(`primary missing in html ${slug}: ${primary}`);
    if (html.includes(`href="${hub}"`)) ok.push(`hub link ${slug}`);
    else fail.push(`hub link missing ${slug} -> ${hub}`);
}

if (sitemap.includes('youtube-shorts-content-ideas-beauty')) fail.push('niche clone still in sitemap');
else ok.push('no beauty clone in sitemap');
if (fs.existsSync(path.join(ROOT, 'content/blog/vidiq-alternatives-free.md'))) fail.push('second vidiq slug');
else ok.push('no second vidiq slug');

for (const slug of ['competitor-analysis-tools', 'youtube-tracker']) {
    const html = read(path.join(ROOT, 'blog', slug, 'index.html'));
    if (/<table[\s>]/i.test(html)) ok.push(`table ${slug}`);
    else fail.push(`no table ${slug}`);
}
const tracker = read(path.join(ROOT, 'blog/youtube-tracker/index.html'));
if (/not a live YouTube tracker/i.test(tracker)) ok.push('tracker disclaimer');
else fail.push('tracker missing not-a-live-tracker disclaimer');
if (/ContHunt is a live YouTube tracker/i.test(tracker)) fail.push('fake tracker claim');
else ok.push('no fake tracker claim');

const sameAsNeed = [
    'https://x.com/conthunt',
    'https://www.instagram.com/_conthunt/',
    'https://www.tiktok.com/@cont.hunt',
    'https://www.threads.net/@_conthunt',
    'https://www.reddit.com/user/conthunt',
];
for (const rel of ['index.html', 'about/index.html']) {
    const html = read(path.join(ROOT, rel));
    for (const url of sameAsNeed) {
        if (html.includes(url)) ok.push(`sameAs ${rel} ${url}`);
        else fail.push(`sameAs missing ${rel} ${url}`);
    }
    if (html.includes('instagram.com/conthunt.app')) fail.push(`stale IG handle in ${rel}`);
    else ok.push(`no stale IG in ${rel}`);
    const footer = html.toLowerCase().includes('aria-label="conthunt profiles"')
        ? html.slice(html.toLowerCase().indexOf('aria-label="conthunt profiles"'))
        : '';
    for (const url of sameAsNeed) {
        if (footer.includes(url)) ok.push(`footer ${rel} ${url}`);
        else fail.push(`footer missing ${rel} ${url}`);
    }
    if ((footer.match(/<svg[\s\S]*?<\/svg>/g) || []).length >= 5) ok.push(`footer icons ${rel}`);
    else fail.push(`footer missing svg icons ${rel}`);
    if (footer.includes('width="1em"')) ok.push(`footer icon size 1em ${rel}`);
    else fail.push(`footer icons not 1em ${rel}`);
}

console.log(ok.map((s) => `OK  ${s}`).join('\n'));
if (fail.length) {
    console.error(fail.map((s) => `FAIL ${s}`).join('\n'));
    process.exit(1);
}
console.log(`\n${ok.length} checks passed`);
