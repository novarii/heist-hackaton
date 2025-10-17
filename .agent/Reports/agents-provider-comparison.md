# OpenAI Agents SDK vs Google ADK for the Hiring Agent

## Scope & Evaluation Criteria
- Must embed into our Next.js App Router + Supabase stack without replatforming core services.
- Needs first-class tool calling to hit Supabase, external HR APIs, and planned MCP services.
- Must return both conversational responses and typed data (agent profile cards) to the dashboard.
- Requires short-term memory (multi-turn intake) and long-term memory (persisted candidate context).

## Integration Fit
### OpenAI Agents SDK
- JavaScript and TypeScript packages (`@openai/agents`, `@openai/agents-realtime`) let us run the orchestrator directly inside Next.js server actions or API routes; tools are plain functions with Zod schemas, and sessions can be managed in-process for web transports like WebSocket/WebRTC (packages/agents/README.md; docs/src/content/docs/guides/voice-agents.mdx).
- Python SDK is optional but available for heavier backend jobs; session backends include SQLite, Redis, or SQLAlchemy so we can map to Supabase or Vault-managed Postgres via connection pooling (docs/README.md; docs/sessions.md).
- Built-in tracing and `Runner` abstractions integrate cleanly with our existing observability (docs/agents.md).

### Google Agent Development Kit (ADK)
- Primary runtimes are Python and Java; to keep Next.js we must stand up a sidecar service (Cloud Run or self-hosted) and expose gRPC/REST to the app.
- ADK runners bundle `SessionService`, `MemoryService`, and `ArtifactService`, so we'd manage state outside Supabase unless we build adapters (llms-full.txt).
- Strong enterprise integration story if we lean into Vertex AI Agent Engine; however it assumes Google Cloud IAM, Vertex Projects, and may complicate today’s Supabase-first posture.

## Memory & State
### OpenAI
- Sessions preserve conversational history automatically and can be persisted via `SQLiteSession`, `SQLAlchemySession`, or Redis stores—easy to mount to Supabase via PG adapters (docs/sessions.md; README.md).
- Cookbook guidance on trimming/compressing session payloads shows how to manage short-term memory cost (examples/agents_sdk/session_memory.ipynb).
- Long-term memory is DIY but straightforward: use tool callbacks to write summaries into Supabase tables and hydrate sessions on load.

### ADK
- Session state (`session.state`) is a structured map available to tools and callbacks; ADK exposes utilities for mutating and inspecting state (llms-full.txt).
- Long-term memory is a first-class `MemoryService` with swappable backends: in-memory for dev, Vertex AI RAG Memory for production search across sessions (examples/python/notebooks/express-mode-weather-agent.ipynb; llms-full.txt).
- Session and memory services are part of the runner, so scaling requires coordinating these services or replacing them with custom adapters.

## Tooling & Ecosystem
### OpenAI
- Function tools (`@function_tool`) support typed inputs/outputs; `tool_use_behavior` lets us short-circuit after a tool call or custom-handle tool outputs (docs/agents.md).
- MCP integration provides access controls and dynamic tool filtering for hosted connectors (docs/mcp.md).
- Custom output extractors allow us to transform tool results before returning them to the main agent (docs/tools.md).

### ADK
- Tools are Python callables with access to `ToolContext`, including session state and memory search (docs/tools/index.md; llms-full.txt).
- Rich connector catalog: wrappers for LangChain tools, CrewAI, and Google Integration Connectors widen the automation surface (docs/tools/third-party-tools.md; llms-full.txt).
- Workflow agents (`Sequential`, `Parallel`, `Loop`) enable deterministic multi-agent orchestration out of the box (adk-docs overview in llms-full.txt).

## Structured Output & Backend Contract
### OpenAI
- `output_type` / `AgentOutputSchema` enforces JSON-safe responses using Pydantic/dataclasses; schemas can run in strict or relaxed mode (docs/agents.md; llms.txt).
- We can stream human-facing messages while capturing the final structured payload via `result.final_output_as(...)`, satisfying “respond to user + return card data” (docs/streaming.md).
- If we need both free-form and structured outputs simultaneously, we can use dual channels: send natural language as `message_output_item` and keep the structured object as the final output object.

### ADK
- `output_schema` guarantees JSON but **disables tool use** for that agent, forcing us to choose between tools and structured output in a single loop (llms-full.txt).
- Typical workaround is a orchestration pattern: one agent runs tools, another generates the schema, or we rely on `output_key` to stash structured results in session state.
- For real-time UI feedback we’d need to stream agent messages and separately watch state changes to capture structured data.

## Operations & Observability
- **OpenAI**: Built-in tracing, tool logging guards (`OPENAI_AGENTS_DONT_LOG_TOOL_DATA`), and streaming events map to our existing observability stack (docs/config.md; docs/streaming.md).
- **ADK**: Encourages Google Cloud logging/monitoring; when self-hosted we must wire our own telemetry sinks. Multi-service runner adds operational moving parts.

## Risk Comparison
| Risk | OpenAI Agents SDK | Google ADK |
| --- | --- | --- |
| Stack fit | Native TS SDK aligns with Next.js | Requires separate Python/Java service |
| Structured output + tooling | Supported concurrently | `output_schema` blocks tool calls (llms-full.txt) |
| Memory strategy | Need to design long-term memory layer | Vertex AI MemoryService ready-made but ties to GCP |
| Vendor lock-in | OpenAI pricing/models; MCP broadens tools | Deep dependency on Vertex AI + IAM |
| Developer velocity | Minimal abstractions, strong docs (docs/agents.md) | Steeper learning curve, multi-service setup |

## Recommendation
- **Primary path**: Adopt **OpenAI Agents SDK** for the hiring agent.
  - Direct Next.js integration keeps architecture simple.
  - Structured outputs and tool chaining meet the dashboard + orchestration requirements today.
  - Sessions can persist into Supabase with lightweight adapters.
- **Secondary**: Prototype ADK only if we need Vertex AI memory search or Google-native connectors that MCP can’t cover.

## Next Steps
1. Build a thin Next.js API route using `@openai/agents` Runner with Supabase-backed `SQLiteSession` for persistence (docs/agents.md; docs/sessions.md).
2. Define the agent profile schema via `AgentOutputSchema` and surface both conversational messages and structured payload to the UI.
3. Register hiring tools (Supabase CRUD, ATS connectors) as `@function_tool`s and add guardrails with `tool_use_behavior`.
4. Draft a fallback plan documenting how ADK’s MemoryService could be integrated later if long-term semantic recall becomes a priority.
