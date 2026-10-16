import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Bare layout for isolated section previews (/preview/<key>): no Navbar, no
 * Footer, so one section can be built and verified alone. Root layout still
 * provides fonts, globals and SmoothScroll.
 *
 * Previews are a development tool. In production they answer 404 (the root not-found page) unless the
 * server runs with ENABLE_PREVIEW_ROUTES=1, for example on a Cloud Run revision used for review.
 * `force-dynamic` makes that check run per request against the runtime environment, so the same
 * image serves both cases; nothing under /preview is prerendered.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_PREVIEW_ROUTES !== "1") notFound();
  return <main data-preview="">{children}</main>;
}
