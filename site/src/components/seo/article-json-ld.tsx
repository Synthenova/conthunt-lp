import type { PostSummary } from "@/lib/blog/types";
import { articleGraph } from "@/lib/seo/schema";
import { JsonLd } from "./json-ld";

/** BlogPosting + BreadcrumbList for one article. Rendered by `src/app/(site)/resources/[slug]/page.tsx`. */
export function ArticleJsonLd({ post }: { post: PostSummary & { body?: string } }) {
  return <JsonLd data={articleGraph(post)} />;
}
