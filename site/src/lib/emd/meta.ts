import type { Metadata } from "next";
import { DESCRIPTION_MAX, clamp, fullTitle } from "@/lib/seo/site";
import type { EmdPage } from "./pages";

export function emdMeta(page: EmdPage, onDomain: boolean, path: string, title: string, description: string): Metadata {
  const origin = `https://${page.domain}`;
  const canonical = path === "" || path === "/" ? `${origin}/` : `${origin}${path}`;
  const titled = fullTitle(title);
  const desc = clamp(description, DESCRIPTION_MAX);
  return {
    metadataBase: new URL(origin),
    title: { absolute: titled },
    description: desc,
    robots: onDomain ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "ContHunt",
      locale: "en_US",
      title: titled,
      description: desc,
      url: canonical,
    },
    twitter: { card: "summary_large_image", title: titled, description: desc },
  };
}
