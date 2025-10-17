# Agent Deployment & Chat Interaction SOP

## Purpose
- Provide a repeatable process for shipping AI agents safely across environments.
- Define how user prompts, agent replies, and multi-turn chat sessions should be stored in Supabase so product features remain auditable and privacy-aware.
- Align engineering, product, and ops teams on checkpoints before a new agent or chat feature is exposed to customers.

## Prerequisites & References
- Read `.agent/System/project_architecture.md` for current Supabase tables, route handlers, and integration helpers.
- Review `.agent/Tasks/backend-schema-api-plan.md` for the API roadmap and phased rollout expectations.
- Ensure local environment variables are configured per `.env.example` and Supabase migrations have been applied (`pnpm supabase db push` locally).

## Deployment Best Practices

### Configuration Management
- Keep each agent’s core definition (model ID, tool list, temperature, safety parameters) in version-controlled JSON/TS under `design/agents` or `lib/agents`. Avoid editing config directly inside n8n or Supabase without a matching code change.
- Use environment-specific overlays (`dev`, `staging`, `prod`) so evaluation runs do not leak into customer traffic. Derive secrets from server-only env vars or Supabase secrets; never commit keys.
- Treat prompt templates as code: lint them, unit test interpolations, and snapshot any structured output schemas.

### Environment Promotion
1. **Develop** – Build and evaluate agent updates against canned transcripts and unit tests. Log trial runs via `integration_events`.
2. **Staging** – Replay a golden dataset of conversations (at least 20 transcripts) using the staging agent config. Capture token usage and latency to ensure quotas and SLAs hold.
3. **Production** – Promote only after staging metrics match or beat the previous baseline. Record the release metadata (agent version, model revision) in the deployment log or `integration_events`.

### Evaluation & QA
- Maintain an automated benchmark (Vitest or custom script) that replays regression prompts and asserts structured outputs, policy compliance, and deterministic tags.
- Before launch, conduct red-team checks: prompt injection, jailbreak attempts, prompt collisions, and adversarial tone tests.
- For async tools (webhooks, Supabase RPCs), create Playwright or API tests that confirm timeout handling and fallback messaging.

### Observability & Telemetry
- Extend `integration_events` logging with `event_type = 'agent_run'` for every production invocation, storing request/response hashes, latency, and model metadata.
- Add a lightweight `agent_metrics` materialized view or cron job summarising daily volume, error rate, and average completion time. Surface metrics in an internal dashboard.
- Emit structured logs for guardrail triggers (content filter blocks, max token exits) so incidents can be triaged quickly.

### Security & Compliance
- Enforce RLS on any new chat tables; only the owning profile (or service role) should view transcripts.
- Hash or redact personally identifiable information inside logs. When storing raw prompts, include metadata indicating consent and retention policy.
- Rotate model credentials quarterly and after any vendor incident. Document rotation steps in the same SOP directory.

