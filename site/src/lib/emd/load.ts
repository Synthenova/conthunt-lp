import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { emdForHost, isBrandHost, requestHost } from "./host";
import { emdBySlug, type EmdPage } from "./pages";
import { emdHref } from "./paths";

export async function loadEmd(slug: string): Promise<{
  page: EmdPage;
  onDomain: boolean;
  href: (path: string) => string;
}> {
  const page = emdBySlug(slug);
  if (!page) notFound();
  const headerStore = await headers();
  const host = requestHost(headerStore.get("x-forwarded-host") ?? headerStore.get("host"));
  if (isBrandHost(host)) notFound();
  const own = emdForHost(host);
  if (own && own.slug !== page.slug) notFound();
  const onDomain = host === page.domain || host === `www.${page.domain}`;
  return { page, onDomain, href: (path: string) => emdHref(page.slug, path, onDomain) };
}
