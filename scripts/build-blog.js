const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('front-matter');
const markdownIt = require('markdown-it');
const ejs = require('ejs');

const CONTENT_DIR = path.join(__dirname, '../content/blog');
const PAGES_DIR = path.join(__dirname, '../content/pages');
const OUTPUT_DIR = path.join(__dirname, '../blog');
const PUBLIC_DIR = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const RELATED_LOCK_PATH = path.join(__dirname, 'data/related-lock.json');
const AUTHORS_PATH = path.join(__dirname, 'data/authors.json');
const AUTHOR_ASSIGNMENTS_PATH = path.join(__dirname, 'data/author-assignments.json');
const DOMAIN = 'https://conthunt.app';

// Load authors list
function loadAuthors() {
    if (!fs.existsSync(AUTHORS_PATH)) {
        console.warn('[authors] No authors.json found');
        return [];
    }
    try {
        const raw = fs.readFileSync(AUTHORS_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed.authors || [];
    } catch (error) {
        console.warn(`[authors] Failed to parse ${AUTHORS_PATH}: ${error.message}`);
        return [];
    }
}

// Load existing author assignments (to preserve on rebuild)
function loadAuthorAssignments() {
    if (!fs.existsSync(AUTHOR_ASSIGNMENTS_PATH)) {
        return {};
    }
    try {
        const raw = fs.readFileSync(AUTHOR_ASSIGNMENTS_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`[authors] Failed to load assignments: ${error.message}`);
        return {};
    }
}

// Save author assignments (to preserve on rebuild)
function saveAuthorAssignments(assignments) {
    try {
        fs.writeFileSync(AUTHOR_ASSIGNMENTS_PATH, JSON.stringify(assignments, null, 2));
    } catch (error) {
        console.warn(`[authors] Failed to save assignments: ${error.message}`);
    }
}

// Assign author to post - preserves existing or randomly picks new
function assignAuthorToPost(slug, authors, existingAssignments) {
    // If already assigned, return that author
    if (existingAssignments[slug]) {
        return authors.find(a => a.id === existingAssignments[slug]) || authors[0];
    }

    // Randomly pick an author
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];

    // Save the assignment
    existingAssignments[slug] = randomAuthor.id;

    return randomAuthor;
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Initialize Markdown parser
const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// Helper: Calculate Reading Time
function getReadingTime(text) {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute;
    return Math.ceil(minutes);
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function toAbsoluteUrl(value) {
    if (!isNonEmptyString(value)) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/')) return `${DOMAIN}${trimmed}`;
    return null;
}

function stripTrailingSlash(value) {
    if (!isNonEmptyString(value)) return value;
    const trimmed = value.trim();
    if (trimmed === '/') return trimmed;
    if (/^https?:\/\/[^/]+\/$/.test(trimmed)) return trimmed;
    return trimmed.replace(/\/+$/, '');
}

function normalizeCanonicalUrl(value, fallback) {
    if (isNonEmptyString(value)) return stripTrailingSlash(value);
    return stripTrailingSlash(fallback);
}

function normalizeBlogHref(url) {
    if (!isNonEmptyString(url)) return url;
    const trimmed = url.trim();
    const match = trimmed.match(/^https?:\/\/conthunt\.app(\/blog\/[^?#]*)([?#].*)?$/);
    if (match) {
        return `https://conthunt.app${stripTrailingSlash(match[1])}${match[2] || ''}`;
    }
    if (trimmed.startsWith('/blog/')) {
        const pathname = trimmed.split(/[?#]/)[0];
        const suffix = trimmed.slice(pathname.length);
        return `${stripTrailingSlash(pathname)}${suffix}`;
    }
    return trimmed;
}

function getStringArrayOrNull(value) {
    if (!Array.isArray(value)) return null;
    const normalized = value
        .filter(item => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
}

function normalizeFaqItems(value) {
    if (!Array.isArray(value)) return null;

    const items = value
        .filter(item => item && typeof item === 'object')
        .map(item => ({
            question: isNonEmptyString(item.question) ? item.question.trim() : '',
            answer: isNonEmptyString(item.answer) ? item.answer.trim() : ''
        }))
        .filter(item => item.question && item.answer);

    return items.length > 0 ? items : null;
}

function normalizeHowTo(value) {
    if (!value || typeof value !== 'object') return null;
    if (!isNonEmptyString(value.name) || !Array.isArray(value.steps) || value.steps.length === 0) return null;

    const steps = value.steps
        .filter(step => step && typeof step === 'object')
        .map(step => ({
            name: isNonEmptyString(step.name) ? step.name.trim() : '',
            text: isNonEmptyString(step.text) ? step.text.trim() : ''
        }))
        .filter(step => step.name && step.text);

    if (steps.length === 0) return null;

    const howTo = {
        name: value.name.trim(),
        steps
    };

    if (isNonEmptyString(value.description)) {
        howTo.description = value.description.trim();
    }

    if (isNonEmptyString(value.total_time)) {
        howTo.total_time = value.total_time.trim();
    }

    if (
        value.estimated_cost &&
        typeof value.estimated_cost === 'object' &&
        isNonEmptyString(value.estimated_cost.currency) &&
        isNonEmptyString(value.estimated_cost.value)
    ) {
        howTo.estimated_cost = {
            currency: value.estimated_cost.currency.trim(),
            value: value.estimated_cost.value.trim()
        };
    }

    const supply = getStringArrayOrNull(value.supply);
    if (supply) {
        howTo.supply = supply;
    }

    const tool = getStringArrayOrNull(value.tool);
    if (tool) {
        howTo.tool = tool;
    }

    return howTo;
}

function slugifyHeading(text) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function renderContentWithToc(body) {
    const tokens = md.parse(body, {});
    const tocItems = [];
    const slugCounts = {};

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type !== 'heading_open') continue;

        const level = Number(token.tag.slice(1));
        if (level !== 2 && level !== 3) continue;

        const inlineToken = tokens[i + 1];
        if (!inlineToken || inlineToken.type !== 'inline') continue;

        const title = (inlineToken.content || '').trim();
        if (!title) continue;

        const base = slugifyHeading(title) || `section-${tocItems.length + 1}`;
        slugCounts[base] = (slugCounts[base] || 0) + 1;
        const id = slugCounts[base] === 1 ? base : `${base}-${slugCounts[base]}`;

        token.attrSet('id', id);
        tocItems.push({ level, title, id });
    }

    const htmlContent = md.renderer.render(tokens, md.options, {});

    return {
        htmlContent,
        tocItems: tocItems.length >= 2 ? tocItems : null
    };
}

function normalizeAuthorProfile(value) {
    if (!value || typeof value !== 'object') return null;
    if (!isNonEmptyString(value.name)) return null;

    const profile = {
        name: value.name.trim()
    };

    if (isNonEmptyString(value.url)) {
        profile.url = value.url.trim();
        profile.urlAbs = toAbsoluteUrl(value.url);
    }

    if (isNonEmptyString(value.image)) {
        profile.image = value.image.trim();
        profile.imageAbs = toAbsoluteUrl(value.image);
    }

    if (isNonEmptyString(value.job_title)) {
        profile.job_title = value.job_title.trim();
    }

    if (isNonEmptyString(value.description)) {
        profile.description = value.description.trim();
    }

    const sameAs = getStringArrayOrNull(value.same_as);
    if (sameAs) {
        profile.same_as = sameAs;
    }

    return profile;
}

function normalizeVideoItems(value) {
    if (!Array.isArray(value)) return null;

    const validDate = /^\d{4}-\d{2}-\d{2}$/;

    const items = value
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const name = isNonEmptyString(item.name) ? item.name.trim() : '';
            const description = isNonEmptyString(item.description) ? item.description.trim() : '';
            const thumbnail_url = isNonEmptyString(item.thumbnail_url) ? item.thumbnail_url.trim() : '';
            const upload_date = isNonEmptyString(item.upload_date) ? item.upload_date.trim() : '';

            if (!name || !description || !thumbnail_url || !upload_date || !validDate.test(upload_date)) {
                return null;
            }

            const normalized = {
                name,
                description,
                thumbnail_url,
                thumbnail_url_abs: toAbsoluteUrl(thumbnail_url),
                upload_date
            };

            if (isNonEmptyString(item.embed_url)) {
                normalized.embed_url = item.embed_url.trim();
            }

            if (isNonEmptyString(item.content_url)) {
                normalized.content_url = item.content_url.trim();
            }

            if (isNonEmptyString(item.duration)) {
                normalized.duration = item.duration.trim();
            }

            return normalized;
        })
        .filter(Boolean);

    return items.length > 0 ? items : null;
}

function normalizeRelatedLinks(value) {
    if (!Array.isArray(value)) return null;

    const links = value
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const url = isNonEmptyString(item.url) ? item.url.trim() : '';
            const title = isNonEmptyString(item.title) ? item.title.trim() : '';
            if (!url || !title) return null;

            const normalized = {
                url: normalizeBlogHref(url),
                title
            };
            if (isNonEmptyString(item.reason)) {
                normalized.reason = item.reason.trim();
            }
            return normalized;
        })
        .filter(Boolean);

    return links.length > 0 ? links : null;
}

function normalizeAnswerFirst(value) {
    if (isNonEmptyString(value)) {
        return { text: value.trim() };
    }

    if (!value || typeof value !== 'object') return null;
    if (!isNonEmptyString(value.text)) return null;

    const normalized = {
        text: value.text.trim()
    };

    if (isNonEmptyString(value.label)) {
        normalized.label = value.label.trim();
    }

    return normalized;
}

function normalizeSourceItems(value) {
    if (!Array.isArray(value)) return null;

    const items = value
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const title = isNonEmptyString(item.title) ? item.title.trim() : '';
            const url = isNonEmptyString(item.url) ? item.url.trim() : '';
            if (!title || !url) return null;

            const normalizedUrl = normalizeBlogHref(url);
            const normalized = {
                title,
                url: normalizedUrl,
                urlAbs: toAbsoluteUrl(normalizedUrl)
            };

            if (isNonEmptyString(item.publisher)) {
                normalized.publisher = item.publisher.trim();
            }

            if (isNonEmptyString(item.published_date)) {
                normalized.published_date = item.published_date.trim();
            }

            return normalized;
        })
        .filter(Boolean);

    return items.length > 0 ? items : null;
}

