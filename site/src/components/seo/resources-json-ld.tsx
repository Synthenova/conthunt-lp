import type { PostSummary } from "@/lib/blog/types";
import { resourcesGraph } from "@/lib/seo/schema";
import { JsonLd } from "./json-ld";

/** CollectionPage + Blog + ItemList + BreadcrumbList for `/resources`. */
export function ResourcesJsonLd({ posts }: { posts: PostSummary[] }) {
  return <JsonLd data={resourcesGraph(posts)} />;
}
