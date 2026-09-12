---
name: conthunt
description: Research viral TikTok, Instagram Reels, and YouTube Shorts with ContHunt. Use when the user wants short-form discovery, competitor examples, hooks, niche research, boards, analysis, or deep research through ContHunt MCP or CLI.
---

# ContHunt

ContHunt finds and analyzes public short-form video across TikTok, Instagram Reels, and YouTube Shorts.

## Prefer MCP

If a ContHunt MCP server is connected, use those tools. The hosted endpoint is:

`https://mcp.conthunt.app`

Authenticate through the client's MCP login / OAuth flow. Never ask for, print, copy, or store the user's token.

Do not send people to GitHub to install ContHunt. Human install docs: https://conthunt.app/docs

Read [references/mcp.md](references/mcp.md) for the tool catalog and the usual search, board, analyze, research loop.

## If MCP is not connected

Tell the user to add the hosted MCP from https://conthunt.app/docs/integrations/mcp. Typical commands:

- Codex: `codex mcp add conthunt --url https://mcp.conthunt.app` then `codex mcp login conthunt`
- Claude Code: `claude mcp add --transport http conthunt https://mcp.conthunt.app`

Only fall back to the ContHunt CLI when the user wants a terminal workflow or MCP is unavailable:

- macOS/Linux: `curl -fsSL https://conthunt.app/install.sh | sh`
- Windows PowerShell: `irm https://conthunt.app/install.ps1 | iex`
- Then `conthunt login`

Give them the verification URL and user code. Never handle their token.

## Operating model

- Use SearchAgent tools when the user wants the product to explore a niche and choose useful searches.
- Use direct search when they already have the query and platform scope.
- Treat TikTok as one platform. Keep YouTube restricted to Shorts.
- Use research tools for evidence-backed answers across saved videos.
- Preserve search, media, board, and research IDs. Later calls need them.
- Page through large result sets. Do not dump raw progress events or signed URLs unless asked.
- Analysis needs a stored media asset ID, not a raw social or CDN URL.

## Credits

If a tool returns `credits_exhausted` or says the credit limit was exceeded, stop retrying. Tell the user they are out of credits, ask them to upgrade, and send them to:

`https://agent.conthunt.app/app/billing/return`

Do not start more billable ContHunt work until they confirm they upgraded or added credits.
