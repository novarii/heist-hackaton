# Landing Page n8n Webhook Integration

## Context
- The public landing page collects free-form prompts through `PromptInput`, but there is no backend transport; submissions are currently inert.
- Business goal: forward landing page chat prompts to an existing n8n workflow that orchestrates Supabase vector search to recommend three agents. Immediate milestone is enabling the webhook call and handling the n8n response so the UI can surface recommendations once available.
- Longer term, the same endpoint will evolve to call Supabase directly or fan out to additional services (telemetry, analytics, waitlist capture).

## Goals
- Implement backend primitives so the landing page can POST prompt payloads to an n8n Webhook node and receive synchronous responses.
- Provide a thin abstraction that allows us to swap between the n8n test URL and production URL without touching client code.
- Capture basic request/response telemetry (status, latency) to aid debugging before the recommendation logic is ready.

## Non-Goals
- Building the Supabase vector search logic (handled by the remote n8n workflow).
- Implementing authentication or rate limiting for the public endpoint (document mitigations instead).
- Creating persistence for prompts or agent recommendations.

## User & System Flows
1. **Visitor interaction**: user enters a prompt and submits from the landing chat input.
2. **Next.js Route Handler**: `/api/landing-chat` (or similar) receives the request, validates payload, enriches it (metadata, optional attribution), and proxies it to the configured n8n webhook URL using `fetch`.
3. **n8n workflow**: Webhook node triggers, orchestrates Supabase vector similarity search, and returns the top-three agents synchronously.
4. **Frontend consumption**: API response is returned to the client. Initial implementation can log to console or render skeleton cards (future update).

## Requirements & Acceptance Criteria
- Provide a POST-only route handler under `app/api/landing-chat/route.ts` that accepts `{ prompt: string, tags?: string[], sessionId?: string }`.
- Validate prompt is non-empty, trimmed, and <= 2,000 characters; reject with 400 otherwise.
- Route handler must forward payload (plus metadata) via POST to the configured n8n webhook URL and relay the status code, JSON body, and selected headers.
- Support timeout and retry guidance (single attempt with 12-second timeout; bubble 504-style error if exceeded).
- Distinguish between n8n test vs production URLs via environment variable (`N8N_LANDING_WEBHOOK_URL` for prod, `N8N_LANDING_WEBHOOK_TEST_URL` for local).
- Log failures server-side with enough context (prompt hash, status code, error message).
- Protect against oversized payload by enforcing JSON body size limit (~16 MB aligns with n8n webhook cap). Document requirement for upstream checks.

## Technical Notes
- Next.js App Router route handlers support custom POST endpoints without additional API routes; use the `route.ts` convention and Web Request/Response APIs for streaming or JSON handling.[^next-route]
- n8n Webhook nodes expose distinct test and production URLs. Test URLs require “Listen for test event” while production URLs activate once the workflow is live, and the node can respond immediately or after workflow completion.[^n8n-webhook]
- n8n limits payload size to 16 MB; exceeding this throws an error. Adjust `N8N_PAYLOAD_SIZE_MAX` only if self-hosting, otherwise apply client/server validations.[^n8n-webhook]
- Supabase vector search examples rely on Edge Functions that generate embeddings and invoke RPC functions like `query_embeddings` to fetch nearest neighbors, returning a limited result set (e.g., top 3).[^^supabase-semantic] Our n8n workflow already encapsulates this logic; document expectations for response shape `{ agents: AgentSummary[] }`.

[^next-route]: Next.js Docs – Route Handlers (`route.ts`) support POST, request parsing, and webhook usage. <https://nextjs.org/docs/app/building-your-application/routing/route-handlers>
[^n8n-webhook]: n8n Docs – Webhook node supports test/production URLs, HTTP method selection, response modes, and a 16 MB payload limit. <https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/>
[^supabase-semantic]: Supabase Docs – Semantic search workflow using pgvector, RPC `query_embeddings`, and top-k selection. <https://supabase.com/docs/guides/functions/examples/semantic-search>

## Implementation Plan
1. **Branch & Setup**
   - Create `backend-initialization` branch.
   - Add `.env.example` entries for `N8N_LANDING_WEBHOOK_URL` and `N8N_LANDING_WEBHOOK_TEST_URL`, documenting expected response format and rotation cadence.
2. **Server Route: `/api/landing-chat`**
   - Implement POST handler:
     - Parse JSON body with `await request.json()`; guard against invalid JSON.
     - Validate schema (use zod or lightweight checks).
     - Derive metadata (e.g., timestamp, hashed prompt via `crypto` to avoid logging raw text).
     - Build outbound request to n8n (set `Content-Type: application/json`, include metadata headers like `x-landing-session`).
     - Apply `AbortController` for timeout.
     - Forward status + JSON body to client; map n8n non-2xx to `502 Bad Gateway` with error payload.
   - Log errors using `console.error` (upgrade to structured logger later).
3. **Environment Configuration**
   - Implement helper (e.g., `lib/server/getN8nWebhookUrl.ts`) to select URL: prefer production env var, fall back to test in development.
   - Ensure Next.js runtime config (`runtime = 'nodejs'`) if required for standard `fetch`.
4. **Client Integration**
   - Update `PromptInput` (or parent component) to call `/api/landing-chat`.
   - Display loading state and error state; for now, log response or show placeholder cards.
   - Gate the call behind basic disable if prompt invalid.
5. **Observability & Error Handling**
   - Create simple telemetry helper to log request latency and status.
   - Document manual test steps for verifying n8n test URL via `curl` and browser submission.
6. **Documentation & SOP**
   - Update `.agent/SOP` with instructions for rotating n8n URLs and verifying webhook activation.
   - Capture n8n response schema contract within the Tasks doc once finalized.

## Testing Strategy
- **Unit**: Add tests for request validation helper and URL selection logic (Vitest).
- **Integration (manual)**:
  - Use `pnpm dev` + n8n test URL with `Listen for test event` enabled; verify POST arrives in n8n execution log.
  - Simulate failure (disable workflow) to ensure API returns 502 with descriptive error.
- **Regression Considerations**: Add Playwright placeholder for future automated flow once recommendations render in UI.

## Risks & Mitigations
- **n8n downtime**: fallback plan to return canned recommendations or instruct user to try later; surface friendly messaging client-side.
- **Payload leakage**: hash prompts in logs and ensure env vars not exposed to client bundle.
- **Latency**: Document expected response SLA (<8s). Consider streaming/optimistic UI if n8n processing grows.
- **Rate limiting**: Without auth, risk of abuse. Add TODO for integrating middleware (Upstash Redis or Supabase RLS) once telemetry indicates volume.

## Open Questions
- Confirm response schema from n8n (e.g., `agents: { id, name, summary, confidence }[]`). Update contract once provided.
- Should we capture user email/social handle for follow-up? If yes, extend payload and handle consent UI.
- Will the n8n workflow respond synchronously or require “Respond to Webhook” node with delayed completion? Adjust timeout strategy accordingly.
