import { notFound } from "next/navigation";
import { publicPaths } from "@/lib/emd/library";
import { emdBySlug } from "@/lib/emd/pages";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return context.params.then(({ slug }) => {
    const page = emdBySlug(slug);
    if (!page) notFound();
    const urls = publicPaths(page)
      .map((path) => `  <url><loc>https://${page.domain}${path === "/" ? "/" : path}</loc></url>`)
      .join("\n");
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
    return new Response(body, {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  });
}
