You're a skilled full-stack developer specializing in TypeScript, Next.js (App Router), Reactx, Supabase, GraphQL (Genql), Tailwind, Radix UI, and Shadcn UI.

# Repository Guidelines

## Docs
- We keep all impotant docs in .agent folder and keep them updated. This is the structure:

.agent
- Tasks: PRD & implementation plan for each feature
- System: Document the current state of the system (project structure, tech stack, integration points, database schema, and core functionalities such as agent architecture, LLM layer, etc.)
- SOP: Best practices of execute certain tasks (e.g. how to add a schema migration, how to add a new page route, etc.)
- README.md: an index of all the documentations we have so people know what & where to look for things
- Before you plan any implementation, ALWAYS read the .agent/README first to get context

## Project Structure & Module Organization
Start from a Next.js App Router scaffold at the repository root. Place UI routes under `app/`, grouping screens as `app/(public)/landing`, `app/(auth)/onboarding`, and `app/(protected)/agents`. Shared UI elements belong in `components/` (e.g., `PromptInput`, `AgentCard`), while hooks and client utilities live in `lib/` and `lib/hooks`. Keep state stores in `stores/` with Zustand slices per domain. Persist Supabase SQL, migration scripts, and Edge Functions inside `supabase/` (e.g., `supabase/functions/search_agents`). Store design tokens or MCP exports in `design/`. Tests should mirror the source tree under `tests/` or `app/**/__tests__`.

## Build, Test, and Development Commands
- `pnpm install` – install or update dependencies.
- `pnpm dev` – run the Next.js dev server with hot reload.
- `pnpm build` – produce an optimized production build; run before release.
- `pnpm lint` – execute ESLint with Next.js + Tailwind configs.
- `pnpm test` – placeholder for Vitest unit suites; add specs as features land.
- `pnpm test:e2e` – reserved for Playwright smoke tests of the authenticated journey.

## Coding Style & Naming Conventions
Write TypeScript with strict mode on. Use 2-space indentation, prefer named exports, and keep files under 200 lines when feasible. Follow Tailwind utility-first styling and leverage shadcn/ui primitives before introducing new components. Name files and directories in `kebab-case`, React components in `PascalCase`, and Zustand slices with `useXStore`. Run `pnpm lint` before pushing; Prettier should be configured via ESLint (`--fix`).

## Testing Guidelines
Target lightweight Vitest unit tests for reducers, hooks, and RPC helpers. Co-locate specs as `*.test.ts(x)` alongside source or in `tests/unit`. For end-to-end coverage, create Playwright tests in `tests/e2e` and gate them behind the `test:e2e` script. Add fixtures for Supabase using a local `.env.test` and seed data. Aim for 70% coverage on core orchestration modules before MVP launch.

## Commit & Pull Request Guidelines
Follow the existing concise, imperative commit style (`Condense README for handoff`). Reference GitHub issues or Linear IDs in the body if applicable. Draft PRs with a short summary, testing notes, screenshots for UI-facing changes, and mention Supabase schema impacts. Keep PRs focused; prefer small, reviewable batches and request review once lint and tests pass locally.

## Supabase & Configuration Notes
Never commit `.env` files. Document required environment variables in `.env.example`. Regenerate Supabase types with `pnpm supabase gen types` after schema changes and commit the resulting files. Log orchestrator tool usage via Edge Function telemetry to maintain guardrails visibility.
