/**
 * Creates the nine landing dashboards from the landing analytics plan.
 *
 *   POSTHOG_PERSONAL_API_KEY=phx_... POSTHOG_PROJECT_ID=12345 node scripts/create-posthog-dashboards.mjs
 *
 * The public project key in the site cannot create dashboards. This script does nothing
 * without both variables, and it is not part of the site build or the unit tests.
 * Run it after the events have been in production for a few days. App steps stay on
 * dashboard 9 and read zero until the app emits them.
 */
const KEY = process.env.POSTHOG_PERSONAL_API_KEY || "";
const PROJECT = process.env.POSTHOG_PROJECT_ID || "";
const HOST = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/+$/, "");

if (!KEY || !PROJECT) {
  console.error(
    "PostHog dashboards were not created. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID, then run this script again. The public phc_ project key cannot create dashboards.",
  );
  process.exit(2);
}

const RANGE = { date_from: "-30d" };
const MARKETING = prop("site_area", "marketing");

function prop(key, value, operator = "exact") {
  return { key, value, operator, type: "event" };
}

function trends(name, { event, math = "dau", breakdowns = [], properties = [], formula, series }) {
  const source = {
    kind: "TrendsQuery",
    series: series || [{ kind: "EventsNode", event, math, name: event, properties }],
    dateRange: RANGE,
    interval: "day",
    filterTestAccounts: true,
    properties: series ? properties : [],
  };
  if (breakdowns.length) {
    source.breakdownFilter = {
      breakdowns: breakdowns.map((property) => ({ property, type: "event" })),
    };
  }
  if (formula) source.trendsFilter = { formula };
  return { name, query: { kind: "InsightVizNode", source } };
}

function funnel(name, steps, { breakdown } = {}) {
  const source = {
    kind: "FunnelsQuery",
    series: steps.map((step) => ({
      kind: "EventsNode",
      event: step.event,
      name: step.name || step.event,
      properties: step.properties || [],
    })),
    dateRange: RANGE,
    filterTestAccounts: true,
    funnelsFilter: { funnelWindowInterval: 14, funnelWindowIntervalUnit: "day" },
  };
  if (breakdown) source.breakdownFilter = { breakdowns: [{ property: breakdown, type: "event" }] };
  return { name, query: { kind: "InsightVizNode", source } };
}

function sql(name, query) {
  return {
    name,
    query: { kind: "DataVisualizationNode", source: { kind: "HogQLQuery", query } },
  };
}

const INTENT = `event IN ('hero_search_submitted', 'viral_outbound_clicked')
      OR (event = 'cta_clicked' AND properties.destination IN ('app', 'login'))
      OR (event = 'copy_succeeded' AND startsWith(toString(properties.target), 'mcp'))`;

const CONVERTERS = `SELECT
  person.properties.email AS email,
  person.properties.$initial_utm_source AS utm_source,
  person.properties.$initial_utm_medium AS utm_medium,
  person.properties.$initial_utm_campaign AS utm_campaign,
  argMinIf(properties.query, timestamp, event = 'hero_search_submitted') AS landing_query,
  argMinIf(properties.query_source, timestamp, event = 'hero_search_submitted') AS query_source,
  argMinIf(properties.placement, timestamp, event = 'cta_clicked' AND properties.destination IN ('app', 'login')) AS first_cta,
  argMinIf(properties.plan, timestamp, event = 'cta_clicked' AND properties.plan IS NOT NULL) AS plan,
  minIf(timestamp, event = 'signup_completed') AS signed_up_at
FROM events
WHERE person.properties.email IS NOT NULL
  AND person_id IN (
    SELECT person_id FROM events
    WHERE event = '$pageview' AND properties.$host = 'conthunt.app'
  )
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY email, utm_source, utm_medium, utm_campaign
ORDER BY signed_up_at DESC
LIMIT 500`;

