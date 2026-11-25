import type { PageMetadataInput } from "@/lib/seo/metadata";
import { pageMetadata as base } from "@/lib/seo/metadata";
/** New growth pages currently have HTML only; do not advertise a Markdown copy. */
export function pageMetadata(input: PageMetadataInput) {
  return { ...base(input), alternates: { canonical: input.path } };
}
