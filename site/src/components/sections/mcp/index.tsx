/**
 * MCP section — `[ 06 / 08 ] · POWER YOUR AGENT` (PLyVa, light).
 *
 * A framed spec sheet that runs rail to rail:
 *   1. Top bar: eyebrow + the server URL (click to copy) + transport facts.
 *   2. ASCII band: canvas globe that resolves into the ContHunt mark (hover scramble,
 *      click ripple, drag to spin) beside the heading, sub and CTAs.
 *   3. Two panels: "One URL." (Prompt / MCP / CLI setup, real snippets) and
 *      "13 tools." (the hosted server's tools/list with real example calls).
 *
 * Documented exceptions to the home rhythm (one left edge, Display L h2): the frame's
 * own vertical edges sit on the rails, so its text keeps a uniform cell padding inside
 * the ruled cells, and the h2 is sized to its 7fr cell (12cqi, capped at Display L's
 * 64px) so "Plug ContHunt into" stays on one line.
 *
 * Server component; the interactive islands are AsciiBand, SetupPanel, ToolIndex,
 * CopyButton and McpReveal. Preview: /preview/mcp.
 *
 *   <McpSection />                           // home (index 6 of 8)
 *   <McpSection index={3} total={5} />       // reuse elsewhere with another counter
 *   <McpSection showEyebrow={false} id="agents" />
 */
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { AsciiBand, CopyButton, Cross, McpReveal, Rule, SetupPanel, ToolIndex } from "./island";
import { DOCS_URL, MCP_DOCS_URL, MCP_SERVER_URL, MCP_TOOLS, SERVER_FACTS, SERVER_HOST } from "./data";

export interface McpSectionProps {
  /** Eyebrow number. Default 6 (PLAN §2). */
  index?: number;
  /** Eyebrow total. Default 8. */
  total?: number;
  /** Hide the eyebrow row's counter + label (the URL chip stays). Default true = shown. */
  showEyebrow?: boolean;
  /** Anchor id. Default "mcp". */
  id?: string;
  className?: string;
}

const ARTICLE =
  "flex min-w-0 flex-col gap-6 px-5 py-9 md:px-7 md:py-10 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:px-6";
const H3 = "text-balance text-[19px] font-bold leading-[1.32] tracking-[-0.02em] text-ink md:text-[20px]";

function TextLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...rest}
      className="group/link inline-flex w-fit items-center gap-1 text-[15px] font-medium tracking-[-0.01em] text-accent"
    >
      <span className="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-200 group-hover/link:decoration-current">
        {children}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5"
      />
    </a>
  );
}

