import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmdArticle } from "@/components/pages/emd/article";
import { openedLabel } from "@/components/pages/emd";
import { FontPreloads } from "@/components/layout/font-preloads";
import { docPath, docTitle, resolveDoc } from "@/lib/emd/library";
import { loadEmd } from "@/lib/emd/load";
import { emdMeta } from "@/lib/emd/meta";
import { emdBySlug } from "@/lib/emd/pages";
import { docDescription } from "@/lib/emd/describe";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; doc: string[] }> }): Promise<Metadata> {
  const { slug, doc } = await params;
  const page = emdBySlug(slug);
  if (!page) return {};
  const resolved = resolveDoc(page, doc);
  if (!resolved) return {};
  const { onDomain } = await loadEmd(slug);
  return emdMeta(page, onDomain, docPath(resolved), docTitle(page, resolved), docDescription(page, resolved));
}

export default async function Page({ params }: { params: Promise<{ slug: string; doc: string[] }> }) {
  const { slug, doc } = await params;
  const { page, onDomain, href } = await loadEmd(slug);
  const resolved = resolveDoc(page, doc);
  if (!resolved) notFound();
  return (
    <>
      <FontPreloads faces={["switzer600", "boska400i"]} />
      <EmdArticle page={page} doc={resolved} opened={openedLabel(new Date())} onDomain={onDomain} href={href} />
    </>
  );
}
