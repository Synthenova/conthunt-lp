# ContHunt MCP tools

Hosted Streamable HTTP endpoint: `https://mcp.conthunt.app`

OAuth 2.1 with PKCE. The client opens the ContHunt approval page.

## Tool groups

**Account**
- `whoami`

**Search**
- `search_start`, `search_status`, `search_get`, `search_list`
- `agent_search_start`, `agent_search_status`, `agent_search_get`

**Creators and videos**
- `creator_get`, `creator_videos`, `video_get`

**Boards**
- `board_list`, `board_create`, `board_get`, `board_delete`
- `board_items`, `board_add`, `board_remove`

**Analysis and download**
- `analyze_start`, `analyze_status`, `analyze_get`, `download_url`
- `insights_start`, `insights_status`, `insights_get`

**Research**
- `research_start`, `research_status`, `research_get`, `research_send`
- `research_list`, `research_messages`, `research_watched`
- `research_evidence`, `research_operations`

**Trending**
- `trending_youtube`, `trending_tiktok`, `trending_niches`

**Workspace files**
- `workspace_list_files`, `workspace_read_file`, `workspace_download_file`

## Typical loop

1. `whoami` if you need to confirm the signed-in account.
2. Start `agent_search_*` or `search_*` for the niche.
3. Poll `*_status` until complete, then `*_get`.
4. Save useful videos to a board.
5. `analyze_*` selected media assets.
6. `research_*` when the user wants an evidence-backed answer. Use `research_send` only when status says a plan reply is required.
