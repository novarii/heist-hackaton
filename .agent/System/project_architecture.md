# Project Architecture

## Goal & Product Posture
The codebase scaffolds a marketing-to-console funnel for the Heist AI agent marketplace. Public copy refers to “Merak Intelligence” while protected surfaces still display “Heist Console”, signalling an in-progress rebrand. The current implementation centres on a cinematic landing page, a guided onboarding checklist, and a stubbed agent dashboard that will eventually sit on top of Supabase-backed orchestration services.

## Tech Stack Snapshot
- **Runtime**: Next.js `15.5.4` (App Router) with React `19.2.0` and TypeScript `5.9.3` in strict mode.
- **Styling**: Tailwind CSS `4.1.14` (CSS-first pipeline) with custom utilities defined via `@theme`/`@utility` and `tailwind-merge`.
- **State**: Zustand `5.0.8` slices for client-side data.
- **Date utilities**: `date-fns` `3.6.0` for formatting in agent cards.
- **Tooling**: ESLint `9.36.0`, Vitest `3.0.0`, Playwright `1.55.1`, pnpm `8.15.6`.
- **Backend targets**: Supabase (Auth, Postgres, Edge Functions) – not yet wired.
- **Images**: Next Image with SVG allowance enabled through `next.config.ts`.

## Application Architecture
### Routing & Layouts
- **Root layout (`app/layout.tsx`)** sets HTML metadata, registers Google-hosted Space Grotesk and Cormorant Garamond fonts, and applies global Tailwind styles via `app/globals.css`.
- **Route groups** split surfaces by access:
  - `app/(public)` – marketing pages (currently only `/landing`).
  - `app/(auth)` – onboarding flow gated by future auth.
  - `app/(protected)` – console surfaces visible post-auth.
- **`app/page.tsx`** immediately `redirect("/landing")` to keep `/` URL thin.
- Group layouts provide shell chrome: public is a simple wrapper, auth/protected render dark shells with console stylings.

### Feature Surfaces
- **Landing (`app/(public)/landing/page.tsx`)** composes:
  - `LandingHeader` – fixed navigation with placeholder links and a brand wordmark.
  - `HeroSection` – gradient-backed hero with decorative dust overlays, glowing ellipse assets, and the `PromptInput` component with an inert agent selector toggle.
  - `BottomSection` – glassmorphism container intended for future agent marketplace listings.
- **Onboarding (`app/(auth)/onboarding/page.tsx`)** presents static checklist cards describing Supabase setup and agent blueprint selection, with CTA links to `/agents` or back to `/landing`.
- **Agents dashboard (`app/(protected)/agents/page.tsx`)** renders two demo agents using shared `AgentCard` components. Data is hard-coded; persisted state will replace this later.

### Shared Modules
- `components/PromptInput.tsx` – client component managing local text state, optional agent selector pill, and decorative chain imagery sourced from `public/landing`. Submission is a no-op unless `onSubmit` is injected.
- `components/AgentCard.tsx` – presentation card supporting `marketing` and `dashboard` variants, using `formatDistanceToNow` when a `lastRun` timestamp is provided.
- `stores/useAgentStore.ts` – Zustand slice with `addAgent` and `updateStatus` helpers; currently unused by any page.
- `lib/utils.ts` – Tailwind-aware `cn` helper built on `clsx` + `tailwind-merge`.
- `lib/hooks/useIsClient.ts` – Hydration guard hook (currently unused but ready for SSR-sensitive logic).

## Styling System & Assets
- Tailwind 4 is configured via `@import "tailwindcss";` in `app/globals.css`. Palette and typography tokens remain in `tailwind.config.ts`, while custom background and text-shadow utilities now live in CSS: `@theme` defines tokens and `@utility` maps the legacy class names (`bg-dust-pattern`, `bg-red-white-gradient`, `text-shadow-hero`) so the dust overlay and gradients render correctly at runtime (see `.agent/Tasks/fix-dust-overlay.md` for the original regression).
- Background art and icons live under `public/landing/`. Matching `.png` assets support Next Image usage in the hero.
- Fonts default to CSS variables `--font-saprona` / `--font-garamond`; actual licensed Saprona faces are pending. Body copy forces dark background `#1B1D21`.

## State, Data & Integrations
- No remote data fetching or Supabase client integration exists today. All pages use static props or local state.
- Supabase directory structure (`supabase/migrations`, `supabase/functions`, `supabase/types`) is present with `.gitkeep` placeholders only. `supabase/README.md` outlines the expected workflows.
- Environment variables required for future Supabase work are documented in `.env.example`.

## Configuration & Tooling
- `tsconfig.json` defines path aliases for `components/*`, `lib/*`, and `stores/*`.
- `next.config.ts` permits SVG images, forces attachment disposition, and enforces a restrictive image CSP.
- ESLint uses the flat config (`eslint.config.mjs`) with `FlatCompat` to ingest Next presets and disables `react/jsx-props-no-spreading`.
- PostCSS pipeline delegates to `@tailwindcss/postcss`.

## Testing
- Vitest (`vitest.config.ts`) targets `tests/**/*.{test,spec}.{ts,tsx}` with a JSDOM environment. The lone test (`tests/unit/utils.test.ts`) verifies `cn` behaviour. A Vitest 3 runner issue is documented in `.agent/Tasks/dependency-version-update.md` – suite exits early under certain flags.
- Playwright configuration (`tests/e2e/playwright.config.ts`) is prepared for Chromium smoke suites but has no actual tests yet.
- Linting via `pnpm lint` is the primary CI guardrail today.

## Database Schema Status
No SQL migrations or database tables are defined. Planned entities include `agents`, related tags, waitlist captures, and session telemetry, but they remain speculative until Supabase integration begins. Schema work should be accompanied by new SOPs once prioritised.

## Outstanding Gaps & Housekeeping
- **Visual QA**: confirm the restored dust overlay and gradients across responsive breakpoints and capture artifacts for regression tests.
- **Brand consistency**: align naming across marketing (“Merak”), console (“Heist”), and metadata to avoid user confusion.
- **Unused scaffolding**: `stores/useAgentStore.ts`, `lib/hooks/useIsClient.ts`, and empty root files (`handles`, `merges`, `vitest`) are safe to prune or wire up when functionality lands.
- **Static assets**: `app/(public)/landing/page.tsx.backup` and the stray `82cf973b-b4a0-4126-a2aa-3646a4baac48.svg:Zone.Identifier` file appear to be export artefacts; remove or document if not required.
- **Testing**: expand Vitest coverage beyond the `cn` helper and stabilise the runner before enabling on CI.

## Related Docs
- `.agent/README.md` – Entry point for all project documentation.
- `README.md` – Repository overview and onboarding steps.
- `.agent/Tasks/dependency-version-update.md` – Notes on the 2025-10-14 dependency uplift.
- `.agent/Tasks/fix-dust-overlay.md` – Investigation into Tailwind background/gradiant utilities.
- `supabase/README.md` – Expected workflow once Supabase integration begins.
