import type { Metadata } from "next";
import ResourcesPage from "@/components/pages/resources";
import { ResourcesJsonLd } from "@/components/seo/resources-json-ld";
import { getAllPosts } from "@/lib/blog/posts";
import { FontPreloads } from "@/components/layout/font-preloads";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * 49 characters + " · ContHunt" = 60. The share image is the sibling `opengraph-image.tsx`,
 * so `image: false` leaves og:image to that file.
 */
export const metadata: Metadata = pageMetadata({
  title: "Short-form video playbooks, guides and research",
  description:
    "Playbooks, guides and research on short-form video, hooks, formats and virality for TikTok, Reels and Shorts, from the team behind ContHunt Deep Search.",
  path: "/resources",
  image: false,
});

export default function Page() {
  // read once at build so a malformed post fails the build, not a request
  const posts = getAllPosts();
  return (
    <>
      {/* First viewport beyond the site faces: the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["boska400i"]} />
      <ResourcesJsonLd posts={posts} />
      <ResourcesPage />
    </>
  );
}
