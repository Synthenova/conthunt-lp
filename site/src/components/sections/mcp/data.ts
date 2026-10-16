/**
 * MCP section data. Every command and snippet is real:
 *
 * - Client snippets mirror the app's `frontend/src/lib/mcp-setup.ts` (`MCP_SETUP`), which the
 *   in-app profile `McpSetup` card shows. Wording is kept verbatim; only the URL is taken from
 *   `@/lib/links` so it stays centralised.
 * - CLI commands come from `conthunt/cli/README.md` (login, whoami, deep-search example).
 *   The public install scripts return 404 today, so no install one-liner is shown.
 * - The 13 tools and their parameters come from `backend/app/mcp/server.py` and
 *   `backend/app/mcp/tools/*.py`. Example calls use real parameter names; values in
 *   angle brackets are placeholders.
 */
import { DOCS_URL, MCP_DOCS_URL, MCP_SERVER_URL } from "@/lib/links";

/** One displayed line. `cmd` and `json` lines are copied; `note` lines are shown as comments. */
export type SnippetLine =
  | { kind: "cmd"; text: string }
  | { kind: "json"; text: string }
  | { kind: "note"; text: string }
  | { kind: "prose"; text: string }
  | { kind: "gap" };

export interface Snippet {
  /** Lines in display order. */
  lines: SnippetLine[];
  /** Optional file label shown in the panel header (JSON configs). */
  file?: string;
  /** Plain text placed on the clipboard. */
  copy: string;
}

const url = MCP_SERVER_URL;

const cmd = (text: string): SnippetLine => ({ kind: "cmd", text });
const note = (text: string): SnippetLine => ({ kind: "note", text });
const prose = (text: string): SnippetLine => ({ kind: "prose", text });
const json = (block: string): SnippetLine[] => block.split("\n").map((text) => ({ kind: "json", text }) as const);
const gap: SnippetLine = { kind: "gap" };

/** Copy text: commands and JSON verbatim, notes as shell comments, prose as-is. */
function toCopy(lines: SnippetLine[]): string {
  return lines
    .filter((l) => l.kind !== "gap")
    .map((l) => (l.kind === "note" ? `# ${l.text}` : (l as { text: string }).text))
    .join("\n");
}

function snippet(lines: SnippetLine[], file?: string, copy?: string): Snippet {
  return { lines, file, copy: copy ?? toCopy(lines) };
}

/** Prompt tab: the exact sentence the app's McpSetup card copies. */
export const PROMPT_TEXT = `Add an MCP server named ContHunt at ${url} and sign in when asked.`;
export const PROMPT_SNIPPET: Snippet = snippet([prose(PROMPT_TEXT)], undefined, PROMPT_TEXT);

export type ClientKey = "cursor" | "claudeCode" | "codex" | "vscode" | "gemini" | "claude" | "grok";

export interface McpClient {
  key: ClientKey;
  label: string;
  snippet: Snippet;
}

/** MCP tab: per-client setup, in the app's wording (MCP_SETUP). */
export const MCP_CLIENTS: McpClient[] = [
  {
    key: "cursor",
    label: "Cursor",
    snippet: snippet(json(`{\n  "mcpServers": {\n    "conthunt": { "url": "${url}" }\n  }\n}`), "mcp.json"),
  },
  {
    key: "claudeCode",
    label: "Claude Code",
    snippet: snippet([cmd(`claude mcp add --transport http conthunt ${url}`), note("Then run /mcp and sign in when asked.")]),
  },
  {
    key: "codex",
    label: "Codex",
    snippet: snippet([cmd(`codex mcp add conthunt --url ${url}`), cmd("codex mcp login conthunt")]),
  },
  {
    key: "vscode",
    label: "VS Code",
    snippet: snippet(
      json(`{\n  "mcp": { "servers": { "conthunt": { "type": "http", "url": "${url}" } } }\n}`),
      "settings.json",
    ),
  },
  {
    key: "gemini",
    label: "Gemini CLI",
    snippet: snippet([
      cmd(`gemini mcp add --transport http -s user conthunt ${url}`),
      note("Then run /mcp auth conthunt and sign in."),
    ]),
  },
  {
    key: "claude",
    label: "Claude.ai",
    snippet: snippet([
      prose(`In Claude, go to Customize → Connectors → Add custom connector. Name it ContHunt and use ${url}`),
    ]),
  },
  {
    key: "grok",
    label: "Grok",
    snippet: snippet([
      prose(`For Grok Bot, paste the Prompt option. For grok.com, add a custom connector named ContHunt at ${url}`),
    ]),
  },
];

export const DEFAULT_CLIENT: ClientKey = "cursor";

/**
 * CLI tab: real usage from cli/README.md (`login`, `whoami`, `search start|show`,
 * `deep-search`). Install is deliberately omitted (the public scripts 404). The search
 * query is an example argument; the commands and flags are the README's.
 */
