import type { Metadata } from "next";

/**
 * Bare layout for isolated section previews (/preview/<key>): no Navbar, no
 * Footer, so one section can be built and verified alone. Root layout still
 * provides fonts, globals and SmoothScroll.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <main data-preview="">{children}</main>;
}