function normalizeExpertQuotes(value) {
    if (!Array.isArray(value)) return null;

    const quotes = value
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const quote = isNonEmptyString(item.quote) ? item.quote.trim() : '';
            const name = isNonEmptyString(item.name) ? item.name.trim() : '';
            if (!quote || !name) return null;

            const normalized = { quote, name };

            if (isNonEmptyString(item.title)) {
                normalized.title = item.title.trim();
            }

            if (isNonEmptyString(item.source_url)) {
                normalized.source_url = item.source_url.trim();
                normalized.source_url_abs = toAbsoluteUrl(item.source_url);
            }

            return normalized;
        })
        .filter(Boolean);

    return quotes.length > 0 ? quotes : null;
}

function normalizeStatItems(value) {
    if (!Array.isArray(value)) return null;

    const stats = value
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const label = isNonEmptyString(item.label) ? item.label.trim() : '';
            const valueText = isNonEmptyString(item.value) ? item.value.trim() : '';
            if (!label || !valueText) return null;

            const normalized = {
                label,
                value: valueText
            };

            if (isNonEmptyString(item.context)) {
                normalized.context = item.context.trim();
            }

            if (isNonEmptyString(item.source_url)) {
                normalized.source_url = item.source_url.trim();
                normalized.source_url_abs = toAbsoluteUrl(item.source_url);
            }

            return normalized;
        })
        .filter(Boolean);

    return stats.length > 0 ? stats : null;
}

