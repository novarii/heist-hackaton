# Project Architecture

## Goal
Merak Intelligence surfaces composable AI agents with a cinematic landing experience, concierge onboarding, and a forthcoming builder console. The scaffold emphasises the marketing hero revamp, shared UI primitives, and placeholders for Supabase-backed orchestration layers.

## Tech Stack
- Next.js 15.5 (App Router, React 19, TypeScript strict mode)
- Tailwind CSS 4 with PostCSS, `tailwindcss-textshadow`, and `tailwind-merge`
- Zustand for client state slices
- Supabase (Auth, Postgres, Edge Functions) – integration stubs only
- Vitest for unit tests, Playwright for end-to-end smoke suites
- pnpm for package management and scripts

## High-Level Architecture
### Frontend
- Root layout (`app/layout.tsx`) loads global metadata, registers the temporary Saprona/Cormorant font stack with `next/font`, and delegates theming to `app/globals.css`.
- Route groups segment experiences:
  - Public marketing flows under `app/(public)`.
  - Auth/onboarding flows under `app/(auth)`.
  - Protected console views under `app/(protected)`.
- The redesigned landing route composes header, hero, and lower spotlight sections via colocated components in `app/(public)/landing/_components/`.
- Shared primitives (e.g., `PromptInput`, `AgentCard`) live in `components/` for reuse across route groups.
- Utilities and React hooks reside in `lib/`, and Zustand stores in `stores/`.

### State and Data
- `stores/useAgentStore.ts` defines the initial Zustand slice for agent metadata mutations; it currently powers only local demos.
- No remote data plumbing exists yet. Supabase RPC, GenQL GraphQL clients, and action handlers are planned but not implemented.

### Styling and Brand System
- `app/globals.css` applies the Merak dark palette, registers CSS custom properties for placeholder font variables, and includes helper gradient utilities.
- `tailwind.config.ts` extends Tailwind 4 with Merak colour tokens (`brand.orange.900`, `neutrals.[2|4|6|13]`), custom font families matching the Saprona/Garamond stack, gradient backgrounds (e.g., `bg-red-white-gradient`), bespoke blur strength (`backdrop-blur-2.5`), and the hero text shadow preset.
- `public/landing/` hosts Figma-exported assets (dust texture, chain imagery, glow ellipses, dropdown icon) consumed by the hero and prompt components. Optimisation and art-direction variants are future tasks.
- The marketing `PromptInput` now renders a glassmorphism shell with decorative chains and agent selector affordances; the submit CTA is deferred until functionality is determined.

## Directory Structure
- `app/` – Next.js routes and layouts, grouped by public/auth/protected segments.
- `components/` – Shared UI primitives (`AgentCard`, `PromptInput`).
- `lib/` – Cross-cutting helpers and hooks (`utils.ts`, `hooks/useIsClient.ts`).
- `stores/` – Zustand state slices (`useAgentStore.ts`).
- `public/landing/` – Merak landing assets sourced from Figma.
- `supabase/` – Placeholder directories for migrations, Edge Functions, generated types, and the workflow README.
- `design/` – Reserved for design tokens (currently empty).
- `tests/` – Vitest unit suites (`tests/unit`) and Playwright config (`tests/e2e`).

## Routing Overview
- `/` → Redirects to `/landing`.
- `/landing` (`app/(public)/landing/page.tsx`) → Fixed header navigation (`LandingHeader`), hero experience (`HeroSection`) featuring gradient typography and prompt input, and a glassmorphism lower panel placeholder (`BottomSection`) for future marketplace content.
- `/onboarding` (`app/(auth)/onboarding/page.tsx`) → Step cards guiding Supabase connection and agent blueprint selection.
- `/agents` (`app/(protected)/agents/page.tsx`) → Dashboard list of demo agents rendered via `AgentCard` in dashboard mode.
- Layout wrappers (`app/(public)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(protected)/layout.tsx`) provide shell chrome per access tier; note: protected shell still displays legacy "Heist Console" copy pending full rebrand rollout.

## Shared Components & Hooks
- `components/PromptInput.tsx` – Client-only prompt surface with selectable agent pill, chain art, and internal submission guard.
- `components/AgentCard.tsx` – Presentational card shared between marketing and console variants.
- `lib/hooks/useIsClient.ts` – Utility for hydration-sensitive logic.
- `lib/utils.ts` – Tailwind-safe class name helper (`cn`).

## Supabase Integration
- `supabase/` remains scaffolded only:
  - `migrations/` → SQL change history (empty).
  - `functions/` → Edge Function source (empty).
  - `types/` → Generated types via `pnpm supabase gen types` (empty placeholder).
- `supabase/README.md` outlines expected CLI workflows; no schema or Edge Functions are committed yet.

## Database Schema
- No relational schema exists. Planned tables include `agents`, `agent_tags`, `search_sessions`, and a waitlist table aligned with the marketing capture flow. Coordinate migrations with forthcoming SOP entries once the Supabase layer is enabled.

## Testing Strategy
- Unit: Vitest configuration (`vitest.config.ts`) targets `tests/**/*.{test,spec}.ts(x)`; current coverage asserts `cn` behaviour in `tests/unit/utils.test.ts`.
- E2E: Playwright configuration (`tests/e2e/playwright.config.ts`) is scaffolded with Chromium defaults but no scenarios.
- Linting: `pnpm lint` enforces ESLint with Next.js and Tailwind plugins; the redesign keeps the codebase passing.

## Environment & Configuration
- `.env.example` enumerates Supabase secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `test`, `test:e2e`.
- Tooling configs live at the repository root (`tailwind.config.ts`, `postcss.config.js`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`).

## Future Work
- Replace interim `Space_Grotesk` font with licensed Saprona files and confirm Apple Garamond availability.
- Implement functional agent selector behaviour and populate `BottomSection` with marketplace content.
- Wire Supabase client utilities, migrations, and edge telemetry once schema decisions are made.
- Complete brand consolidation (console header, metadata copies) and expand SOPs for migrations and new routes.

## Related Docs
- `.agent/README.md` – Documentation index and navigation.
- `README.md` – Repository-level overview and onboarding steps.
- `supabase/README.md` – Directory guide for Supabase assets.
- `.agent/Tasks/landing-page-redesign.md` – Detailed implementation plan for the Merak landing experience.