export const CLI_SNIPPET: Snippet = snippet([
  note("Sign in with a device code"),
  cmd("conthunt login"),
  cmd("conthunt whoami"),
  gap,
  note("Search, then read the results"),
  cmd('conthunt search start "protein snack hooks" --json'),
  cmd("conthunt search show <search-id> --json"),
  gap,
  note("Deep Search, then wait for the answer"),
  cmd('conthunt deep-search "Research skincare hooks. Use at most two searches and analyze five videos." --json'),
]);

export type TabKey = "prompt" | "mcp" | "cli";
export const TABS: { key: TabKey; label: string }[] = [
  { key: "prompt", label: "Prompt" },
  { key: "mcp", label: "MCP" },
  { key: "cli", label: "CLI" },
];

/* ------------------------------------------------------------------ tools */

export type ToolGroup = "Discover" | "Analyze" | "Organize" | "Account";

export interface McpTool {
  name: string;
  group: ToolGroup;
  /** One sentence, paraphrased from the tool's docstring. */
  summary: string;
  /** Example call with real parameter names. */
  call: string;
}

/** The 13 tools registered in backend/app/mcp/server.py, grouped for reading. */
export const MCP_TOOLS: McpTool[] = [
  {
    name: "deep_search",
    group: "Discover",
    summary: "Hands an objective to the Deep Search agent. It plans the queries, analyzes the videos and writes the report.",
    call: 'deep_search(prompt="Find the hooks behind this week\'s top skincare videos")',
  },
  {
    name: "search",
    group: "Discover",
    summary: "Starts keyword discovery across TikTok, Instagram Reels and YouTube Shorts.",
    call: 'search(action="start", query="protein snack hooks")',
  },
  {
    name: "trending",
    group: "Discover",
    summary: "Reads the current YouTube Shorts, TikTok or niche trend feeds.",
    call: 'trending(action="niches")',
  },
  {
    name: "creator",
    group: "Discover",
    summary: "Reads a live creator profile, or saves the creator's latest or most popular videos.",
    call: 'creator(action="videos", platform="tiktok", handle="<handle>", sort="popular")',
  },
  {
    name: "video",
    group: "Discover",
    summary: "Saves up to eight video URLs from one platform, optionally into a chat.",
    call: 'video(platform="instagram", urls=["<reel-url>"])',
  },
  {
    name: "analyze_video",
    group: "Analyze",
    summary: "Starts a full analysis of one short video from a saved asset or a platform URL.",
    call: 'analyze_video(action="start", video="<video-url>", view="full")',
  },
  {
    name: "analyze_long_video",
    group: "Analyze",
    summary: "Runs Long Video Analyst on YouTube videos longer than three minutes.",
    call: 'analyze_long_video(action="start", video="<youtube-url>", objective="<goal>")',
  },
  {
    name: "insights",
    group: "Analyze",
    summary: "Refreshes the insights for one of your private boards.",
    call: "insights(board_id=<board>)",
  },
  {
    name: "boards",
    group: "Organize",
    summary: "Creates and deletes boards, and adds or removes videos.",
    call: 'boards(action="add", board_id=<board>, content_item_ids=[<video>])',
  },
  {
    name: "files",
    group: "Organize",
    summary: "Lists, reads or downloads the files a chat produced, such as reports.",
    call: 'files(action="read", chat_id=<chat>, path="/outputs/report.md")',
  },
  {
    name: "download",
    group: "Organize",
    summary: "Returns a playable, short-lived media URL for a saved video.",
    call: "download(media_asset_id=<asset>)",
  },
  {
    name: "query_saved_data",
    group: "Organize",
    summary: "Reads your saved searches, videos and analyses with read-only SQL.",
    call: 'query_saved_data(query="select * from chat_search_pool_v limit 20")',
  },
  {
    name: "whoami",
    group: "Account",
    summary: "Returns your account, plan and remaining usage.",
    call: "whoami()",
  },
];

export const TOOL_GROUPS: ToolGroup[] = ["Discover", "Analyze", "Organize", "Account"];
export const DEFAULT_TOOL = "deep_search";

/** Prompt tab: what the agent does after the prompt (the hosted server's OAuth flow). */
export const PROMPT_STEPS: { step: string; detail: string }[] = [
  { step: "add server", detail: url.replace(/^https?:\/\//, "") },
  { step: "sign in", detail: "OAuth" },
  { step: "load tools", detail: `${MCP_TOOLS.length} tools ready` },
];

/**
 * MCP tab: server spec. Transport from the client snippets (`--transport http`); token
 * lifetimes from cli/README.md ("one-hour access … rotating 30-day refresh token").
 */
export const SERVER_SPEC: { k: string; v: string }[] = [
  { k: "server", v: url.replace(/^https?:\/\//, "") },
  { k: "transport", v: "streamable HTTP" },
  { k: "auth", v: "OAuth, 30-day refresh" },
  { k: "tools", v: String(MCP_TOOLS.length) },
];

/** Facts shown in the top bar. */
export const SERVER_HOST = url.replace(/^https?:\/\//, "");
export const SERVER_FACTS = ["HTTP", "OAuth", `${MCP_TOOLS.length} tools`];

export { DOCS_URL, MCP_DOCS_URL, MCP_SERVER_URL };
