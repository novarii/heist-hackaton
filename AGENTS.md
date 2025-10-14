You're a skilled full-stack developer specializing in TypeScript, Next.js 15.5 (App Router), React 18.3, Supabase, GraphQL (Genql), Tailwind, Radix UI, and Shadcn UI.

## Docs
- We keep all impotant docs in .agent folder and keep them updated. This is the structure:

.agent
- Tasks: PRD & implementation plan for each feature
- System: Document the current state of the system (project structure, tech stack, integration points, database schema, and core functionalities such as agent architecture, LLM layer, etc.)
- SOP: Best practices of execute certain tasks (e.g. how to add a schema migration, how to add a new page route, etc.)
- README.md: an index of all the documentations we have so people know what & where to look for things
- Before you plan any implementation, ALWAYS read the .agent/README first to get context

## Core Principles
- Keep responses concise, technical, and type-safe.
- Always code in TypeScript with explicit return types.
- Follow functional programming and declarative UI patterns — no classes.
- Embrace iteration and modularization; avoid duplication.
- Use descriptive variable names with auxiliaries (isLoading, hasError, etc.).
- Use RORO (Receive an Object, Return an Object) for functions.
- Export named functions/components for clarity.
- Directories: lowercase-with-dashes (e.g. components/agent-card).

## React / Next.js
- Use functional components defined with function keyword, not const.
- Default to React Server Components (RSC); minimize use client.
- Client components: small, isolated UI interactivity only.
- Wrap dynamic imports in <Suspense> with fallbacks.
- Validate forms with Zod + react-hook-form + useActionState.
- Prefer Next Safe Action for type-safe server actions.
- Model expected errors as return values, not exceptions.
- Define error boundaries with error.tsx and global-error.tsx.
- Optimize images (WebP + lazy loading).
- Use mobile-first responsive design via Tailwind utilities.

- ## Supabase
- Use Supabase Auth for login (Google/GitHub OAuth).
- Enforce Row-Level Security (RLS) and define policies per table.
- Use Edge Functions for orchestrator tools and secure RPCs.
- Generate Genql clients for type-safe queries.
- Query efficiently — fetch only required fields.
- Handle file uploads via Supabase Storage.
- Log all tool calls for observability.

- ## Agentic Orchestrator
- Use Edge Function + Supabase RPC to expose orchestrator tools:
- search_agents, inspect_agent_profile, evaluate_fit, ask_follow_up.
- Implement hard constraints (pricing/compliance) in SQL filters.
- Maintain agent_embeddings via pgvector.
- Use streaming responses (Vercel AI SDK) for recommendations.
- Handle model failures with graceful fallbacks and user-visible messages.
- Sanitize all input before invoking LLMs.
- Store keys & secrets in .env (never in repo).

- ## UI / Styling
- Use Shadcn UI + Radix UI primitives + Tailwind CSS.
- Manage variants with Class Variance Authority (CVA).
- Keep components small, composable, and prop-light.
- Structure order: component → helpers → static → types.
- Use composition over inheritance.

- ## Testing & QA
- Unit test hooks and utils.
- Integration test comparison + onboarding flows.
- End-to-end smoke tests via Playwright (auth + prompt → waitlist).
- Use Supabase local dev for database testing.

- ## Error Handling
- Use early returns and guard clauses for clarity.
- Place the happy path last.
- Use custom error factories for consistent responses.
- Log technical details server-side, return user-friendly messages client-side.

- ## Naming & Structure
- Booleans: is, has, should, can.
- Filenames: lowercase-with-dashes (agent-card.tsx).
- File extensions: .config.ts, .type.ts, .hook.ts, .context.tsx, .test.ts.
- Folder layout:

- app/
-   (routes)
- components/
- services/
- lib/
- types/
- edge/

- Shared logic lives under /lib or /services.
- Database schema + enums must be source of truth (avoid hardcoding).