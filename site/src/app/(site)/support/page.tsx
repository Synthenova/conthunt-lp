import SupportPage from "@/components/pages/support";
import { SUPPORT_DESCRIPTION } from "@/components/pages/support/content";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Support",
  description: SUPPORT_DESCRIPTION,
  path: "/support",
});

export default function Page() {
  return <SupportPage />;
}