function collectSchemaValidationWarnings(attributes, postData) {
    const warnings = [];

    if (attributes.faq_items && !postData.faqSchemaItems) {
        warnings.push('invalid faq_items');
    }

    if (attributes.howto && !postData.howToSchema) {
        warnings.push('invalid howto');
    }

    if (attributes.video_items && !postData.videoSchemaItems) {
        warnings.push('invalid video_items');
    }

    if (attributes.answer_first && !postData.answerFirst) {
        warnings.push('invalid answer_first');
    }

    if (attributes.sources && !postData.sourceItems) {
        warnings.push('invalid sources');
    }

    if (attributes.expert_quotes && !postData.expertQuotes) {
        warnings.push('invalid expert_quotes');
    }

    if (attributes.stat_items && !postData.statItems) {
        warnings.push('invalid stat_items');
    }

    return warnings;
}

// Global array to store all URLs for sitemap
let sitemapUrls = []; // { loc: string, lastmod: string, changefreq: string, priority: string }
let linkCounts = {}; // { slug: count } - Tracks inbound links for "fairness"

function loadRelatedLockMap() {
    if (!fs.existsSync(RELATED_LOCK_PATH)) return {};

    try {
        const raw = fs.readFileSync(RELATED_LOCK_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

        const normalized = {};
        for (const [slug, slugs] of Object.entries(parsed)) {
            if (!Array.isArray(slugs)) continue;
            const cleaned = slugs
                .filter(item => typeof item === 'string')
                .map(item => item.trim())
                .filter(Boolean);
            if (cleaned.length > 0) {
                normalized[slug] = cleaned;
            }
        }
        return normalized;
    } catch (error) {
        console.warn(`[related-lock] Failed to parse ${RELATED_LOCK_PATH}: ${error.message}`);
        return {};
    }
}

function mergeLockedRelatedPosts(currentPost, fallbackRelatedPosts, postsBySlug, relatedLockMap, limit = 10) {
    const lockedSlugs = relatedLockMap[currentPost.slug];
    if (!Array.isArray(lockedSlugs) || lockedSlugs.length === 0) {
        return fallbackRelatedPosts.slice(0, limit);
    }

    const merged = [];
    const used = new Set();

    for (const slug of lockedSlugs) {
        if (slug === currentPost.slug || used.has(slug)) continue;
        const post = postsBySlug.get(slug);
        if (!post) continue;
        merged.push(post);
        used.add(slug);
        if (merged.length >= limit) return merged;
    }

    for (const post of fallbackRelatedPosts) {
        if (!post || post.slug === currentPost.slug || used.has(post.slug)) continue;
        merged.push(post);
        used.add(post.slug);
        if (merged.length >= limit) break;
    }

    return merged;
}

function cleanGeneratedBlogOutput() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        return;
    }

    for (const name of fs.readdirSync(OUTPUT_DIR)) {
        fs.rmSync(path.join(OUTPUT_DIR, name), { recursive: true, force: true });
    }
}

