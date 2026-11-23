import { CalculatorPageLayout, type ToolFaqItem } from "@/components/pages/tools/calculator-page-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { ROUTES } from "@/lib/links";
import { pageMetadata } from "@/lib/seo/metadata";
import { calculatorToolGraph } from "@/lib/seo/schema";
import { loadPlatformBenchmarks } from "@/lib/tools/benchmarks";

const TITLE = "Free Instagram Engagement Rate & Reels Outlier Calculator";
const DESCRIPTION =
  "Calculate Instagram Reels engagement rate by views or followers, batch 3-10 post averages, saves and shares ratios, and outlier scores with Viral Now benchmarks.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.instagramCalculator,
});

export default function InstagramEngagementRateCalculatorPage() {
  const dataset = loadPlatformBenchmarks("instagram");

  const faqs: ToolFaqItem[] = [
    {
      question: "How do you calculate Instagram Reels engagement rate?",
      answer:
        "There are two standard ways to calculate Instagram engagement rate. For Reels, dividing by views (plays/reach) is the cleanest measure of creative quality: ((Likes + Comments + Shares + Saves) / Views) × 100. For influencer vetting and profile audits, teams also calculate engagement rate by followers: ((Likes + Comments + Shares + Saves) / Followers) × 100. This calculator computes both at once, plus a public-comparable ((Likes + Comments) / Views) rate for competitor benchmarking.",
    },
    {
      question: "What is a good engagement rate on Instagram Reels?",
      answer: `Because Instagram distributes Reels heavily to non-followers via the Reels tab and Explore, engagement rate by views is much steadier than engagement rate by followers. Across ${dataset.totalPlatformVideos} public breakout Instagram Reels in ContHunt's Viral Now snapshot (week of ${dataset.weekOf}), the median public engagement rate by views (likes + comments only, since Instagram hides shares and saves publicly) is ${dataset.overallMedianPublicErPct.toFixed(2)}%, and the 75th percentile is ${dataset.overallP75PublicErPct.toFixed(2)}%. When you add private shares and saves from Instagram Insights, your full engagement rate will sit higher than the public-only rate.`,
    },
    {
      question: "Why does Instagram engagement rate differ between Insights and public competitor tools?",
      answer:
        "Instagram hides share counts and save counts on public posts for most accounts, exposing only plays/views, likes, and comments publicly. That is why this calculator displays both your Full Engagement Rate (with Insights saves and shares) and your Public-Comparable Engagement Rate ((Likes + Comments) / Views) so you never compare private Insights numbers against public-only competitor averages.",
    },
    {
      question: "Why are shares (sends) and saves so important on Instagram Reels?",
      answer:
        "Instagram has repeatedly highlighted DM sends per reach as one of the strongest ranking signals for reaching unconnected audiences on Reels, while saves signal reference and buying intent. Tracking Share-to-View and Save-to-View alongside Like-to-View helps you spot high-converting creative formats that simple like counters miss.",
    },
    {
      question: "How many Reels should I include to calculate an account's average engagement rate?",
      answer:
        "Use at least 5 to 10 recent Reels (excluding pinned viral outliers from months ago) and look at the median alongside the weighted average. Switch to Batch Mode in the calculator above to paste 3 to 10 recent Reels and automatically spot which Reel is a 3x+ outlier above your baseline.",
    },
    {
      question: "What counts as an outlier Reel?",
      answer:
        "Divide a Reel's views by your account's median views across your last 10 Reels. Anything at 1.5x–2.9x is performing above baseline, while 3.0x+ is a breakout outlier worth dissecting for hook structure, pacing, caption framing, and repeatable format.",
    },
  ];

  return (
    <>
      <JsonLd
        data={calculatorToolGraph({
          name: "Instagram Engagement Rate & Reels Outlier Calculator",
          path: ROUTES.instagramCalculator,
          description: DESCRIPTION,
          featureList: [
            "Single-Reel Instagram engagement rate by views and by followers",
            "Batch mode for 3 to 10 recent Instagram Reels with median views and outlier detection",
            "Full Insights ER (with saves & shares) alongside public-comparable ER",
            "Like-to-view, save-to-view, share-to-view, and comment-to-view ratio breakdown",
            "Real public Viral Now Instagram Reels benchmark snapshot",
            "1-click summary copy and CSV download",
          ],
          faqs,
        })}
      />
      <CalculatorPageLayout
        content={{
          eyebrow: "Free Instagram Tool",
          h1: "Instagram engagement rate & Reels outlier calculator.",
          intro:
            "Calculate Instagram Reels engagement rate by views or followers, separate private Insights saves and shares from public metrics, run 3–10 Reel batch averages, and spot breakout outliers — instant, free, and no login needed.",
          siblingTool: {
            label: "TikTok Calculator",
            href: ROUTES.tiktokCalculator,
          },
          dataset,
          formulas: [
            {
              name: "Full Reels Engagement Rate by Views (Instagram Insights)",
              formula: "((Likes + Comments + Shares + Saves) ÷ Views) × 100",
              whenToUse:
                "Best for auditing your own Reels with full Insights data. Captures DM sends (shares) and saves, which are major Reels distribution signals.",
            },
            {
              name: "Public-Comparable Engagement Rate by Views",
              formula: "((Likes + Comments) ÷ Views) × 100",
              whenToUse:
                "Best for competitor audits and apples-to-apples comparison against public Instagram Reels on ContHunt Viral Now (since Instagram hides public share and save counts).",
            },
            {
              name: "Instagram Engagement Rate by Followers",
              formula: "((Likes + Comments + Shares + Saves) ÷ Followers) × 100",
              whenToUse:
                "Standard metric for creator discovery, sponsorship pricing, and checking how engaged an account's existing followers are.",
            },
            {
              name: "Reels Outlier Multiplier",
              formula: "Reel Views ÷ Account Median Views (last 10 Reels)",
              whenToUse:
                "Finds which Reel broke outside your normal follower reach (3x+ = breakout outlier) so you know which creative angle to repeat.",
            },
          ],
          goodRateHeading: "What is a good Instagram Reels engagement rate?",
          goodRateIntro:
            "Instagram Reels behave differently from static carousel posts: a Reel that reaches 80% non-followers will naturally show a different follower-based rate than a feed post seen mostly by existing followers. That is why evaluating both views-based and follower-based engagement matters.",
          goodRateBullets: [
            "Never mix public and private formulas: If you include Insights saves and shares in your numerator, compare against your own historical Insights baseline — use the Public-Comparable ER row when benchmarking against competitors.",
            "Prioritize Share-to-View (sends per reach) for reach growth: Relatable, sendable Reels expand into cold audiences faster than passive double-tap clips.",
            "Prioritize Save-to-View for commercial offers: Checklists, comparisons, and product demos earn saves that convert days later even when comment counts look modest.",
            "Audit 5–10 recent Reels in Batch Mode: Median views filter out one-off spikes so you see an account's real baseline and identify true 3x+ outlier formats.",
          ],
          faqs,
          relatedLinks: [
            {
              label: "2026 Short-Form Video Benchmark (1,500 Clips)",
              href: "/blog/short-form-video-engagement-benchmark-2026",
              description: "Verified cross-platform medians across TikTok, Instagram Reels, and YouTube Shorts in 5 commercial niches.",
            },
            {
              label: "TikTok Engagement Rate Calculator",
              href: ROUTES.tiktokCalculator,
              description: "Calculate TikTok engagement rate, like-to-view, saves, shares, and niche medians across 20 categories.",
            },
            {
              label: "Instagram Reels Analytics Guide",
              href: "/blog/instagram-reels-analytics",
              description: "How to interpret Reels retention, sends per reach, and outlier formats without guesswork.",
            },
            {
              label: "Best Instagram Analytics Tools (2026)",
              href: "/blog/best-instagram-analytics-tools",
              description: "Compare native Instagram Insights against cross-platform Reels research and tracking tools.",
            },
          ],
        }}
      />
    </>
  );
}
