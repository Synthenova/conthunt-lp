import { notFound } from "next/navigation";
import { emdBySlug } from "@/lib/emd/pages";
import { emdMarkdown } from "@/lib/emd/markdown";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return context.params.then(({ slug }) => {
    const page = emdBySlug(slug);
    if (!page) notFound();
    return new Response(emdMarkdown(page), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        Vary: "Accept",
      },
    });
  });
}
