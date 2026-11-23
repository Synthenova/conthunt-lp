import { CalculatorPageLayout, type ToolFaqItem } from "@/components/pages/tools/calculator-page-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { ROUTES } from "@/lib/links";
import { pageMetadata } from "@/lib/seo/metadata";
import { calculatorToolGraph } from "@/lib/seo/schema";
import { loadPlatformBenchmarks } from "@/lib/tools/benchmarks";

const TITLE = "Free TikTok Engagement Rate & Outlier Calculator";
const DESCRIPTION =
  "Calculate TikTok engagement rate by views or followers, like-to-view, save-to-view, share-to-view, and breakout outlier scores against real Viral Now niche medians.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.tiktokCalculator,
});

export default function TikTokEngagementRateCalculatorPage() {
  const dataset = loadPlatformBenchmarks("tiktok");

  const faqs: ToolFaqItem[] = [
    {
      question: "What is the formula for TikTok engagement rate?",
      answer:
        "The most reliable TikTok engagement rate formula divides total interactions by views: ((Likes + Comments + Shares + Saves) / Views) × 100. Because TikTok distributes videos mainly through the For You feed rather than a follower-only feed, dividing by views gives an apples-to-apples read across small and large accounts. If you are comparing a video against public competitor posts where private bookmark counts are hidden, use the public-comparable formula: ((Likes + Comments + Shares) / Views) × 100.",
    },
    {
      question: "What is a good engagement rate on TikTok?",
      answer: `On TikTok, engagement rate depends heavily on your niche and whether you divide by views or followers. Across ${dataset.totalPlatformVideos} public high-performing TikTok clips in ContHunt's Viral Now snapshot (week of ${dataset.weekOf}), the median public engagement rate by views (likes + comments + shares) is ${dataset.overallMedianPublicErPct.toFixed(2)}%, and the 75th percentile is ${dataset.overallP75PublicErPct.toFixed(2)}%. Remember that Viral Now tracks breakout public clips — beating your niche's Viral Now median puts a video in strong breakout territory.`,
    },
    {
      question: "What is a good like-to-view ratio on TikTok?",
      answer: `A common rule of thumb for everyday TikTok posts is 4%–10% likes-to-views, while breakout clips often climb higher depending on category (for example, comedy and recipe videos behave differently from product tutorials). Across the ${dataset.totalPlatformVideos} public breakout TikToks in ContHunt's Viral Now snapshot (week of ${dataset.weekOf}), the median like-to-view ratio is ${dataset.overallMedianLikeToViewPct.toFixed(2)}%.`,
    },
    {
      question: "Why should I track TikTok saves and shares separately from likes?",
      answer:
        "Likes are low-friction signals, while shares and saves (bookmarks) indicate high intent — someone either sent the clip to a friend or bookmarked it to revisit or buy later. A tutorial or product demo with a 5% like-to-view ratio and a 2% save-to-view ratio frequently converts better than an entertainment clip with 12% likes and almost no saves.",
    },
    {
      question: "What is a TikTok outlier multiplier and how do I use it?",
      answer:
        "An outlier multiplier divides one video's views by the account's median views across its recent 10 posts (Video Views ÷ Account Median Views). A 3x or higher outlier means the topic, hook, or format broke outside the creator's regular audience — making it far more useful to study before writing a creative brief than an average post from a mega-account.",
    },
    {
      question: "Should I calculate TikTok engagement rate by views or by followers?",
      answer:
        "Use engagement rate by views to evaluate creative quality (hooks, pacing, resonance with cold viewers on the For You Page). Use engagement rate by followers when auditing creator partnerships or checking whether an account's existing audience is still active rather than inflated by old followers.",
    },
  ];

  return (
    <>
      <JsonLd
        data={calculatorToolGraph({
          name: "TikTok Engagement Rate & Outlier Calculator",
          path: ROUTES.tiktokCalculator,
          description: DESCRIPTION,
          featureList: [
            "Single-video TikTok engagement rate by views and by followers",
            "Batch mode for 3 to 10 recent TikTok videos with median view calculation",
            "Like-to-view, save-to-view, share-to-view, and comment-to-view ratio breakdown",
            "Outlier multiplier score versus account median views",
            "Real public Viral Now niche median benchmarks across 20 categories",
            "1-click summary copy and CSV download",
          ],
          faqs,
        })}
      />
      <CalculatorPageLayout
        content={{
          eyebrow: "Free TikTok Tool",
          h1: "TikTok engagement rate & outlier calculator.",
          intro:
            "Calculate TikTok engagement rate by views or followers, break down likes, comments, shares, and saves, check your breakout outlier score, and benchmark against real public clips in your niche — no login required.",
          siblingTool: {
            label: "Instagram Calculator",
            href: ROUTES.instagramCalculator,
          },
          dataset,
          formulas: [
            {
              name: "Full Engagement Rate by Views (Creator Analytics)",
              formula: "((Likes + Comments + Shares + Saves) ÷ Views) × 100",
              whenToUse:
                "Best for evaluating your own videos when you have TikTok Studio bookmark/save counts. Normalizes for For You Page reach regardless of follower count.",
            },
            {
              name: "Public-Comparable Engagement Rate by Views",
              formula: "((Likes + Comments + Shares) ÷ Views) × 100",
              whenToUse:
                "Best for competitor research and apples-to-apples comparison against ContHunt's public Viral Now niche medians, where public clips report views, likes, comments, and shares.",
            },
            {
              name: "Engagement Rate by Followers",
              formula: "((Likes + Comments + Shares + Saves) ÷ Followers) × 100",
              whenToUse:
                "Useful for influencer vetting and brand deals when you want to see how active an account's existing follower base is.",
            },
            {
              name: "Outlier Multiplier (Breakout Score)",
              formula: "Single Video Views ÷ Account Median Views (last 10 posts)",
              whenToUse:
                "Spots which hook or angle actually drove outsized distribution (3x+ = breakout outlier) instead of crediting an account's baseline follower size.",
            },
          ],
          goodRateHeading: "What is a good TikTok engagement rate?",
          goodRateIntro:
            "Generic blog averages lump together 500-view diary posts and 5M-view comedy skits. Instead of guessing, compare your video against real public breakout clips in the same category — and look at which interaction drove the rate.",
          goodRateBullets: [
            "Compare by views first: TikTok distributes videos to non-followers, so engagement rate by views stays fair whether an account has 2,000 or 200,000 followers.",
            "Watch saves and shares on commercial content: Product demos, tutorials, and TikTok Shop clips often earn lower like-to-view ratios than memes, but far higher save-to-view and share-to-view ratios.",
            "Use median views, not mean views, for your baseline: One viral 1M-view clip distorts an account's average. Switch to Batch Mode above to automatically compute median views and flag true 3x+ outliers.",
            "Pair engagement math with hook inspection: High engagement rate tells you a video resonated; studying the first 3 seconds tells you what to replicate in your next creative brief.",
          ],
          faqs,
          relatedLinks: [
            {
              label: "Instagram Engagement Rate Calculator",
              href: ROUTES.instagramCalculator,
              description: "Run the same views, followers, batch average, and outlier math for Instagram Reels.",
            },
            {
              label: "How to Score a TikTok You Do Not Own",
              href: "/resources/how-to-score-a-tiktok-you-do-not-own",
              description: "A practical rubric for judging public TikTok clips without creator studio access.",
            },
            {
              label: "Reading Virality Beyond Views",
              href: "/blog/reading-virality-beyond-views",
              description: "Why view count alone misleads teams — and which public signals predict repeatable hooks.",
            },
          ],
        }}
      />
    </>
  );
}
