# Backend Schema & API Plan

## Context & Goals
- Support the prototype funnel: landing prompt → auth gate → onboarding → comparison view → agent profile → hire CTA waitlist.
- Persist hires data in Supabase for future analytics while delegating initial prompt handling to an existing n8n hiring agent via webhooks.
- Provide a pragmatic task breakdown so we can implement backend pieces incrementally without blocking UI work.

## Guiding Assumptions
- Supabase Auth (GoTrue) remains the source of truth for users; we extend it with a `profiles` table for app metadata.
- n8n exposes an HTTPS webhook that accepts JSON; we invoke it server-side to keep the secret out of the browser. Payload must include `prompt_text`, `role`, `company`, `company_size`, and `focused_industries`. Responses are non-blocking acknowledgements.
- First prompt happens pre-auth; we capture it as an anonymous lead, then connect it to a user once they finish OAuth.
- Comparison fit scores start rule-based (weighted tags, role match); we store outcomes to revisit ML ranking later.
- Supabase Row Level Security (RLS) must be enabled; policies will scope reads/writes to the current `auth.uid()` except for public catalog data.

## Data Model (Supabase)
**profiles**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK, references `auth.users.id`, cascade delete |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | trigger-managed |
| role | text | enum check (`employer`, `founder`, `recruiter`, `other`) |
| company | text | nullable |
| company_size | text | small/med/enterprise |
| focus_industries | text[] | optional |
| onboarding_status | text | `pending`, `completed` |

**anonymous_prompts**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK default `gen_random_uuid()` |
| created_at | timestamptz | |
| prompt_text | text | raw prompt |
| source | text | e.g. `landing` |
| n8n_run_id | text | response identifier |
| ip_hash | text | salted hash for deduping |
| user_agent | text | audit |
| linked_profile_id | uuid | FK to `profiles.id`, nullable |

**agents**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| slug | text | unique, stable identifier for routing |
| name | text | display name; slug is stored to avoid regenerating on rename |
| tagline | text | short summary |
| description | text | long copy |
| pricing_model | text | e.g. `subscription`, `hourly`, `custom` |
| base_rate | numeric | nullable |
| rating | numeric | 1-5, aggregated from user reviews |
| experience_years | int | optional |
| success_rate | numeric | stored % |
| visibility | text | `public`, `hidden`, `internal` |
| profile_embedding | vector(1536) | requires `pgvector`; dimension should match chosen embedding model |

