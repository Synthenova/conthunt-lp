/**
 * Home "Resources" section, `[ 07 / 08 ] · RESOURCES` (PLAN §3: blog).
 * The five featured posts by `featuredOrder`, then a sixth "Read all articles" card.
 * Server component: it reads the posts and hands plain data to the client gallery.
 *
 *   import BlogSection from "@/components/sections/blog";
 *   <BlogSection />
 *
 * Shared pieces other pages can reuse:
 *   BlogCover      "@/components/sections/blog/cover/blog-cover"
 *   BlogCard       "@/components/sections/blog/blog-card"
 */
import { Section } from "@/components/layout/section";
import { getIndexCover } from "@/lib/blog";
import { getAllPosts, getCategoryCounts, getFeaturedPosts } from "@/lib/blog/posts";
// The island's CSS ships with the page (its components load with the island).
import "./cover/blog-cover.css";
import { BlogGallery } from "./island";

export default function BlogSection() {
  const featured = getFeaturedPosts();
  const total = getAllPosts().length;
  return (
    <Section sectionKey="blog">
      <BlogGallery posts={featured} total={total} categories={getCategoryCounts()} indexCover={getIndexCover()} />
    </Section>
  );
}