const DASHBOARDS = [
  {
    name: "1. Acquisition",
    description: "Who arrived, from where, and whether the visit did anything. Marketing tiles exclude the legacy blog.",
    insights: [
      trends("Traffic", { event: "$pageview", breakdowns: ["site_area"] }),
      trends("Referrers", { event: "$pageview", breakdowns: ["$referring_domain"], properties: [MARKETING] }),
      trends("Campaigns", { event: "$pageview", breakdowns: ["utm_campaign", "utm_source"], properties: [MARKETING] }),
      sql(
        "Bounce, engaged, and intent rates",
        `SELECT
  count(DISTINCT if(event = 'page_exit' AND properties.bounce = true AND properties.site_area = 'marketing', person_id, NULL))
    / count(DISTINCT if(event = '$pageview' AND properties.site_area = 'marketing', person_id, NULL)) AS bounce_rate,
  count(DISTINCT if(event = 'page_exit' AND properties.engaged = true AND properties.site_area = 'marketing', person_id, NULL))
    / count(DISTINCT if(event = '$pageview' AND properties.site_area = 'marketing', person_id, NULL)) AS engaged_rate,
  count(DISTINCT if(${INTENT} AND properties.site_area = 'marketing', person_id, NULL))
    / count(DISTINCT if(event = '$pageview' AND properties.site_area = 'marketing', person_id, NULL)) AS intent_rate
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY`,
      ),
      sql(
        "Campaign funnel",
        `SELECT
  properties.utm_campaign AS utm_campaign,
  count(DISTINCT if(event = '$pageview' AND properties.site_area = 'marketing', person_id, NULL)) AS pageviews,
  count(DISTINCT if(event = 'page_exit' AND properties.engaged = true AND properties.site_area = 'marketing', person_id, NULL)) AS engaged,
  count(DISTINCT if(${INTENT} AND properties.site_area = 'marketing', person_id, NULL)) AS intent,
  count(DISTINCT if(event = 'outbound_app' AND properties.site_area = 'marketing', person_id, NULL)) AS handoffs
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY utm_campaign
ORDER BY pageviews DESC
LIMIT 100`,
      ),
    ],
  },
  {
    name: "2. Homepage attention",
    description: "Where time goes on the homepage. Filter is page_type = home.",
    insights: [
      trends("Section reach", {
        event: "section_viewed",
        breakdowns: ["section"],
        properties: [prop("page_type", "home")],
      }),
      sql(
        "Median section time",
        `SELECT
  properties.section AS section,
  median(toFloat(properties.visible_ms)) / 1000 AS median_seconds
FROM events
WHERE event = 'section_dwell'
  AND properties.page_type = 'home'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY section
ORDER BY median_seconds DESC`,
      ),
      sql(
        "Section value",
        `SELECT
  properties.section AS section,
  count(DISTINCT person_id) AS viewers,
  median(toFloat(properties.visible_ms)) / 1000 AS median_seconds
FROM events
WHERE event = 'section_dwell'
  AND properties.page_type = 'home'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY section
ORDER BY median_seconds DESC`,
      ),
      sql(
        "Section drop-off",
        `SELECT section, viewers, viewers - neighbor(viewers, 1) AS drop_off
FROM (
  SELECT properties.section AS section, count(DISTINCT person_id) AS viewers
  FROM events
  WHERE event = 'section_viewed' AND properties.page_type = 'home' AND timestamp >= now() - INTERVAL 30 DAY
  GROUP BY section
)
ORDER BY viewers DESC`,
      ),
    ],
  },
  {
    name: "3. CTA placement",
    description: "Which exit, and the homepage search text.",
    insights: [
      trends("Clicks by place", { event: "cta_clicked", breakdowns: ["placement"] }),
      trends("Handoffs by place", { event: "outbound_app", breakdowns: ["placement"] }),
      sql(
        "Hero queries",
        `SELECT
  properties.query AS query,
  properties.query_source AS query_source,
  properties.example_index AS example_index,
  count() AS count,
  max(timestamp) AS last_seen
FROM events
WHERE event = 'hero_search_submitted' AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY query, query_source, example_index
ORDER BY count DESC
LIMIT 200`,
      ),
      trends("Typed versus example", { event: "hero_search_submitted", breakdowns: ["query_source"] }),
      funnel("Hero funnel", [
        { event: "hero_prompt_focused" },
        { event: "hero_search_submitted" },
        { event: "outbound_app", properties: [prop("placement", "hero_submit")] },
      ]),
      trends("Button versus submit", {
        event: "outbound_app",
        breakdowns: ["placement"],
        properties: [prop("placement", ["hero_button", "hero_submit"], "exact")],
      }),
    ],
  },
  {
    name: "4. Pricing",
    description: "Billing, plan clicks, and the calculator recommendation.",
    insights: [
      trends("Billing mix", { event: "billing_toggled", breakdowns: ["billing", "surface"] }),
      trends("Plan clicks", {
        event: "cta_clicked",
        breakdowns: ["plan", "placement"],
        properties: [prop("plan", "is set", "is_set")],
      }),
      trends("Recommendations", { event: "calculator_recommendation", breakdowns: ["plan"] }),
      funnel("Calculator to click", [
        { event: "calculator_recommendation" },
        { event: "cta_clicked", properties: [prop("placement", "calculator")] },
      ], { breakdown: "plan" }),
      sql(
        "Recommended versus clicked",
        `SELECT
  person_id,
  argMaxIf(properties.plan, timestamp, event = 'calculator_recommendation') AS recommended_plan,
  argMaxIf(properties.plan, timestamp, event = 'cta_clicked' AND properties.placement = 'calculator') AS clicked_plan
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
  AND event IN ('calculator_recommendation', 'cta_clicked')
GROUP BY person_id
HAVING recommended_plan != ''
LIMIT 500`,
      ),
      trends("Use cases", { event: "calculator_recommendation", breakdowns: ["use_cases"] }),
    ],
  },
  {
    name: "5. Viral Now",
    description: "Niches, video opens, outbound plays, and live feed failures. Filter is page_type = viral_now.",
    insights: [
      trends("Niches", { event: "viral_niche_selected", breakdowns: ["niche"], properties: [prop("page_type", "viral_now")] }),
      trends("Opens", { event: "viral_video_opened", breakdowns: ["platform"], properties: [prop("page_type", "viral_now")] }),
      trends("Outbound", { event: "viral_outbound_clicked", breakdowns: ["platform"], properties: [prop("page_type", "viral_now")] }),
      funnel("Path", [
        { event: "viral_niche_selected" },
        { event: "viral_video_opened" },
        { event: "viral_outbound_clicked" },
        { event: "cta_clicked", properties: [prop("placement", "viral_", "icontains")] },
      ]),
      trends("Live failures", { event: "viral_live_failed", math: "total", breakdowns: ["stage", "status"] }),
    ],
  },
  {
    name: "6. Content",
    description: "Resources articles and the legacy blog.",
    insights: [
      trends("Views", {
        event: "$pageview",
        properties: [prop("page_type", ["article", "blog_post", "blog_index"], "exact")],
      }),
      trends("Qualified reads", { event: "article_read", breakdowns: ["slug", "surface"] }),
      sql(
        "Read rate",
        `SELECT
  count(DISTINCT if(event = 'article_read', person_id, NULL))
    / count(DISTINCT if(event = '$pageview' AND properties.page_type IN ('article', 'blog_post'), person_id, NULL)) AS read_rate
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY`,
      ),
      trends("Contents", { event: "toc_clicked", math: "total", breakdowns: ["heading_id"] }),
      trends("Content CTAs", {
        event: "cta_clicked",
        breakdowns: ["placement"],
        properties: [prop("placement", ["article_cta", "resources_cta", "blog"], "exact")],
      }),
      trends("Filters", { event: "resources_filtered", breakdowns: ["category"] }),
    ],
  },
  {
    name: "7. Docs",
    description: "Empty until the docs script is deployed. Tiles stay in place.",
    insights: [
      trends("Doc views", { event: "$pageview", breakdowns: ["$pathname"], properties: [prop("page_type", "docs")] }),
      trends("Copies", { event: "copy_succeeded", breakdowns: ["target", "client"] }),
      funnel("Install funnel", [
        { event: "$pageview", properties: [prop("page_type", "docs")] },
        { event: "copy_succeeded", properties: [prop("target", "mcp", "icontains")] },
        { event: "outbound_app" },
      ]),
    ],
  },
  {
    name: "8. Health",
    description: "Web vitals from the SDK $web_vitals event, exceptions, Viral Now failures, and unknown URLs.",
    insights: [
      sql(
        "Web vitals p75",
        `SELECT
  properties.$pathname AS pathname,
  quantile(0.75)(toFloat(properties.$web_vitals_LCP_value)) AS lcp_p75,
  quantile(0.75)(toFloat(properties.$web_vitals_INP_value)) AS inp_p75,
  quantile(0.75)(toFloat(properties.$web_vitals_CLS_value)) AS cls_p75
FROM events
WHERE event = '$web_vitals' AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY pathname
ORDER BY lcp_p75 DESC
LIMIT 100`,
      ),
      sql(
        "Exceptions",
        `SELECT properties.path AS path, properties.message AS message, count() AS count
FROM events
WHERE event = 'client_exception' AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY path, message
ORDER BY count DESC
LIMIT 200`,
      ),
      trends("Viral Now failures", { event: "viral_live_failed", math: "total", breakdowns: ["stage", "status"] }),
      sql(
        "Unknown URLs",
        `SELECT properties.path AS path, count() AS count
FROM events
WHERE event = 'not_found' AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY path
ORDER BY count DESC
LIMIT 200`,
      ),
    ],
  },
  {
    name: "9. Full funnel and converters",
    description:
      "The last four steps read zero until the app emits them. A Get started click is outbound_app, not a signup. If person.properties.email is nested differently in this project, fix the path. Do not drop email, landing query, UTM, or first CTA.",
    insights: [
      sql(
        "Full funnel",
        `SELECT
  count(DISTINCT if(event = '$pageview' AND properties.$host = 'conthunt.app', person_id, NULL)) AS landing,
  count(DISTINCT if(${INTENT}, person_id, NULL)) AS intent,
  count(DISTINCT if(event = 'outbound_app', person_id, NULL)) AS handoff,
  count(DISTINCT if(event = '$pageview' AND properties.$host = 'agent.conthunt.app', person_id, NULL)) AS app,
  count(DISTINCT if(event = 'signup_completed', person_id, NULL)) AS signup,
  count(DISTINCT if(event = 'search_submitted', person_id, NULL)) AS search,
  count(DISTINCT if(event = 'trial_started', person_id, NULL)) AS trial
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY`,
      ),
      sql(
        "Step note",
        `SELECT 'The last four steps read zero until the app emits them. A Get started click is the outbound_app step, not a signup.' AS note`,
      ),
      sql("Converters", CONVERTERS),
      sql(
        "Converters by campaign",
        `SELECT
  utm_campaign,
  count() AS converters
FROM (${CONVERTERS})
GROUP BY utm_campaign
ORDER BY converters DESC`,
      ),
    ],
  },
];

async function api(path, body) {
  const response = await fetch(`${HOST}/api/projects/${PROJECT}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${path}\n${text.slice(0, 800)}`);
  }
  return JSON.parse(text);
}

for (const board of DASHBOARDS) {
  const created = await api("/dashboards/", {
    name: board.name,
    description: board.description,
    pinned: false,
  });
  console.log(`dashboard ${created.id}  ${board.name}`);
  for (const insight of board.insights) {
    const saved = await api("/insights/", {
      name: insight.name,
      dashboards: [created.id],
      query: insight.query,
    });
    console.log(`  insight ${saved.id}  ${insight.name}`);
  }
}
