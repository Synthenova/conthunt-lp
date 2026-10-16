/**
 * Site footer slot, rendered on every (site) page by src/app/(site)/layout.tsx.
 *
 * STUB — it mounts the footer section (src/components/sections/footer, owned by
 * the footer section agent, preview /preview/footer). Replace this file only if
 * the footer needs page-level chrome beyond the section itself.
 */
import { LazySection } from "@/components/layout/lazy-section";
import FooterSection from "@/components/sections/footer";

/** The footer is server-rendered in full and hydrated near the viewport (see LazySection). */
export function Footer() {
  return (
    <LazySection code="footer">
      <FooterSection />
    </LazySection>
  );
}

export default Footer;
