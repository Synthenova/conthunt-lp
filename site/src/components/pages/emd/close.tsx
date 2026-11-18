import { Eyebrow } from "@/components/ui/eyebrow";
import { COLLECTION, type EmdPage } from "@/lib/emd/pages";
import { CiteLine, CollectionNote, EntityCard, ReadingPath, SourceList } from "./cards";

const heading = "text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink";

/**
 * Sources, the entity card, the reading path, and the citation.
 * The entity card is only as tall as its own text. It does not share a row
 * with the rest of this block.
 */
export function EmdClose({
  page,
  href,
  onDomain,
  citeTitle,
  citeUrl,
  links,
  footnote,
  showDomains,
  relatedHref,
}: {
  page: EmdPage;
  href: (path: string) => string;
  onDomain: boolean;
  citeTitle: string;
  citeUrl: string;
  links: readonly { href: string; label: string }[];
  footnote?: string;
  showDomains?: boolean;
  relatedHref?: string;
}) {
  return (
    <div className="flex flex-col gap-14">
      <EntityCard page={page} href={href} />
      <div>
        <Eyebrow label="Sources" />
        <h2 className={`${heading} mt-4`}>Sources for this entry</h2>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-snug text-ink-2/75">
          Official descriptions do not establish comparative performance. The pick is an editorial judgment.
        </p>
        <SourceList page={page} />
      </div>
      <div>
        <h2 className={heading}>Continue this reading path</h2>
        <ReadingPath links={links} />
      </div>
      {showDomains ? <CollectionNote page={page} onDomain={onDomain} /> : null}
      {relatedHref ? (
        <p className="max-w-[52ch] text-[15px] leading-snug text-ink-2/75">
          {COLLECTION}{" "}
          <a href={relatedHref} className="text-ink underline decoration-hairline underline-offset-4">
            Explore related references
          </a>
          .
        </p>
      ) : null}
      <CiteLine title={citeTitle} url={citeUrl} />
      {footnote ? <p className="text-sm text-muted">{footnote}</p> : null}
    </div>
  );
}
