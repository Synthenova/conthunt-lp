import { IDS, graph, type JsonLdNode } from "@/lib/seo/schema";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";

export type FaqItem = { question: string; answer: string };

export function breadcrumbNode(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqNode(items: readonly FaqItem[]): JsonLdNode | null {
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function collectionHubGraph(opts: {
  path: string;
  name: string;
  description: string;
  breadcrumbName: string;
  items: Array<{ name: string; path: string }>;
}): JsonLdNode {
  const url = absoluteUrl(opts.path);
  return graph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: opts.name,
      description: opts.description,
      isPartOf: { "@id": IDS.website },
      about: { "@id": IDS.software },
    },
    {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: opts.breadcrumbName, path: opts.path },
    ]),
  );
}

export function detailPageGraph(opts: {
  path: string;
  name: string;
  description: string;
  parentName: string;
  parentPath: string;
  breadcrumbName: string;
  faqs?: readonly FaqItem[];
  extraNodes?: JsonLdNode[];
}): JsonLdNode {
  const url = absoluteUrl(opts.path);
  const nodes: JsonLdNode[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: opts.name,
      description: opts.description,
      isPartOf: { "@id": IDS.website },
      publisher: { "@id": IDS.organization },
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: opts.parentName, path: opts.parentPath },
      { name: opts.breadcrumbName, path: opts.path },
    ]),
  ];
  const faq = opts.faqs ? faqNode(opts.faqs) : null;
  if (faq) nodes.push(faq);
  if (opts.extraNodes) nodes.push(...opts.extraNodes);
  return graph(...nodes);
}

export function integrationExtraNodes(opts: {
  path: string;
  name: string;
  summary: string;
  steps: ReadonlyArray<{ title: string; detail: string }>;
}): JsonLdNode[] {
  const url = absoluteUrl(opts.path);
  return [
    {
      "@type": "SoftwareApplication",
      name: `${SITE_NAME} — ${opts.name}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      description: opts.summary,
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    ...(opts.steps.length
      ? [
          {
            "@type": "HowTo",
            name: `How to set up ${opts.name}`,
            description: opts.summary,
            step: opts.steps.map((s, idx) => ({
              "@type": "HowToStep",
              position: idx + 1,
              name: s.title,
              text: s.detail,
            })),
          } as JsonLdNode,
        ]
      : []),
  ];
}

export function simpleWebPageGraph(opts: {
  path: string;
  name: string;
  description: string;
  breadcrumbName: string;
  pageType?: string;
}): JsonLdNode {
  const url = absoluteUrl(opts.path);
  return graph(
    {
      "@type": opts.pageType ?? "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: opts.name,
      description: opts.description,
      isPartOf: { "@id": IDS.website },
      publisher: { "@id": IDS.organization },
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: opts.breadcrumbName, path: opts.path },
    ]),
  );
}