function AgentReady() {
  return (
    <div data-mcp-in="" className="flex flex-col items-center gap-3 pb-6 md:pb-8">
      <p data-globe-quiet="0" className="flex items-center gap-3 text-[13px]">
        <span aria-hidden="true" className="font-mono text-[12px] text-faint">
          {"//"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-chip bg-bg/85 px-1.5 py-0.5 font-medium text-ink">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-green/40 group-data-[active=false]/band:[animation-play-state:paused]" />
            <span className="relative size-2 rounded-full bg-green" />
          </span>
          Agent ready
        </span>
        <span aria-hidden="true" className="font-mono text-[12px] text-faint">
          {"\\\\"}
        </span>
      </p>
      <span aria-hidden="true" className="h-px w-52 bg-hairline" />
    </div>
  );
}

export default function McpSection({ index = 6, total = 8, showEyebrow = true, id, className }: McpSectionProps) {
  return (
    <Section sectionKey="mcp" id={id} aria-labelledby="mcp-heading" className={className}>
      <McpReveal className="relative">
        {/* Side edges coincide with the page rails; drawn here too so the frame is closed anywhere. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-px bg-hairline" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px bg-hairline" />

        {/* 1 · top bar. Below ~640px the URL chip wraps under the eyebrow instead of hiding. */}
        <div className="relative flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-5 py-3 md:px-8">
          <Rule edge="top" />
          <Cross x="left" y="top" />
          <Cross x="right" y="top" />
          <div data-mcp-in="">{showEyebrow && <Eyebrow index={index} total={total} label="Power your agent" />}</div>
          <div data-mcp-in="" className="flex items-center gap-4">
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.04em] text-ink/64 lg:block">
              {SERVER_FACTS.join(" · ")}
            </p>
            <CopyButton
              text={MCP_SERVER_URL}
              label={`Copy MCP server URL ${MCP_SERVER_URL}`}
              analytics={{ target: "mcp_url" }}
              className="h-8 gap-2 rounded-chip border border-hairline bg-paper px-2.5 text-[12px] normal-case tracking-normal text-ink-2"
            >
              <span>{SERVER_HOST}</span>
            </CopyButton>
          </div>
        </div>

        {/* 2 · ASCII band */}
        <AsciiBand className="md:grid md:min-h-[27.5rem] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Rule edge="top" />
          <Cross x="left" y="top" />
          <Cross x="right" y="top" />
          <div className="flex flex-col">
            <div data-globe-anchor="" className="h-[18rem] md:h-auto md:min-h-[18rem] md:flex-1" />
            <AgentReady />
          </div>
          <div
            data-globe-quiet=""
            className="@container flex flex-col justify-center px-5 pb-12 pt-4 md:py-16 md:pl-2 md:pr-10 xl:pr-14"
          >
            <h2
              id="mcp-heading"
              className="text-[clamp(2rem,12cqi,4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-ink"
            >
              <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <span data-mcp-line="" className="block">
                  Plug ContHunt into
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.14em] pr-[0.12em] -mb-[0.14em]">
                <span data-mcp-line="" className="block text-purple">
                  your AI <Emphasis>agents</Emphasis>
                </span>
              </span>
            </h2>
            <p data-mcp-in="" className="body-l mt-6 max-w-[44ch] text-muted">
              One URL connects Claude, Codex, Cursor, VS Code and Gemini CLI to {MCP_TOOLS.length} ContHunt tools:
              search, Deep Search, video analysis, boards and more.
            </p>
            <div data-mcp-in="" className="mt-7 flex flex-wrap items-center gap-2">
              <Button href={GET_STARTED_URL} {...phAttrs("mcp", "app")}>Get started</Button>
              <Button href={MCP_DOCS_URL} newTab variant="ghost" {...phAttrs("mcp", "mcp_docs")}>
                MCP guide
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        </AsciiBand>

        {/* 3 · panels */}
        {/*
          One column below lg: two ~250px cards at 768–1023 clip their code. From lg the two
          articles share one subgrid (heading / panel / link rows), so headings, cards and
          links line up whatever wraps, and no height is reserved when nothing does.
        */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto]">
          <Rule edge="top" />
          <Cross x="left" y="top" />
          <Cross x="right" y="top" />
          <Rule edge="vertical" className="left-1/2 hidden lg:block" />
          <Rule edge="bottom" />
          <Cross x="left" y="bottom" />
          <Cross x="right" y="bottom" />

          <article data-mcp-in="" className={ARTICLE}>
            <h3 className={H3}>
              One URL. <span className="text-muted">Prompt, MCP config or CLI.</span>
            </h3>
            <SetupPanel />
            <TextLink href={MCP_DOCS_URL} {...phAttrs("mcp", "mcp_docs")}>Read the MCP guide</TextLink>
          </article>

          <article
            data-mcp-in=""
            className={cn(
              ARTICLE,
              "relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline lg:before:hidden",
            )}
          >
            <h3 className={H3}>
              {MCP_TOOLS.length} tools. <span className="text-muted">The app&rsquo;s research, run by your agent.</span>
            </h3>
            <ToolIndex />
            <TextLink href={DOCS_URL} {...phAttrs("mcp", "docs")}>View the docs</TextLink>
          </article>
        </div>
      </McpReveal>
    </Section>
  );
}
