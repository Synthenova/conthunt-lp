import { libraryFor, publicPaths } from "./library";
import { COLLECTION, DISCLAIMER, ENTITY_CHAIN, PICK, REVIEWED, emdFaqQuestion, type EmdPage } from "./pages";

/** The home page, as Markdown. Same words as the HTML. */
export function emdMarkdown(page: EmdPage): string {
  const copy = libraryFor(page);
  const tools = page.tools.map((tool) => `- ${tool.name}: ${tool.note}`).join("\n");
  const entries = copy.entries.map((entry) => `- ${entry.title}: ${entry.blurb}`).join("\n");
  const paths = publicPaths(page)
    .map((path) => `- https://${page.domain}${path === "/" ? "/" : path}`)
    .join("\n");
  return `# ${page.h1}

Today's edition is the day this page is opened. Content reviewed ${REVIEWED}.

${PICK}

${copy.brief}

${DISCLAIMER}

${ENTITY_CHAIN}

## How to use this directory

${copy.howTo}

## The short list

${tools}

## Practical entries

${entries}

## ${emdFaqQuestion(page)}

${PICK} ${DISCLAIMER}

## What is the first practical step?

${copy.firstStep}

## How the related websites connect

${COLLECTION}

${paths}
`;
}
