# P1 — Homepage Schema Markup for ContHunt

## What This Is
Ready-to-paste JSON-LD structured data for `conthunt.app`. Add these to the `<head>` section of the homepage. These schemas enable rich snippets in Google, AI Overview citations, and product visibility in ChatGPT/Perplexity.

## Current State
✅ Blog posts already have: `WebSite`, `Article`, `BreadcrumbList`, `FAQPage`, `HowTo`
❌ Homepage is MISSING: `SoftwareApplication`, `Organization`, `Product/Offer`

---

## Schema 1: SoftwareApplication (Homepage)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ContHunt",
  "url": "https://conthunt.app",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI-powered content discovery and competitive analysis platform. Find viral content, analyze competitors, and discover trending topics across YouTube, TikTok, and Instagram.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "49",
    "offerCount": "3",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Basic content discovery and search"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "19",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "billingDuration": "P1M"
        },
        "description": "Advanced analytics, competitor tracking, and AI chat"
      },
      {
        "@type": "Offer",
        "name": "Team",
        "price": "49",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "billingDuration": "P1M"
        },
        "description": "Full platform access with team collaboration"
      }
    ]
  },
  "featureList": [
    "AI-powered content search across YouTube, TikTok, and Instagram",
    "Competitive content analysis",
    "Viral content discovery",
    "Trending topic identification",
    "Cross-platform analytics",
    "AI chat assistant for content strategy"
  ],
  "screenshot": "https://conthunt.app/og-image.png",
  "softwareVersion": "2.0",
  "datePublished": "2025-01-01",
  "creator": {
    "@type": "Organization",
    "name": "Synthenova"
  }
}
</script>
```

## Schema 2: Organization (Homepage)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Synthenova",
  "url": "https://conthunt.app",
  "logo": "https://conthunt.app/logo.png",
  "description": "Building AI-powered tools for content creators and marketers. Creators of ContHunt — the content intelligence platform.",
  "foundingDate": "2025",
  "sameAs": [
    "https://twitter.com/conthunt",
    "https://www.producthunt.com/products/conthunt"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@conthunt.app"
  },
  "brand": {
    "@type": "Brand",
    "name": "ContHunt",
    "description": "AI-powered content discovery platform"
  }
}
</script>
```

## Schema 3: Product (For Pricing Section/Page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ContHunt Pro",
  "description": "AI-powered content discovery and competitive analysis. Search across YouTube, TikTok, and Instagram. Get trending content, competitor insights, and AI-driven content strategy recommendations.",
  "brand": {
    "@type": "Brand",
    "name": "ContHunt"
  },
  "category": "Content Marketing Software",
  "url": "https://conthunt.app/#pricing",
  "offers": {
    "@type": "Offer",
    "price": "19",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "19",
      "priceCurrency": "USD",
      "billingDuration": "P1M",
      "unitText": "month"
    }
  }
}
</script>
```

## Implementation Notes

1. **Pricing values** — Update the actual prices (`0`, `19`, `49`) to match your current pricing tiers
2. **Logo URL** — Replace `https://conthunt.app/logo.png` with the actual logo path
3. **Social links** — Add real Twitter/X, LinkedIn, Product Hunt URLs in `sameAs`
4. **Email** — Update support email if different
5. **Screenshot** — Use an actual product screenshot URL for the `screenshot` field
6. **Validation** — After adding, test at https://validator.schema.org/ and https://search.google.com/test/rich-results

## Why This Matters

- `SoftwareApplication` → enables product-rich snippets in Google search
- `Organization` → builds entity authority (Google Knowledge Panel potential)
- `Product` → AI platforms (ChatGPT, Perplexity) cite pricing pages with Product schema
- Combined: makes ContHunt a recognized "entity" to search engines and AI crawlers