> Enable the `vector` extension in Supabase before running migrations, per pgvector guidance ([Supabase Docs – Vector columns](https://supabase.com/docs/guides/ai/vector-columns)).

**agent_tags**
| id | uuid | PK |
| label | text | unique e.g. `executive-search`, `fintech` |

**agent_tag_map**
| agent_id | uuid | FK `agents.id` |
| tag_id | uuid | FK `agent_tags.id` |
| weight | integer | 1-5 for scoring |
_Composite PK (`agent_id`, `tag_id`)._

**agent_endorsements**
| id | uuid | PK |
| agent_id | uuid | FK |
| author | text | client name / anonymized |
| quote | text | endorsement |
| happened_at | timestamptz | optional |

**comparison_sessions**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| profile_id | uuid | FK `profiles.id`, nullable for anonymous |
| anonymous_prompt_id | uuid | FK `anonymous_prompts.id`, nullable |
| created_at | timestamptz | |
| filter_payload | jsonb | store filters applied |

**comparison_candidates**
| session_id | uuid | FK `comparison_sessions.id` |
| agent_id | uuid | FK `agents.id` |
| fit_score | numeric | 0-100 |
| reasons | text[] | supporting bullet copy |
_Composite PK (`session_id`, `agent_id`)._

**waitlist_entries**
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| profile_id | uuid | FK |
| agent_id | uuid | FK |
| comparison_session_id | uuid | FK |
| email_override | text | capture if anonymous |
| message | text | optional |
| status | text | `new`, `contacted` |
| created_at | timestamptz | |

**integration_events**
| column | type | notes |
| --- | --- | --- |
| id | bigint | `bigserial` |
| created_at | timestamptz | |
| provider | text | e.g. `n8n` |
| event_type | text | `prompt_submitted`, `n8n_callback` |
| payload | jsonb | request/response snapshot |
| status | text | `success`, `error` |
| reference_id | uuid | correlated record id |

### Supporting Bits
- Triggers: update `updated_at` on `profiles`, `agents`.
- Enums: use `CREATE TYPE` for `user_role`, `onboarding_status`, `visibility` for consistency.
- Create materialized view or SQL function later for `agent_public_view` if we need aggregated stats.

## API & Integration Surface (Next.js Route Handlers)
1. `POST /api/public/prompts`
   - Accepts `{ prompt: string }`.
   - Writes to `anonymous_prompts`.
   - Calls n8n webhook with prompt payload + generated `prompt_id`.
   - Returns 202 + `promptId`; sets HTTP-only cookie to track across auth redirect.
2. `POST /api/auth/link-prompt`
   - Called after OAuth; reads `promptId` cookie.
   - Updates `anonymous_prompts.linked_profile_id`.
3. `POST /api/onboarding/profile`
   - Requires session; upserts role/company metadata into `profiles`.
4. `GET /api/agents`
   - Supports filters (`tags`, `pricing_max`, `min_fit`, `search`).
   - Returns 3-5 agents plus computed `fit_score` if `promptId` provided (joins against `comparison_candidates` or computes on the fly).
5. `POST /api/agents/compare`
   - Accepts filters + optional prompt context.
   - Generates `comparison_sessions` row and `comparison_candidates` entries.
   - Returns ordered agents + fit rationale.
6. `GET /api/agents/[slug]`
   - Public; returns agent details, endorsements.
7. `POST /api/hire/waitlist`
   - Accepts `{ agentId, message, contactEmail? }`.
   - For authenticated users, use `profile_id`; else store email override and optionally attach `anonymous_prompt_id`.
   - Optionally ping n8n or Slack via Webhook for concierge follow-up.
8. `POST /api/integrations/n8n-callback` (optional future)
   - Endpoint if n8n needs to send asynchronous updates (e.g., recommended agents). Stores payload in `integration_events`.

All handlers run in Next.js App Router route handlers (`app/api/.../route.ts`) and use Supabase server/session clients built with the `@supabase/ssr` helpers (per the 2025 guidance replacing `@supabase/auth-helpers-nextjs`). Secret-key (service_role privileged) calls—like inserting integration logs—should instantiate a one-off `createClient` from `@supabase/supabase-js` with that key restricted to server runtime. Secrets (n8n webhook URL/token) live in Supabase config or server-only env vars.

## Security & Policies
- Enable RLS on all new tables.
- `profiles`: users can `select`/`update` their own record; secret key (service_role role) for onboarding; admin role for support dashboards.
- `anonymous_prompts`: only secret key (API) can insert/select; allow `update` when `linked_profile_id` is null and matching `auth.uid()` cookie (handled server-side).
- `agents` & related tables: `visibility = 'public'` rows readable by anon; updates restricted to secret key usage.
- `comparison_sessions`/`comparison_candidates`: readable by owning profile; insert via secret key (API). Consider periodic cleanup of anonymous sessions.
- `waitlist_entries`: only secret key + admin. Provide Supabase Edge Function for admin listing.
- `integration_events`: secret key insert/select.

## Implementation Tasks & Sequencing
### Phase 1 – Foundation
1. Create Supabase enums (`user_role`, `company_size`, `onboarding_status`, `agent_visibility`, `waitlist_status`).
2. Enable the `vector` extension (`create extension if not exists "vector";`) in the initial migration.
3. Write SQL migration for core tables (`profiles`, `anonymous_prompts`, `agents`, `agent_tags`, `agent_tag_map`, `triggers`) including `agents.profile_embedding vector(1536)` and `agents.rating` numeric.
4. Add follow-up migrations for endorsements, comparison sessions, waitlist, integration events.
5. Generate Supabase types (`pnpm supabase gen types --project-id ...`) and commit.
6. Configure RLS policies per table; add helper SQL functions if needed (`auth.uid()` wrappers).

### Phase 2 – Service Clients & Utilities
7. Add session-aware Supabase server helper using `@supabase/ssr` (`lib/supabase/server.ts`) plus a separate secret-key helper (`lib/supabase/service-client.ts`) that only runs in the Node runtime.
8. Implement fetch helper for n8n webhook with retry/backoff and logging into `integration_events`.
9. Create cookie helper for storing `promptId` securely (signed cookie via `iron-session` or Next `cookies` API with hash).

### Phase 3 – API Route Handlers
10. Build `POST /api/public/prompts`: validate input (Zod), persist, invoke n8n, record event.
11. Build `POST /api/auth/link-prompt`: map anonymous prompt to authenticated profile; handle missing cookie gracefully.
12. Build `POST /api/onboarding/profile`: upsert profile metadata and set `onboarding_status`.
13. Build `GET /api/agents`: fetch agents with filters, join tags, include fit score stub (placeholder calculation), surface `rating` and vector-backed similarity meta where available.
14. Build `POST /api/agents/compare`: create session, compute fit (combine embeddings + rule weights), persist `comparison_candidates`.
15. Build `GET /api/agents/[slug]`: aggregate endorsements and basic metrics.
16. Build `POST /api/hire/waitlist`: persist, optional n8n/Slack ping, log integration event.

### Phase 4 – Scoring & Personalization
17. Implement fit scoring utility combining vector similarity with rules (weights tags, role alignment, success rate, rating). Store results in `comparison_candidates`.
18. If n8n returns agent IDs, reconcile by updating the session results and storing reference in `integration_events`.

### Phase 5 – Observability & Cleanup
19. Add scheduled job (Supabase cron or Next Cron) to purge stale anonymous prompts >30 days and anonymize IP hashes.
20. Extend Vitest coverage for scoring utility and route handlers (mock Supabase client).
21. Document new env vars in `.env.example` (Supabase publishable + secret keys, n8n webhook URL/token).
22. Update `.agent/System/project_architecture.md` with backend module overview once implemented.

## Integration Touchpoints
- **n8n Ingress**: Provide JSON payload `{ prompt_text, role, company, company_size, focused_industries, promptId?, sessionId? }`; handle 202 or 200. Store response in `integration_events`.
- **n8n Egress (optional)**: If we adopt callback, document signature and verify `X-Webhook-Signature`.
- **Supabase Auth**: ensure Next middleware enforces auth gate before onboarding/comparison routes.
- **Edge Functions (future)**: consider function to expose admin view of waitlist for internal tools.

## Open Questions / Follow-ups
1. (Resolved) n8n payload contract defined: send `prompt_text`, `role`, `company`, `company_size`, and `focused_industries`; update if the workflow schema changes.
2. Do we need GDPR consent tracking alongside prompt capture? If yes, add `consent_version` column.
3. Should waitlist submissions automatically notify Slack/Email? Decide on integration for task 15.
4. Define admin access pattern (Supabase Studio vs custom dashboard) to finalize RLS exceptions.

## Testing Strategy
- Unit tests for scoring utility and prompt-to-session linking.
- Integration tests for API handlers using `@supabase/supabase-js` mocked responses.
- Manual verification: run through landing prompt → auth → onboarding → comparison → waitlist to ensure records link correctly.

## Definition of Done
- All migrations applied locally; Supabase types generated.
- API handlers return expected payloads documented in collection (Insomnia/Postman).
- n8n webhook receives real prompt payload and logs event in Supabase.
- Frontend surfaces can consume new endpoints without bypassing auth.
- Documentation updated (`.env.example`, `.agent/System/project_architecture.md`, API reference in repo wiki or README section).
