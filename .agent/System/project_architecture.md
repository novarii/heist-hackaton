# Project Architecture

## Goal
Heist Agent Marketplace showcases and manages AI agents with a concierge onboarding flow. The scaffold currently focuses on establishing the Next.js App Router structure, shared UI primitives, and placeholders for Supabase-backed orchestration services.

## Tech Stack
- Next.js 14 (App Router, React 18, TypeScript strict mode)
- Tailwind CSS 3 with PostCSS and `tailwind-merge`
- Zustand for client state slices
- Supabase (Auth, Postgres, Edge Functions) – integration stubs only
- Vitest for unit tests, Playwright for end-to-end smoke suites
- pnpm for package management and scripts

## High-Level Architecture
### Frontend
- Root layout (`app/layout.tsx`) wires global metadata and base styling.
- Route groups split experiences by access level:
  - Public marketing flows under `app/(public)`.
  - Auth/onboarding flows under `app/(auth)`.
  - Protected console views under `app/(protected)`.
- Shared components (e.g., `PromptInput`, `AgentCard`) live in `components/` for reuse across routes.
- Utilities and React hooks reside in `lib/`, with Zustand stores in `stores/`.

### State and Data
- `stores/useAgentStore.ts` defines the initial Zustand slice for managing agent metadata locally.
- Data-fetching layers (Supabase RPC, GraphQL clients) are not yet implemented; placeholders anticipate future expansion.

### Styling and UI
- Tailwind powers utility-first styling, with `app/globals.css` bootstrapping base styles.
- `lib/utils.ts` exports `cn` (clsx + tailwind-merge) to compose class names safely.

## Directory Structure
- `app/` – Next.js App Router entries, grouped by route segment.
- `components/` – Shared UI primitives (`AgentCard`, `PromptInput`).
- `lib/` – Cross-cutting helpers and hooks (`utils.ts`, `hooks/useIsClient.ts`).
- `stores/` – Zustand state slices (`useAgentStore.ts`).
- `supabase/` – Placeholder directories for migrations, Edge Functions, and generated types.
- `design/` – Reserved for design tokens (currently empty).
- `tests/` – Vitest unit suites and Playwright configuration.

## Routing Overview
- `/` → Redirects to `/landing`.
- `/landing` (`app/(public)/landing/page.tsx`) – Marketing hero, prompt input, featured agents.
- `/onboarding` (`app/(auth)/onboarding/page.tsx`) – Guided steps for connecting Supabase and selecting templates.
- `/agents` (`app/(protected)/agents/page.tsx`) – Dashboard list of agents with quick status context.
- Layout wrappers (`app/(public)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(protected)/layout.tsx`) provide shell chrome per access tier.

## Shared Components & Hooks
- `components/PromptInput.tsx` – Client-side prompt form with submission state management.
- `components/AgentCard.tsx` – Presentational card supporting marketing and dashboard variants.
- `lib/hooks/useIsClient.ts` – Detects client-side rendering for hydration-sensitive features.
- `lib/utils.ts` – Tailwind-safe class name helper.

## Supabase Integration
- `supabase/` contains stubs:
  - `migrations/` for SQL migrations.
  - `functions/` for Edge Functions (e.g., future orchestrator tools).
  - `types/` for generated TypeScript definitions.
- `supabase/README.md` describes expected workflows; no migrations or functions are committed yet.

## Database Schema
- No schema is defined at this stage. Future migrations should introduce core tables such as `agents`, `agent_tags`, `search_sessions`, and `waitlist` per the product brief in `README.md`. Use `.agent/SOP` runbooks once created to coordinate migrations and Supabase type generation.

## Testing Strategy
- Unit tests: Vitest config (`vitest.config.ts`) executes files under `tests/**/*.{test,spec}.ts(x)`. Current coverage includes `tests/unit/utils.test.ts` for the `cn` helper.
- End-to-end: Playwright config (`tests/e2e/playwright.config.ts`) targets Chromium with retry logic for CI. No scenarios implemented yet.

## Environment & Configuration
- `.env.example` tracks required Supabase variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- `package.json` scripts:
  - `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`.
- Tooling configs live at the repository root (`tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`, `next.config.ts`, `tsconfig.json`).

## Future Work
- Implement Supabase client initialization and data fetching hooks.
- Build orchestrator agent services (Edge Functions + RPC wiring).
- Expand SOP runbooks for migrations, edge deployments, and route creation.
- Add comparison and profile routes to complete the marketplace flow.

## Related Docs
- `.agent/README.md` – Documentation index and navigation.
- `README.md` – Repository-level overview and onboarding steps.
- `supabase/README.md` – Directory guide for Supabase assets.
