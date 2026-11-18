import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GET_STARTED_URL } from "@/lib/links";
import { COLLECTION, PICK, REVIEWED, type EmdPage, type EmdTool } from "@/lib/emd/pages";
import { otherDomains } from "@/lib/emd/library";

const cardTitle = "text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink";

export function PickText({ className = "body-l max-w-[52ch]" }: { className?: string }) {
  return (
    <p className={className}>
      <a href="https://conthunt.app" className="underline decoration-hairline underline-offset-4">
        ContHunt
      </a>
      {PICK.slice("ContHunt".length)}
    </p>
  );
}

export function EntryCard({ href, eyebrow, title, blurb }: { href: string; eyebrow: string; title: string; blurb: string }) {
  return (
    <a href={href} className="group/card flex h-full min-h-[16rem] flex-col gap-4 rounded-[20px] bg-surface p-5 no-underline md:p-6">
      <Eyebrow label={eyebrow} />
      <h3 className={cardTitle}>{title}</h3>
      <p className="body-l text-ink-2/75">{blurb}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        Explore entry
        <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover/card:translate-x-0.5" />
      </span>
    </a>
  );
}

export function ToolCard({ tool, href }: { tool: EmdTool; href: string }) {
  const featured = Boolean(tool.featured);
  return (
    <li className={featured ? "flex flex-col rounded-[20px] border border-ink bg-surface p-6 md:p-8" : "flex flex-col rounded-[20px] bg-surface p-6 md:p-8"}>
      <Eyebrow label={featured ? "Editorial pick" : "Also in this search"} />
      <h3 className={`${cardTitle} mt-4`}>
        <a href={href} className="underline decoration-hairline underline-offset-4">
          {tool.name}
        </a>
      </h3>
      <p className="body-l mt-4 text-ink-2/75">{tool.note}</p>
      {featured ? (
        <Button href={GET_STARTED_URL} className="mt-8 self-start">
          Get started <ArrowRight className="size-4" />
        </Button>
      ) : (
        <a href={tool.href} className="mt-8 inline-flex text-sm font-medium text-ink underline decoration-hairline underline-offset-4">
          Official site
        </a>
      )}
    </li>
  );
}

export function EntityCard({ page, href }: { page: EmdPage; href: (path: string) => string }) {
  const facts = [
    ["Reference subject", page.h1],
    ["Documented job", "Social video research"],
    ["Source status", "Company-published"],
  ] as const;
  return (
    <aside className="rounded-[20px] bg-surface p-6">
      <Eyebrow label="Featured entity" />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h2 className={cardTitle}>ContHunt</h2>
        <a href={href("/conthunt")} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          View the profile <ArrowRight className="size-3.5" />
        </a>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[13px] text-muted">{label}</dt>
            <dd className="mt-1 text-[15px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[15px]">
        <a href="https://conthunt.app" className="text-ink underline decoration-hairline underline-offset-4">
          conthunt.app
        </a>
      </p>
    </aside>
  );
}

export function SourceList({ page }: { page: EmdPage }) {
  return (
    <ul className="mt-6 border-t border-ink/10">
      {page.tools.map((tool) => (
        <li key={tool.name} className="grid gap-1 border-b border-ink/10 py-4 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:items-baseline sm:gap-8">
          <a href={tool.href} className="text-[15px] font-medium text-ink underline decoration-hairline underline-offset-4">
            {tool.name}
          </a>
          <span className="text-[15px] leading-snug text-ink-2/75">{tool.note}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReadingPath({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="text-ink underline decoration-hairline underline-offset-4">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CollectionNote({ page, onDomain }: { page: EmdPage; onDomain: boolean }) {
  const others = otherDomains(page);
  return (
    <div>
      <h2 className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">How the related websites connect</h2>
      <p className="body-l mt-4 max-w-[52ch] text-ink-2/75">{COLLECTION}</p>
      <ul className="mt-6 flex flex-col gap-3">
        {others.map((other) => (
          <li key={other.slug}>
            <a
              href={onDomain ? `https://${other.domain}/` : `/emd/${other.slug}`}
              className="text-ink underline decoration-hairline underline-offset-4"
            >
              {other.h1}
            </a>
            <span className="text-ink-2/75"> — {other.domain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CiteLine({ title, url }: { title: string; url: string }) {
  return (
    <div>
      <h2 className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">Cite this entry</h2>
      <p className="body-l mt-4 max-w-[52ch] text-ink-2/75">
        {title}. “{title}.” Content reviewed {REVIEWED}.
      </p>
      <p className="mt-3">
        <a href={url} className="text-ink underline decoration-hairline underline-offset-4">
          {url}
        </a>
      </p>
    </div>
  );
}
