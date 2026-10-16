/**
 * schema.org JSON-LD builders (plain objects; render them with <JsonLd> from `@/components/seo/json-ld`).
 *
 * Truthfulness rules for this file:
 * - Facts come from the site's own copy and data modules (plans.ts for offers). Nothing is invented.
 * - No aggregateRating or review markup: the testimonials are unverified (OWNER_DECISIONS C3).
 * - No `sameAs`: the social URLs in `links.ts` are marked `// verify`. Add them here once confirmed.
 * - No contactPoint or email: the support address is also marked `// verify`.
 *
 * Pure module with no `server-only` import, so it can be unit-checked from a script.
 */
import { PLANS, TRIAL_DAYS } from "@/components/sections/pricing/plans";
import type { PostSummary } from "@/lib/blog/types";
import { DOCS_URL, MCP_SERVER_URL, ROUTES } from "@/lib/links";
import { DEFAULT_OG_IMAGE, PRODUCT_SUMMARY, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

export type JsonLdNode = Record<string, unknown>;

/** Stable @id values so nodes on one page reference each other instead of repeating. */
export const IDS = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  software: `${SITE_URL}/#software`,
  blog: `${SITE_URL}/resources#blog`,
} as const;

/** Wraps nodes in one `@graph` document. */
export const graph = (...nodes: JsonLdNode[]): JsonLdNode => ({ "@context": "https://schema.org", "@graph": nodes });

/* ------------------------------------------------------------ organization */

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": IDS.organization,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/icon-ink.png"),
      width: 800,
      height: 800,
    },
    description: PRODUCT_SUMMARY,
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": IDS.website,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": IDS.organization },
  };
}

/* ------------------------------------------------------ software application */

/** One Offer per plan and billing period, from `plans.ts` so the markup always matches the pricing page. */
function planOffers(): JsonLdNode[] {
  const pricingUrl = absoluteUrl(ROUTES.pricing);
  return PLANS.flatMap((plan): JsonLdNode[] => {
    const trial = ` Starts with a ${TRIAL_DAYS}-day free trial.`;
    const base = {
      "@type": "Offer",
      url: pricingUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
    return [
      {
        ...base,
        name: `${plan.name} plan, billed monthly`,
        description: `${plan.blurb}${trial}`,
        price: plan.price.monthly,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.price.monthly,
          priceCurrency: "USD",
          billingDuration: "P1M",
          unitCode: "MON",
        },
      },
      {
        ...base,
        name: `${plan.name} plan, billed yearly`,
        description: `${plan.blurb}${trial}`,
        price: plan.price.yearly * 12,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.price.yearly * 12,
          priceCurrency: "USD",
          billingDuration: "P1Y",
          unitCode: "ANN",
        },
      },
    ];
  });
}

export function softwareApplicationNode(): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    "@id": IDS.software,
    name: SITE_NAME,
    url: SITE_URL,
    description: PRODUCT_SUMMARY,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Short-form video research",
    operatingSystem: "Web",
    inLanguage: "en",
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    softwareHelp: { "@type": "CreativeWork", url: DOCS_URL },
    publisher: { "@id": IDS.organization },
    featureList: [
      "Deep Search: one question, 500 to 1,000 videos analyzed in under five minutes",
      "Coverage of TikTok, Instagram Reels and YouTube Shorts",
      "AI video analysis: hook, content, audience and virality concept",
      "Ranked results scored for relevance to your question",
      "AI boards to save and organize research",
      "Public Viral Now boards across 20 niches",
      "Account and video tracking (experimental)",
      `MCP server for AI agents (${MCP_SERVER_URL})`,
    ],
    offers: planOffers(),
  };
}

/** Home page graph: Organization + WebSite + SoftwareApplication. */
export const homeGraph = (): JsonLdNode => graph(organizationNode(), websiteNode(), softwareApplicationNode());

/* --------------------------------------------------------------- breadcrumbs */

export interface Crumb {
  name: string;
  /** Site path or absolute URL. */
  path: string;
}

export function breadcrumbNode(crumbs: Crumb[], id?: string): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/* --------------------------------------------------------------------- blog */

const BLOG_NAME = `${SITE_NAME} Resources`;

/** Small inline reference to the Blog, so an article graph never points at a node that is not in it. */
const blogRef = (): JsonLdNode => ({
  "@type": "Blog",
  "@id": IDS.blog,
  name: BLOG_NAME,
  url: absoluteUrl(ROUTES.resources),
});

const wordCount = (text: string): number => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Fields of a post the schema needs; `body` is optional so list pages can reuse the builder. */
type PostForSchema = PostSummary & { body?: string };

export function blogPostingNode(post: PostForSchema): JsonLdNode {
  const url = absoluteUrl(ROUTES.article(post.slug));
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [absoluteUrl(post.cover.plate1600)],
    datePublished: post.date,
    // Posts carry one date; there is no separate "updated" field yet.
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author, url: SITE_URL },
    publisher: organizationNode(),
    articleSection: post.category,
    timeRequired: `PT${post.readingMinutes}M`,
    ...(post.body ? { wordCount: wordCount(post.body) } : {}),
    inLanguage: "en",
    isPartOf: blogRef(),
  };
}

/** BlogPosting + BreadcrumbList (Home > Resources > article). */
export function articleGraph(post: PostForSchema): JsonLdNode {
  const url = absoluteUrl(ROUTES.article(post.slug));
  return graph(
    blogPostingNode(post),
    breadcrumbNode(
      [
        { name: "Home", path: ROUTES.home },
        { name: "Resources", path: ROUTES.resources },
        { name: post.title, path: url },
      ],
      `${url}#breadcrumb`,
    ),
  );
}

/** /resources: CollectionPage with an ItemList of articles, the Blog, the publisher and a breadcrumb. */
export function resourcesGraph(posts: PostSummary[]): JsonLdNode {
  const url = absoluteUrl(ROUTES.resources);
  const description =
    "Playbooks, guides and research on short-form video, hooks, formats and virality, from the team behind ContHunt Deep Search.";
  return graph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      name: BLOG_NAME,
      description,
      url,
      inLanguage: "en",
      isPartOf: { "@id": IDS.website },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(ROUTES.article(p.slug)),
          name: p.title,
        })),
      },
    },
    { ...blogRef(), description, inLanguage: "en", publisher: { "@id": IDS.organization } },
    organizationNode(),
    websiteNode(),
    breadcrumbNode(
      [
        { name: "Home", path: ROUTES.home },
        { name: "Resources", path: ROUTES.resources },
      ],
      `${url}#breadcrumb`,
    ),
  );
}
