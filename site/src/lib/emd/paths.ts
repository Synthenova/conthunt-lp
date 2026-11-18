/**
 * Public paths on a keyword domain. The proxy rewrites these onto /emd/<slug>/...
 * Anything else on that host still goes to conthunt.app.
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EXACT = new Set(["/category", "/conthunt", "/methodology", "/related-websites", "/entries", "/tools"]);

export function isEmdLibraryPath(pathname: string): boolean {
  if (EXACT.has(pathname)) return true;
  const parts = pathname.split("/");
  if (parts.length !== 3) return false;
  if (parts[1] !== "entries" && parts[1] !== "tools") return false;
  return SLUG.test(parts[2] ?? "");
}

/** Path on this host. On the real domain it is /category. On the preview it is /emd/<slug>/category. */
export function emdHref(slug: string, path: string, onDomain: boolean): string {
  const clean = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (onDomain) return clean === "" ? "/" : clean;
  return clean === "" ? `/emd/${slug}` : `/emd/${slug}${clean}`;
}
