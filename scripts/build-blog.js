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
    sitemapUrls.push({
        loc: `${DOMAIN}${loc}`,
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
            hero: null
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml);
        console.log(`Generated: ${slug}/index.html`);

        // Add to sitemap
        addToSitemap(`/${slug}`, attributes.updated || new Date().toISOString().split('T')[0], 'monthly', '0.5');
    }
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

// Main Build Function
async function build() {
    sitemapUrls = []; // Reset

    await buildStaticPages();

    console.log('Starting blog build...');

    // 1. Get all markdown files
    const files = glob.sync(`${CONTENT_DIR}/*.md`);
    const posts = [];

    // 2. Process each file
    for (const file of files) {
        const rawContent = fs.readFileSync(file, 'utf8');
        const { attributes, body } = matter(rawContent);

        const slug = path.basename(file, '.md');
        const outputDir = path.join(OUTPUT_DIR, slug);

        // Ensure post directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

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

        // Render Post Page
        const layout = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.ejs'), 'utf8');
        const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.ejs'), 'utf8');

        const renderedPost = ejs.render(postTemplate, postData);
        const finalHtml = ejs.render(layout, {
            body: renderedPost,
            pageTitle: attributes.title,
            description: attributes.description,
            hero: postData.hero
        });

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml);
        console.log(`Generated: blog/${slug}/index.html`);

        // Add to sitemap
        addToSitemap(`/blog/${slug}`, attributes.date ? new Date(attributes.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 'weekly', '0.8');
    }

    // 3. Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Generate Index Page
    const layout = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.ejs'), 'utf8');
    const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.ejs'), 'utf8');

    const renderedIndex = ejs.render(indexTemplate, { posts });
    const finalIndexHtml = ejs.render(layout, {
        body: renderedIndex,
        pageTitle: 'Blog',
        description: 'Latest updates and insights from ContHunt.',
        hero: null
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), finalIndexHtml);
    console.log('Generated: blog/index.html');

    // 5. Generate Sitemap
    generateSitemap();

    console.log('Blog build complete!');
}

build().catch(err => console.error(err));
