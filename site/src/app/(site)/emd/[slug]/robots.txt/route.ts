import { notFound } from "next/navigation";
import { emdBySlug } from "@/lib/emd/pages";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return context.params.then(({ slug }) => {
    const page = emdBySlug(slug);
    if (!page) notFound();
    const body = `User-agent: *\nAllow: /\n\nSitemap: https://${page.domain}/sitemap.xml\n`;
    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  });
}