function addToSitemap(loc, lastmod = new Date().toISOString().split('T')[0], changefreq = 'weekly', priority = '0.8') {
    // Ensure no trailing slash for consistency with Google Indexing
    const cleanLoc = loc.endsWith('/') && loc !== '/' ? loc.slice(0, -1) : loc;

    sitemapUrls.push({
        loc: `${DOMAIN}${cleanLoc}`,
        lastmod,
        changefreq,
        priority
    });
}

// Build Static Pages (e.g., Privacy, Terms)
async function buildStaticPages() {
    console.log('Starting static pages build...');
    if (!fs.existsSync(PAGES_DIR)) return;

    const files = glob.sync(`${PAGES_DIR}/*.md`);
    for (const file of files) {
        const rawContent = fs.readFileSync(file, 'utf8');
        const { attributes, body } = matter(rawContent);

        const slug = path.basename(file, '.md');
        const outputDir = path.join(PUBLIC_DIR, slug);

        // Ensure page directory exists (e.g. /privacy)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const htmlContent = md.render(body);

        const pageContent = `
        <article class="max-w-3xl mx-auto px-6">
            <header class="text-center mb-16">
                <h1 class="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                    ${attributes.title}
                </h1>
                ${attributes.updated ? `<p class="text-neutral-500">Last updated: ${attributes.updated}</p>` : ''}
            </header>
            <div class="prose-enhanced">
                ${htmlContent}
            </div>
        </article>
        `;

        const layout = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.ejs'), 'utf8');
        const finalHtml = ejs.render(layout, {
            body: pageContent,
            pageTitle: attributes.title,
            description: attributes.description || attributes.title,
            hero: null,
            canonical: `${DOMAIN}/${slug}`, // No trailing slash
            resolvedKeywords: null,
            authorProfile: null
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml);
        console.log(`Generated: ${slug}/index.html`);

        // Add to sitemap
        addToSitemap(`/${slug}`, attributes.updated || new Date().toISOString().split('T')[0], 'monthly', '0.5');
    }
}

// Find related posts based on shared tags, prioritizing "fairness" (low link count) and stability (date)
function findRelatedPosts(currentPost, allPosts, limit = 10) {
    // 1. Calculate Score for ALL other posts
    const candidates = allPosts
        .filter(p => p.slug !== currentPost.slug)
        .map(post => {
            const sharedTags = (currentPost.tags && post.tags)
                ? post.tags.filter(t => currentPost.tags.includes(t))
                : [];

            return {
                post,
                score: sharedTags.length,
            };
        });

    // 2. Sort candidates using deterministic tie-breakers
    // Priority:
    // 1. Relevance: Higher tag overlap is better (descending)
    // 2. Fairness: Lower link count is better (ascending)
    // 3. Stability: Newer posts win ties (descending date)
    candidates.sort((a, b) => {
        // Primary: Tag Score (High to Low)
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        // Secondary: Link Count (Low to High)
        const countA = linkCounts[a.post.slug] || 0;
        const countB = linkCounts[b.post.slug] || 0;
        if (countA !== countB) {
            return countA - countB;
        }

        // Tertiary: Date (New to Old) - Deterministic Stability
        // Using date string comparison (ISO dates work well for this)
        return new Date(b.post.date) - new Date(a.post.date);
    });

    // 3. Select top N
    const related = candidates.slice(0, limit).map(item => item.post);

    // 4. Update Global Link Counts
    related.forEach(post => {
        linkCounts[post.slug] = (linkCounts[post.slug] || 0) + 1;
    });

    return related;
}

// Generate RSS Feed
function generateRSS(posts) {
    console.log('Generating rss.xml...');

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ContHunt Blog</title>
    <link>https://conthunt.app/blog</link>
    <description>Latest insights, tutorials, and updates from ContHunt.</description>
    <language>en-us</language>
    <atom:link href="https://conthunt.app/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://conthunt.app/blog/${post.slug}</link>
      <description><![CDATA[${post.excerpt || post.description || ''}]]></description>
      <category>${post.category || 'Content Strategy'}</category>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://conthunt.app/blog/${post.slug}</guid>
    </item>`).join('\n')}
  </channel>
</rss>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rssContent);
    console.log('Generated: rss.xml');
}

// Generate Sitemap XML
function generateSitemap() {
    console.log('Generating sitemap.xml...');

    const staticRoutes = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/blog', priority: '0.9', changefreq: 'daily' }
    ];

    const today = new Date().toISOString().split('T')[0];

    // Prepend static routes
    for (const route of staticRoutes) {
        sitemapUrls.unshift({
            loc: `${DOMAIN}${route.loc}`,
            lastmod: today,
            changefreq: route.changefreq,
            priority: route.priority
        });
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent);
    console.log('Generated: sitemap.xml');
}

// Ping Google that sitemap updated
function pingGoogleSitemap() {
    console.log('Pinging Google sitemap...');
    fetch('https://www.google.com/ping?sitemap=https://conthunt.app/sitemap.xml')
        .then(() => console.log('Google ping successful'))
        .catch(err => console.log('Google ping failed (non-critical):', err.message));
}

// Main Build Function
async function build() {
    sitemapUrls = []; // Reset
    linkCounts = {}; // Reset global link tracker
    cleanGeneratedBlogOutput();

    // Load authors and existing assignments
    const authors = loadAuthors();
    const authorAssignments = loadAuthorAssignments();
    console.log(`[authors] Loaded ${authors.length} authors`);

    await buildStaticPages();

    console.log('Starting blog build...');

    // 1. Get all markdown files
    const files = glob.sync(`${CONTENT_DIR}/*.md`);
    const posts = [];

    // 2. First pass: collect all post data (no rendering yet)
    for (const file of files) {
        const rawContent = fs.readFileSync(file, 'utf8');
        const { attributes, body } = matter(rawContent);

        const slug = path.basename(file, '.md');

        const renderedContent = renderContentWithToc(body);
        let htmlContent = renderedContent.htmlContent;

        // Simple replace for common image paths
        htmlContent = htmlContent.replace(/src="\/images\//g, 'src="/public/images/');
        // Normalize internal blog links to no-trailing-slash form
        htmlContent = htmlContent.replace(/href="\/blog\/([^"#?\/]+)\/(?=["?#]?)/g, 'href="/blog/$1');
        htmlContent = htmlContent.replace(/href="https?:\/\/conthunt\.app\/blog\/([^"#?\/]+)\/(?=["?#]?)/g, 'href="https://conthunt.app/blog/$1');
        htmlContent = htmlContent.replace(/href="https?:\/\/conthunt\.app\/blog\/(?=["?#]?)/g, 'href="https://conthunt.app/blog');

        // Assign author to post (preserve existing or randomly pick)
        const assignedAuthor = authors.length > 0
            ? assignAuthorToPost(slug, authors, authorAssignments)
            : null;

        const postData = {
            ...attributes,
            slug,
            content: htmlContent,
            readingTime: getReadingTime(body),
            resolvedKeywords: getStringArrayOrNull(attributes.meta_keywords)
                || getStringArrayOrNull(attributes.secondary_keywords),
            tags: getStringArrayOrNull(attributes.tags) || [],
            updated: attributes.updated || null,
            canonical: normalizeCanonicalUrl(attributes.canonical, `${DOMAIN}/blog/${slug}`),
            faqSchemaItems: normalizeFaqItems(attributes.faq_items),
            howToSchema: normalizeHowTo(attributes.howto),
            authorProfile: normalizeAuthorProfile(attributes.author_profile),
            videoSchemaItems: normalizeVideoItems(attributes.video_items),
            relatedLinks: normalizeRelatedLinks(attributes.related_links),
            tocItems: renderedContent.tocItems,
            answerFirst: normalizeAnswerFirst(attributes.answer_first),
            sourceItems: normalizeSourceItems(attributes.sources),
            expertQuotes: normalizeExpertQuotes(attributes.expert_quotes),
            statItems: normalizeStatItems(attributes.stat_items),
            hero: (attributes.hero || attributes.image) ? (attributes.hero || attributes.image)
                .replace(/^https:\/\/conthunt\.app\/images\//, '/public/images/')
                .replace(/^\/images\//, '/public/images/')
                : null,
            // Author assignment for E-E-A-T
            author: assignedAuthor || null
        };

        const validationWarnings = collectSchemaValidationWarnings(attributes, postData);
        if (validationWarnings.length > 0) {
            console.log(`[schema:warn] ${slug}: ${validationWarnings.join('; ')}`);
        }

        posts.push(postData);
    }

    // 3. Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const postsBySlug = new Map(posts.map(post => [post.slug, post]));
    const relatedLockMap = loadRelatedLockMap();

    // 4. Attach related posts to each post (must be after sorting)
    posts.forEach(post => {
        const fallbackRelated = findRelatedPosts(post, posts, 10);
        post.relatedPosts = mergeLockedRelatedPosts(
            post,
            fallbackRelated,
            postsBySlug,
            relatedLockMap,
            10
        );
    });

    // 5. Second pass: render each post (now with relatedPosts available)
    for (const postData of posts) {
        const outputDir = path.join(OUTPUT_DIR, postData.slug);

        // Ensure post directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Render Post Page
        const layout = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.ejs'), 'utf8');
        const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.ejs'), 'utf8');

        // Allow overrides from frontmatter, otherwise default to standard format
        const canonicalUrl = normalizeCanonicalUrl(postData.canonical, `${DOMAIN}/blog/${postData.slug}`);

        const renderedPost = ejs.render(postTemplate, postData);
        const finalHtml = ejs.render(layout, {
            body: renderedPost,
            pageTitle: postData.title,
            description: postData.description,
            hero: postData.hero,
            canonical: canonicalUrl,
            isBlogPost: true,
            date: postData.date,
            updated: postData.updated,
            author: postData.author,
            resolvedKeywords: postData.resolvedKeywords,
            authorProfile: postData.authorProfile
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml);
        console.log(`Generated: blog/${postData.slug}/index.html`);

        // Add to sitemap
        addToSitemap(`/blog/${postData.slug}`, postData.date ? new Date(postData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 'weekly', '0.8');
    }

    // 6. Generate Index Page
    const layout = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.ejs'), 'utf8');
    const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.ejs'), 'utf8');

    const renderedIndex = ejs.render(indexTemplate, { posts });
    const finalIndexHtml = ejs.render(layout, {
        body: renderedIndex,
        pageTitle: 'Blog',
        description: 'Latest updates and insights from ContHunt.',
        hero: null,
        canonical: `${DOMAIN}/blog`,
        resolvedKeywords: null,
        authorProfile: null
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), finalIndexHtml);
    console.log('Generated: blog/index.html');

    // 7. Generate Sitemap
    generateSitemap();

    // 8. Generate RSS Feed
    generateRSS(posts);

    // 9. Save author assignments (persist across rebuilds)
    saveAuthorAssignments(authorAssignments);

    // 10. Ping Google (async, don't block)
    setTimeout(() => pingGoogleSitemap(), 1000);

    console.log('Blog build complete!');
}

build().catch(err => console.error(err));
