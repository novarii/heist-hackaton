# AI Agent Marketplace Prototype (Snapshot)

Short brief for Codex CLI implementers.

## What We’re Building
- Marketplace for specialized AI agents with a concierge hiring assistant.
- Core flow: landing prompt → auth gate → onboarding → comparison view → agent profile → waitlist.

## Must-Have Screens
1. **Landing** – Lovable-style hero, persistent prompt input, curated categories.
2. **Auth & Onboarding** – Supabase OAuth (Google/GitHub) followed by quick role/industry/use-case/budget form.
3. **Comparison View** – 3–5 agents side-by-side with fit %, differentiators, filters (industry, fit threshold, deployment speed).
4. **Agent Profile** – Overview, tooling stack, pricing, endorsements, badges.
5. **Waitlist CTA** – Form captures email + notes, shows confirmation state.

## Agentic Recommendation Engine
- **Orchestrator Agent:** LLM-driven with tools `search_agents`, `inspect_agent_profile`, `evaluate_fit`, optional `ask_follow_up`.
- **Data Source:** Supabase Postgres + pgvector (keep `search_agents` interface swappable for future vector DB).
- **Guardrails:** Enforce hard constraints (compliance, pricing) via SQL filters; log tool calls for observability.

## Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Zustand for local prompt state, TanStack Query for data fetching.
- **Backend:** Supabase Auth, Postgres tables (`profiles`, `agents`, `agent_tags`, `agent_endorsements`, `search_sessions`, `waitlist`, `agent_embeddings`). Edge Functions expose orchestrator tools.
- **Design:** Figma MCP to sync design tokens/components.

## Implementation Priorities
1. Provision Supabase project, enable pgvector, seed initial agent metadata + embeddings.
2. Scaffold Next.js app with protected routes and shared PromptInput/AgentCard components.
3. Implement orchestrator agent service + tool RPCs, surface comparison results in UI.
4. Capture analytics + feedback events for prompt usage and waitlist conversions.

## Testing & QA
- Manual validation of prompt → recommendation → waitlist flow.
- Add Playwright smoke test for authenticated journey when time permits.

## Status
- Planning stage; no automated tests yet.
