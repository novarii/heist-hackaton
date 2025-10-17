# Backend Schema & API Plan (Python Agent Integration)

## Context & Goals
- Replace the n8n webhook flow with a Python Agents SDK microservice that owns orchestration, scoring, and any future chain-of-thought.
- Keep Next.js (App Router) as the primary API surface while delegating multi-turn reasoning to the Python service through internal REST/gRPC endpoints.
- Retire pre-auth prompt caching; instead, rely on authenticated flows and persistent memory backed by Supabase `pgvector`.
- Establish a long-term memory layer so the Python service can retrieve and inject historical insights when running the OpenAI agent, without relying on session-bound “short-term” memory.

## Guiding Assumptions
- Supabase Auth remains the source of truth for users; mutations continue to happen through service-role calls on the server.
- The Python service runs inside our infrastructure (Fly, Railway, or local container) and communicates with Next.js over an internal network using JWT or HMAC headers.
- OpenAI Agents Python SDK handles per-run context; durable context is persisted inside Supabase using embeddings (similarity search) and structured logs.
- Latency constraints are acceptable for the prototype; we will stream responses whenever possible to avoid blocking UX.

## Data Model (Supabase)
**profiles** *(unchanged from v1)*
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK, references `auth.users.id`, cascade delete |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | trigger-managed |
| role | text | enum (`employer`, `founder`, `recruiter`, `other`) |
| company | text | nullable |
| company_size | text | enum (`small`, `mid`, `enterprise`) |
| focus_industries | text[] | optional |
| onboarding_status | text | enum (`pending`, `completed`) |

**agents** *(unchanged core fields)*
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| slug | text | unique |
| name | text | display |
| tagline | text | short summary |
| description | text | long copy |
| pricing_model | text | e.g. `subscription`, `hourly`, `custom` |
| base_rate | numeric | nullable |
| rating | numeric | 1-5 |
| experience_years | int | optional |
| success_rate | numeric | stored % |
| visibility | text | enum (`public`, `hidden`, `internal`) |
| profile_embedding | vector(1536) | similarity search for matching |

**agent_tags**, **agent_tag_map**, **agent_endorsements** *(unchanged — keep taxonomy & testimonials).*

**agent_sessions**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| profile_id | uuid | FK `profiles.id`, nullable for exploratory browsing |
| agent_context | jsonb | arbitrary session metadata (filters, goals) |
| created_at | timestamptz | default `now()` |
| closed_at | timestamptz | nullable |
| owning_agent_id | uuid | FK `agents.id`, nullable when session spans multiple agents |

> Replaces the former `comparison_sessions` concept and owns both comparison and conversational flows.

**session_candidates**
| session_id | uuid | FK `agent_sessions.id` |
| agent_id | uuid | FK `agents.id` |
| fit_score | numeric | 0-100 |
| rank | int | optional |
| rationale | text[] | supporting copy shown to the user |
_Composite PK (`session_id`, `agent_id`)._

**agent_memories**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| profile_id | uuid | FK `profiles.id` |
| agent_id | uuid | FK `agents.id`, nullable when memory applies globally |
| created_at | timestamptz | default `now()` |
| source | text | e.g. `chat`, `comparison`, `feedback` |
| content | text | human-readable snippet or summary |
| embedding | vector(1536) | cosine similarity for retrieval |
| metadata | jsonb | structured payload (task id, session id, tags) |

> Serves as the “long-term memory” store. Python service generates embeddings (text-embedding-3-large or similar) and upserts rows. Retrieval uses `pgvector` search ordered by similarity constrained to the current `profile_id`.

**agent_run_logs**
| column | type | notes |
| --- | --- | --- |
| id | bigint | bigserial |
| session_id | uuid | FK `agent_sessions.id` |
| profile_id | uuid | FK `profiles.id` |
| agent_id | uuid | FK `agents.id` |
| created_at | timestamptz | default `now()` |
| input | jsonb | raw user prompt or request |
| output | jsonb | agent response payload |
| latency_ms | integer | measured by Next.js before/after hitting Python |
| error | jsonb | nullable, store stack/message when runs fail |

**waitlist_entries** *(retain for hire CTA)*  
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| profile_id | uuid | FK |
| agent_id | uuid | FK |
| session_id | uuid | FK `agent_sessions.id` |
| email_override | text | optional |
| message | text | optional |
| status | text | enum (`new`, `contacted`) |
| created_at | timestamptz | default `now()` |

> Deprecated tables: `anonymous_prompts`, `integration_events` (replace with `agent_run_logs`), `comparison_candidates` (renamed to `session_candidates`).

### Supabase Extensions & Types
- Enable `vector` extension in the very first migration for `profile_embedding` and `agent_memories.embedding`.
- Define enums: `user_role`, `company_size`, `onboarding_status`, `agent_visibility`, `waitlist_status`, and new `memory_source` if we want database-level checks.
- Consider RLS helper function `is_session_owner(session_id uuid)` to reduce policy duplication.

## API & Service Architecture
1. **Python Agents Service**
   - FastAPI (or similar) exposing endpoints:
     - `POST /agents/run` — accepts session ID, prompt, optional Next.js-collected metadata; uses OpenAI Agents Python SDK (`Runner.run`) with a transient `session` (no built-in memory). Before the run, fetch relevant `agent_memories` from Supabase via similarity search and add them as `memory` input items using the SDK’s memory API (`add_items` endpoint in the docs).
     - `POST /agents/sessions/{id}/close` — optional hook to mark `agent_sessions.closed_at`.
     - `POST /agents/memories` — invoked after a successful run to store distilled memories (Python agent decides what to persist).
   - Uses Supabase service-role key (server-only) to read/write `agent_sessions`, `session_candidates`, `agent_memories`, `agent_run_logs`.
   - Handles embedding generation (text-embedding-3-large) and writes vectors into Supabase.

