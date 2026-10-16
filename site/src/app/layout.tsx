import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { preconnect, preload } from "react-dom";
import { PostHogLoader } from "@/components/analytics/posthog";
import { FONT_FILES, SITE_FONT_PRELOADS } from "@/lib/fonts";
import { SHOW_RAILS } from "@/components/layout/rails";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { SoundBindings } from "@/components/layout/sound-bindings";
import { SITE_URL } from "@/lib/links";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/site";
import "./globals.css";

/**
 * Root layout: <html>/<body>, fonts, site metadata and the global SmoothScroll
 * (Lenis) provider. Route groups add chrome: `(site)` = Navbar + Footer,
 * `(preview)` = bare section previews.
 *
 * Fonts:
 * - Switzer and Boska italic from the Fontshare CDN (self-hosting is not allowed in
 *   a public repo), exposed as --font-sans and --font-serif-italic in globals.css.
 *   The @font-face rules are inlined at the top of globals.css (woff2 URLs on
 *   cdn.fontshare.com), so no third-party stylesheet blocks the first paint. Only the
 *   faces the site uses are declared: Switzer 400/500/600/700, Switzer 800 (Viral
 *   Now rank numerals), Switzer 400 italic (<em> in article prose) and Boska 400/500
 *   italic (<Emphasis>). Browsers fetch a face only when a page uses it. Switzer 400
 *   (body), 500 (navbar, buttons) and 700 (headings) are preloaded below for every
 *   page; each route preloads the other faces its first viewport paints with
 *   <FontPreloads> (components/layout/font-preloads.tsx; the URLs are in
 *   src/lib/fonts.ts). font-display is swap. Add a weight to globals.css before using
 *   it, or the browser synthesises it.
 * - JetBrains Mono via next/font → --font-jetbrains-mono → --font-mono.
 *
 * Icons are file-based (src/app/icon.png 48px, src/app/apple-icon.png 180px), so
 * metadata sets no `icons`. The share image is DEFAULT_OG_IMAGE (src/lib/seo/site.ts).
 */

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const TITLE = "ContHunt | Analyze Viral Videos";
const DESCRIPTION =
  "Find viral short-form videos from TikTok, Instagram, YouTube & analyze with AI. Discover virality patterns, copy winning UGC ADs, download shorts reels.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · ContHunt" },
  description: DESCRIPTION,
  keywords: [
    "content research",
    "viral video analysis",
    "TikTok analytics",
    "content intelligence",
    "social media research",
    "content strategy",
    "trend analysis",
  ],
  authors: [{ name: "ContHunt" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ContHunt",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preconnect("https://cdn.fontshare.com", { crossOrigin: "anonymous" });
  for (const face of SITE_FONT_PRELOADS) preload(FONT_FILES[face], { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en" className={mono.variable} data-rails={SHOW_RAILS ? undefined : "hidden"} suppressHydrationWarning>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <SoundBindings />
        <PostHogLoader />
      </body>
    </html>
  );
}
