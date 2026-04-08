# ContHunt: The Autonomous Video Intelligence Platform
**Brand & Technical Deep Dive**

---

## 1. Executive Summary
**ContHunt** is not just a search tool; it is an **autonomous research analyst** for video content. It bridges the gap between chaos and clarity in the creator economy by using multi-agent AI to "watch," understand, and curate video content at scale.

While traditional tools rely on surface-level metadata (hashtags, captions), ContHunt employs **Visual Intelligence** to understand the actual pixels—actions, emotions, lighting, and pacing—enabling creators to find "high-retention hooks" or "cinematic transitions" that no keyword search could ever surface.

---

## 2. Core Intelligence: The "Deep Agent"
At the heart of ContHunt lies a sophisticated multi-agent system orchestrated by **LangGraph**. This isn't a simple chatbot; it's a cognitive engine that plans, executes, and adapts.

### 2.1 The Orchestrator (GPT-4o)
The "Brain" of the operation. It receives abstract user goals (e.g., "Find viral low-budget cooking hacks") and:
*   **Plans**: Breaks the goal into a multi-step research strategy.
*   **Delegates**: Assigns tasks to specialized sub-agents.
*   **Synthesizes**: Compiles final reports with strategic reasoning.
*   **Persists**: Uses a postgres-backed `checkpointer` to remember context across long research sessions, allowing users to pause and resume complex tasks.

### 2.2 The Searcher (Gemini Pro)
The "Hunter." A specialized sub-agent grounded in real-time search data.
*   **Query Translation**: Converts human concepts into platform-native search queries (e.g., "sad mood" -> "corecore aesthetic melancholic").
*   **Cross-Platform hunting**: Simultaneously scouts **TikTok**, **Instagram Reels**, **YouTube Shorts**, and **Pinterest**.

### 2.3 Transparent Reasoning UI
ContHunt believes in "Glass Box" AI. The frontend (`frontend/src/components/ai-elements`) visualizes the agent's thought process in real-time:
*   **Plan Visualization**: Users see the agent's checklist as it's created and checked off.
*   **Chain of Thought**: Expandable sections show the raw reasoning behind every decision.
*   **Tool Usage**: dedicated UI cards show exactly when the agent is "Searching TikTok" or "Watching Video," building trust through transparency.

---

## 3. Visual Intelligence: The "Eyes" (TwelveLabs Integration)
ContHunt's "secret sauce" is its integration with **TwelveLabs**, enabling it to analyze videos like a human editor would.

### 3.1 Deep Video Analysis (50+ Data Points)
Every analyzed video is broken down into a structured schema (`backend/app/schemas/analysis.py`), extracting over 50 specific data points:

*   **Cinematography**: Camera movement (pan, tilt, unknown), shot type (close-up, wide), and composition.
*   **Lighting & Color**: Dominant palettes, lighting mood (high-key, noir), and grading style.
*   **Pacing & Editing**: Cut speed, transition types, and rhythm.
*   **Audio**: Music genre, sound effects quality, and voiceover presence.
*   **Content**: Detected props, character actions, and environmental details.

### 3.2 Semantic Video Search
Users can search *within* videos.
*   *Query*: "Show me the second he drops the phone."
*   *Result*: The system returns the exact timestamp (e.g., `00:14`) where that action occurs, powered by vector embeddings of the video frames.

---

## 4. Strategic Insights: The "Analyst"
ContHunt doesn't just list videos; it explains *why* they work. The system automatically generates strategic deliverables (`backend/app/schemas/insights.py`):

*   **Creative Briefs**: Auto-generated guides for creators based on the curated board (Target Audience, Key Message, Recommended Format).
*   **Hook Analysis**: Identifies common high-retention opening hooks.
*   **Script Ideas**: Generates ready-to-use script concepts inspired by the analyzed trends.
*   **Objection Handling**: Identifies common audience objections found in comments/content.

---

## 5. Workflow & User Experience
The application is built for "Flow," minimizing friction between discovery and creation.

### 5.1 Dynamic Research Boards
*   **Live Hydration**: Utilizing **Firebase Realtime Database**, boards update instantly as the agent discovers new content.
*   **Optimistic UI**: Likes, archives, and organization actions happen instantly on the client (`SelectableMediaCard.tsx`), syncing to the backend asynchronously.
*   **Smart Filtering**: Users can filter results by Platform, Duration, Views, and even "Analyzed Status" using the `FilterBar` component.

### 5.2 Interactive Chat
*   **Streamed Responses**: The chat interface uses **Server-Sent Events (SSE)** via `SearchStreamer.tsx` to stream the agent's reasoning tokens, making interaction feel alive.
*   **Contextual Q&A**: Users can drag a video into the chat and ask, "What lighting setup is this?" The agent retrieves the specific analysis for that asset to answer accurately.

---

## 6. Technical Architecture & Scalability

### 6.1 Hygiene & Structure
*   **Hybrid Sync/Async**: The backend combines high-concurrency async Python (FastAPI) for I/O-bound tasks with robust synchronous processing where data integrity is paramount.
*   **Type Safety**: End-to-end type safety from database models (SQLAlchemy) to API schemas (Pydantic) to Frontend interfaces (TypeScript).

### 6.2 Data Pipeline
1.  **Ingestion**: Scrapers fetch raw video URLs -> **Cloud Tasks** queue.
2.  **Processing**: **TwelveLabs** indexes the content (Vectorization).
3.  **Storage**:
    *   **PostgreSQL**: Structured relational data (Users, Boards, Assets).
    *   **GCS**: Cold storage for large analysis artifacts and search dumps.
    *   **Redis**: Hot cache for session state and rate limiting.

### 6.3 Infrastructure
*   **Compute**: Fully serverless on **Google Cloud Run**, auto-scaling to zero to minimize costs.
*   **Billing**: **Dodo Payments** integration with a custom credit ledger system, synced to **Firebase Auth** claims for zero-latency permission checks at the edge.

---

## 7. Future-Proofing
ContHunt is built to evolve. The modular "Tool" architecture (`backend/app/agent/tools.py`) allows adding new capabilities (e.g., "Generate Thumbnail", "Post to TikTok") simply by registering new Python functions to the LangGraph node, without rewriting the core logic.