2. **Next.js Route Handlers**
   - `POST /api/agents/compare`: creates `agent_sessions`, requests scores from Python service, persists `session_candidates`.
   - `POST /api/agents/chat`: proxies user prompt + session metadata to Python service, streams response back, and logs the run.
   - `POST /api/hire/waitlist`: unchanged, but now references the session ID returned by chat/comparison.
   - `GET /api/agents`, `GET /api/agents/[slug]`: unchanged except they may hydrate with `agent_memories` stats later.

3. **Supabase Policies**
   - `agent_sessions`: session owners can select/update their records; inserts restricted to server/service key.
   - `session_candidates`: readable by owning profile only.
   - `agent_memories`: readable by owning profile, insert/update via service key.
   - `agent_run_logs`: service key insert; optional admin read.
   - `waitlist_entries`: service key insert/select; admin read.

## Implementation Tasks & Sequencing
### Phase 1 – Foundation
1. Create enums and enable `vector` extension.
2. Write migrations for updated tables (`agent_sessions`, `session_candidates`, `agent_memories`, `agent_run_logs`, `waitlist_entries`).
3. Drop legacy tables (`anonymous_prompts`, `comparison_sessions`, `comparison_candidates`, `integration_events`) if they exist in dev; document the migration as breaking change.
4. Generate Supabase types and update server/shared clients.

### Phase 2 – Service Clients & Utilities
5. Keep the existing Supabase SSR helper plus a service-role client module.
6. Add a typed client wrapper for calling the Python service with retries and auth headers.
7. Create embedding helper in the Python repo (wraps OpenAI embeddings API) with batch writes to Supabase.

### Phase 2B – Python Agents Service
8. Scaffold FastAPI app with routes (`/agents/run`, `/agents/memories`, `/healthz`).
9. Implement Supabase integration layer (async `supabase-py` or direct REST).
10. Wire `Runner.run` and the memory management flow:
    - Fetch top-K `agent_memories` by `profile_id` using cosine distance.
    - Convert each memory into a `{"role": "memory", "content": ...}` item and add via `session.add_items`.
    - Run agent and stream output.
11. Persist run outputs and new memory summaries back into Supabase.
12. Add contract tests to ensure Next.js ↔ Python payload compatibility.

### Phase 3 – Next.js API Routes
13. Implement new `/api/agents/compare` and `/api/agents/chat` handlers, forwarding auth context and session IDs.
14. Update client-side flows (comparison view, chat UI) to consume the new endpoints and display streamed responses.
15. Update `/api/hire/waitlist` to expect a valid `agent_session_id`.

### Phase 4 – Memory & Personalization
16. Define heuristics in Python for when to persist a response as long-term memory (e.g., if user explicitly shares preferences). Store condensed summary + embedding in `agent_memories`.
17. Implement similarity retrieval for every run, with fallbacks when fewer than K memories are available.
18. Expose an admin endpoint to inspect memory rows when debugging.

### Phase 5 – Observability & QA
19. Populate `agent_run_logs` for every request/response cycle, including duration and error info.
20. Add health checks for Python service; surface status in Next.js `/api/status`.
21. Expand Vitest coverage for API handlers (mock Python client); add Pytest coverage for FastAPI endpoints.
22. Document environment variables (`PY_AGENT_SERVICE_URL`, `PY_AGENT_SERVICE_SECRET`, `OPENAI_API_KEY`, Supabase keys) in `.env.example` and `.agent/System/project_architecture.md`.

## Long-Term Memory Strategy (Using pgvector)
1. **Embedding Generation**: Python service uses OpenAI embeddings before storing new memories. Persist both the raw snippet and embedding in `agent_memories`.
2. **Retrieval**: Before executing `Runner.run`, query Supabase with `SELECT ... ORDER BY embedding <#> query_embedding LIMIT K` to fetch relevant memories. Inject them into the agent via memory API (`POST /api/memory/items`) or by prepending to the run input.
3. **Decay & Curation**: Schedule a Supabase cron job to soft-delete or archive memories beyond a freshness threshold, or to down-rank low-similarity entries.
4. **Privacy & RLS**: All memory reads/writes are scoped to `profile_id`; no cross-user leakage.
5. **Evaluation**: Track retrieval hit rate and response quality using `agent_run_logs`, enabling future tuning (e.g., change embedding model, adjust top-K).

## Testing Strategy
- **Database**: Migration tests ensuring vector indexes exist; Supabase Row Level Security unit tests using SQL scripts.
- **Python Service**: Pytest suite for run flows, memory retrieval/insertion, and error handling. Mock OpenAI when network-disabled.
- **Next.js**: Contract tests hitting a mocked Python service; Vitest coverage for API route guards and Supabase mutations.
- **End-to-End**: Optional Playwright scenario covering “user compares agents → starts chat → join waitlist” verifying records in `agent_sessions`, `session_candidates`, and `agent_memories`.

## Definition of Done
- Supabase migrations applied locally with regenerated types.
- Python service deployed or containerized with health checks.
- Next.js routes wired to the Python service and streaming responses verified.
- Memory persistence is functional: new `agent_memories` rows created, retrievable, and injected into subsequent runs.
- Documentation updated (`.env.example`, `.agent/System/project_architecture.md`, this plan).
