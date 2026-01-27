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
const DOMAIN = 'https://conthunt.app';

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

// Global array to store all URLs for sitemap
let sitemapUrls = []; // { loc: string, lastmod: string, changefreq: string, priority: string }

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
            canonical: `${DOMAIN}/${slug}` // No trailing slash
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml);
        console.log(`Generated: ${slug}/index.html`);

        // Add to sitemap
        addToSitemap(`/${slug}`, attributes.updated || new Date().toISOString().split('T')[0], 'monthly', '0.5');
    }
}

// Find related posts based on shared tags
function findRelatedPosts(currentPost, allPosts, limit = 3) {
    if (!currentPost.tags || !Array.isArray(currentPost.tags)) return [];

    const scored = allPosts
        .filter(p => p.slug !== currentPost.slug)
        .map(post => {
            const sharedTags = post.tags?.filter(t => currentPost.tags.includes(t)) || [];
            return {
                post,
                score: sharedTags.length
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.post);

    return scored;
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

        let htmlContent = md.render(body);

        // Simple replace for common image paths
        htmlContent = htmlContent.replace(/src="\/images\//g, 'src="/public/images/');

        const postData = {
            ...attributes,
            slug,
            content: htmlContent,
            readingTime: getReadingTime(body),
            hero: (attributes.hero || attributes.image) ? (attributes.hero || attributes.image)
                .replace(/^https:\/\/conthunt\.app\/images\//, '/public/images/')
                .replace(/^\/images\//, '/public/images/')
                : null
        };

        posts.push(postData);
    }

    // 3. Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Attach related posts to each post (must be after sorting)
    posts.forEach(post => {
        post.relatedPosts = findRelatedPosts(post, posts, 3);
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
        const canonicalUrl = postData.canonical || `${DOMAIN}/blog/${postData.slug}`;

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
            author: postData.author
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
        canonical: `${DOMAIN}/blog`
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), finalIndexHtml);
    console.log('Generated: blog/index.html');

    // 7. Generate Sitemap
    generateSitemap();

    // 8. Generate RSS Feed
    generateRSS(posts);

    // 9. Ping Google (async, don't block)
    setTimeout(() => pingGoogleSitemap(), 1000);

    console.log('Blog build complete!');
}

build().catch(err => console.error(err));