### Incident Response & Rollback
- Keep the previous agent config ready for instant rollback. Store it under `design/agents/versions`.
- Provide a kill switch: set an environment flag (e.g., `AGENT_DISABLE_CHAT=true`) to short-circuit route handlers and return a friendly maintenance message.
- During incidents, pause queue processing and notify stakeholders via the designated channel (Slack #agents-alerts).

## Chat Interaction Model

### Current Gaps
- We persist the first landing prompt (`anonymous_prompts`) and log integrations, but there is no durable store for multi-turn chat transcripts once users authenticate.
- `comparison_sessions` captures recommendation runs but does not reference per-message context, making it hard to debug or rehydrate a conversation.

### Proposed Schema Additions
Adopt a more expressive schema that separates conversations, participants, and turn data while capturing agent memory artefacts. RLS should mirror `comparison_sessions` ownership rules and ensure the Supabase service role can insert system-generated rows.

**chat_conversations**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| profile_id | uuid | FK `profiles.id`, nullable for anonymous |
| anonymous_prompt_id | uuid | FK `anonymous_prompts.id`, nullable |
| source | text | e.g. `landing`, `dashboard`, `support` |
| channel | text | `async`, `live`, `handoff` |
| status | text | `active`, `closed`, `archived`, `escalated` |
| model_version | text | agent config snapshot |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | maintained via trigger |
| closed_at | timestamptz | nullable |
| metadata | jsonb | AB bucket, campaign, device traits |

**chat_participants**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| conversation_id | uuid | FK `chat_conversations.id` on delete cascade |
| profile_id | uuid | FK `profiles.id`, nullable for virtual/agent actors |
| agent_slug | text | optional reference to catalogued agent |
| role | text | `user`, `assistant`, `observer`, `human_support` |
| state | text | `joined`, `left`, `muted` |
| joined_at | timestamptz | default `now()` |
| left_at | timestamptz | nullable |
| metadata | jsonb | presence, locale, auth provider |

**chat_messages**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| conversation_id | uuid | FK `chat_conversations.id` on delete cascade |
| participant_id | uuid | FK `chat_participants.id`, nullable for system events |
| sequence | bigint | monotonic counter per conversation |
| parent_message_id | uuid | FK `chat_messages.id`, nullable (threads) |
| sender_type | text | enum: `user`, `assistant`, `system`, `tool` |
| content | text | markdown/plain response; use `content_type` for JSON |
| content_type | text | `text`, `json`, `tool_result`, `rich_text` |
| status | text | `delivered`, `failed`, `redacted`, `draft` |
| token_count | integer | optional usage tracking |
| latency_ms | integer | assistant response latency |
| created_at | timestamptz | default `now()` |
| metadata | jsonb | guardrail flags, streaming markers, chunk ids |

Add an index on `(conversation_id, sequence)` and another on `(conversation_id, created_at)` to support chronological retrieval, as recommended by Supabase chat modeling guides ([Stackademic](https://blog.stackademic.com/designing-a-scalable-chat-data-model-in-postgres-with-supabase-1068c2ebcd15)).

**chat_message_attachments**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| message_id | uuid | FK `chat_messages.id` on delete cascade |
| storage_bucket | text | Supabase storage bucket |
| object_path | text | storage key |
| mime_type | text | |
| size_bytes | integer | |
| metadata | jsonb | thumbnails, checksum |

**chat_message_reactions**
| column | type | notes |
| --- | --- | --- |
| message_id | uuid | FK `chat_messages.id` on delete cascade |
| profile_id | uuid | FK `profiles.id` |
| reaction | text | emoji or sentiment label |
| created_at | timestamptz | default `now()` |
_Composite PK (`message_id`, `profile_id`, `reaction`)._

**chat_tool_calls**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| conversation_id | uuid | FK `chat_conversations.id` on delete cascade |
| triggering_message_id | uuid | FK `chat_messages.id` |
| step_number | integer | execution order |
| tool_name | text | name or slug |
| input_payload | jsonb | |
| output_payload | jsonb | |
| latency_ms | integer | |
| status | text | `success`, `fail`, `retry` |
| created_at | timestamptz | default `now()` |

**chat_memories**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| conversation_id | uuid | FK `chat_conversations.id`, nullable for cross-session facts |
| profile_id | uuid | FK `profiles.id`, nullable |
| kind | text | `summary`, `semantic`, `insight` |
| content | text | |
| embedding | vector(1536) | requires pgvector |
| relevance | numeric | 0-1 |
| tags | text[] | topical labels |
| expires_at | timestamptz | nullable |
| created_at | timestamptz | default `now()` |

**chat_conversation_links**
| column | type | notes |
| --- | --- | --- |
| conversation_id | uuid | PK/FK `chat_conversations.id` |
| comparison_session_id | uuid | FK `comparison_sessions.id` |
| waitlist_entry_id | uuid | FK `waitlist_entries.id` |
| integration_event_id | bigint | FK `integration_events.id` |

### Session Lifecycle
1. **Pre-auth prompt** – Create a `chat_conversations` row with `profile_id = null`, register both the anonymous visitor and virtual agent in `chat_participants`, and persist the first turn in `chat_messages`.
2. **Post-auth link** – Once OAuth completes, update the conversation, migrate the participant to the authenticated `profile_id`, and reissue cookies (per `.agent/Tasks/backend-schema-api-plan.md`).
3. **Agent turn** – Persist assistant messages with a monotonic `sequence`, capture token usage, and append any tool chain results via `chat_tool_calls`.
4. **Tool execution** – Represent each external action as a `chat_tool_calls` row and attach the structured output in either `chat_messages` (`content_type = 'tool_result'`) or `chat_message_attachments`.
5. **Memory upkeep** – Periodically summarise the dialogue into `chat_memories` (`kind = 'summary'`) and push salient facts as semantic vectors for retrieval (`kind = 'semantic'`), following the agent memory pattern outlined by Pranav Prakash ([Medium](https://medium.com/@pranavprakash4777/schema-design-for-agent-memory-and-llm-history-38f5cbc126fb)).
6. **Closure** – Mark conversations as `closed` or `handoff`, persist the agent/waitlist linkage in `chat_conversation_links`, and schedule summarisation or purge jobs depending on retention policy.

### Message Retention & Privacy
- Apply TTL for anonymous sessions: cron job to purge `chat_sessions` that never linked to a profile after 30 days.
- Provide a `DELETE /api/chat/{id}` endpoint so authenticated users can request transcript removal; respect the request by deleting messages (cascades) and storing a tombstone in `integration_events`.
- For analytics, derive aggregates from summary tables; avoid running heavy SELECTs on raw transcripts in production workloads.

## Implementation Checklist
1. Write Supabase migrations for the proposed tables and enums (`chat_role`, `chat_status`, `chat_sender_type`, `chat_memory_kind`).
2. Update Supabase types via `pnpm supabase gen types`.
3. Add server helpers for conversations, participants, messages, tool logs, and memories with RLS-safe access (service role for inserts, session client for reads).
4. Extend cookie utilities to map anonymous conversations alongside prompt IDs; include participant ID when available.
5. Implement App Router handlers:
   - `POST /api/chat/conversations` – create/resume conversation + participants.
   - `POST /api/chat/messages` – append user turn, trigger agent run, persist assistant reply and tool calls.
   - `POST /api/chat/messages/[id]/attachments` – upload Supabase storage objects.
   - `PATCH /api/chat/conversations/[id]` – close/escalate conversation, attach comparison/waitlist references.
   - `POST /api/chat/memories/summarise` – background summarisation hook.
6. Update frontend stores (`useAgentStore`) to stream messages (Supabase Realtime) and surface memory-driven recommendations.
7. Document new env vars in `.env.example` (e.g., `CHAT_SESSION_TTL_HOURS`, `CHAT_SUMMARY_CRON`).

## Testing & Monitoring
- Add Vitest coverage for conversation helpers: ownership checks, participant lifecycle, redaction utilities, and summarisation jobs.
- Create seeded transcripts for Playwright end-to-end runs that exercise prompt → auth → waitlist flows and confirm Realtime updates.
- Monitor daily `chat_conversations` count, average turn latency, tool failure rate, and memory recall success rate; alert when error rate exceeds 5% over 15 minutes.
- Schedule quarterly audits of transcripts to ensure GDPR/consent obligations remain satisfied; log audit completion in `integration_events`.

## Further Reading
- Stackademic — *Designing a Scalable Chat Data Model in Postgres with Supabase* (Sept 2025).
- Levi Stringer — *Building Stateful Conversations with Postgres and LLMs* (Mar 2024).
- Pranav Prakash — *Schema Design for Agent Memory and LLM History* (Jul 2025).
