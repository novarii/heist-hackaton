# Heist Agent Marketplace

Production-ready scaffold for the Heist AI agent marketplace and orchestration console.

## Overview
- Marketplace for specialized AI agents with a concierge hiring assistant.
- Core flow: landing prompt → auth gate → onboarding → comparison view → agent profile → waitlist.
- Supabase-backed orchestrator tools log telemetry for guardrails and auditing.

## Getting Started
1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and add Supabase credentials.
3. Run the dev server with `pnpm dev`.
4. Execute `pnpm lint` before pushing changes.

## Available Scripts
- `pnpm dev` – start Next.js with hot reload.
- `pnpm build` – create an optimized production build.
- `pnpm start` – run the compiled app in production mode.
- `pnpm lint` – run ESLint with Next.js and Tailwind rules.
- `pnpm test` – execute Vitest unit suites (add specs under `tests/`).
- `pnpm test:e2e` – run Playwright smoke tests for the authenticated journey.

## Project Structure
- `app/` – App Router entries grouped as public, auth, and protected experiences.
- `components/` – Shared UI primitives such as `AgentCard` and `PromptInput`.
- `lib/` – Cross-cutting utilities and React hooks.
- `stores/` – Zustand slices for local state.
- `supabase/` – Database migrations, generated types, and Edge Functions.
- `design/` – Design tokens and MCP exports.
- `tests/` – Vitest and Playwright suites mirroring the source tree.

Refer to `.agent/README.md` for the full documentation index, including SOPs and system design notes.
