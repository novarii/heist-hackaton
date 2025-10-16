# Project Architecture

## Product & Scope
- Marketing funnel introduces the “Merak” brand while the authenticated console still displays “Heist Console”, highlighting an ongoing rebrand.
- Core journey today: `/` → `redirect("/landing")` → cinematic landing hero → static onboarding checklist (`/onboarding`) → stubbed agents dashboard (`/agents`).
- Supabase is the planned backend (auth, Postgres, Edge Functions) but no runtime integration has shipped yet; pages render purely static copy.

## Tech Stack Snapshot
- **Runtime**: Next.js `15.5.4` (App Router) with React `19.2.0` and strict TypeScript `5.9.3`.
- **Styling**: Tailwind CSS `4.1.14` using the CSS-first pipeline (`@import "tailwindcss"`) plus `tailwind-merge` to dedupe classes. A legacy `tailwindcss-textshadow` dependency remains installed but utility classes are now provided manually in CSS.
- **State**: Client-only Zustand slice (`stores/useAgentStore.ts`) prepared for agent state but currently unused.
- **Utilities**: `date-fns` for relative timestamps in agent cards; `clsx` + `tailwind-merge` exposed through `lib/utils.ts`.
- **Tooling**: ESLint 9 (flat config), Vitest 3, Playwright 1.55, pnpm 8.15.6, PostCSS with `@tailwindcss/postcss`.

## Application Structure
### Layouts & Routing
- `app/layout.tsx` registers Google Space Grotesk (`--font-saprona`) and Cormorant Garamond (`--font-garamond`), applies `globals.css`, and sets site metadata.
- Route groups segment surfaces:
  - `app/(public)` – marketing shell (`layout.tsx`) that simply wraps children.
  - `app/(auth)` – onboarding layout with dark background.
  - `app/(protected)` – authenticated console chrome with header and content container.
- `app/page.tsx` redirects to `/landing` ensuring the root path stays slim.

### Key Surfaces
- **Landing (`app/(public)/landing/page.tsx`)**
  - `LandingHeader.tsx` (client) renders fixed navigation linking to placeholder routes.
  - `HeroSection.tsx` paints gradient + dust backgrounds, overlays ellipse imagery, and mounts `PromptInput` with `showAgentSelector` toggled.
  - `BottomSection.tsx` creates a glassmorphism container ready for agent cards; content placeholder is commented for future population.
  - A legacy backup snapshot (`page.tsx.backup`) includes an older marketing layout and should be pruned once no longer needed.
- **Onboarding (`app/(auth)/onboarding/page.tsx`)** – static Supabase setup checklist with CTAs to `/agents` and `/landing`.
- **Agents dashboard (`app/(protected)/agents/page.tsx`)** – maps a local constant to `AgentCard` components, simulating agent health data.

### Shared Modules
- `components/PromptInput.tsx` – client component holding prompt text, optional agent selector state, and submission handler (`onSubmit`) for future integrations. Decorative chain images come from `public/landing`.
- `components/AgentCard.tsx` – supports `marketing`/`dashboard` variants with variant-specific Tailwind tone. Uses `formatDistanceToNow` when `lastRun` is supplied.
- `lib/utils.ts` – `cn` helper combining `clsx` and `tailwind-merge`.
- `lib/hooks/useIsClient.ts` – hydration guard returning `true` after mount; currently unused.
- `stores/useAgentStore.ts` – Zustand store with `agents`, `addAgent`, and `updateStatus` helpers ready for Supabase-backed data.

## Styling & Assets
- `app/globals.css` defines theme tokens via `@theme` (dust pattern, gradient, hero text-shadow) and exposes matching classes with `@utility`. Body styling locks the dark palette (`#1B1D21`) and sets font variables.
- `tailwind.config.ts` scopes content to `app/`, `components/`, and `lib/`; extends palette with `brand.orange.900` and several neutral tones; registers `saprona` and `garamond` font families and a custom `backdropBlur`.
- Marketing imagery resides under `public/landing/` (`dust.png`, chain PNGs, ellipse PNGs, arrow SVG). Next Image is configured to allow SVG sources via `next.config.ts`.

## Configuration & Tooling
- `next.config.ts` enables `reactStrictMode`, allows SVGs, defaults image downloads to attachment disposition, and enforces a restrictive image CSP (`script-src 'none'; sandbox`).
- `tsconfig.json` adds aliases for `components/*`, `lib/*`, `stores/*`, and a project-root `@/*`.
- `eslint.config.mjs` uses `FlatCompat` to pull `next/core-web-vitals` and `next/typescript`, disables `react/jsx-props-no-spreading`, and ignores build artifacts.
- `postcss.config.js` delegates processing to `@tailwindcss/postcss`.

## Data & Supabase Readiness
- `.env.example` expects `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`; legacy anon/service-role keys remain commented for migration reference.
- Supabase scaffolding (`supabase/migrations`, `supabase/functions`, `supabase/types`) is empty aside from directory placeholders, signalling no schema or edge functions yet.
- `supabase/README.md` covers the intended workflow for migrations and type generation. Regenerate types with `pnpm supabase gen types` once schemas exist.
- Database schema is currently undefined. Planned entities include agents, tags, waitlist captures, and telemetry tables; add migrations + documentation when designs are finalised.

## Testing & Quality Gates
- `vitest.config.ts` targets `tests/**/*.{test,spec}.{ts,tsx}` inside a JSDOM environment with global APIs enabled. Only `tests/unit/utils.test.ts` exists, covering the `cn` helper’s merging behaviour.
- `tests/e2e/playwright.config.ts` configures a Chromium project with first-retry tracing; no Playwright specs have landed.
- Linting (`pnpm lint`) is the primary guardrail. Tailwind’s CSS-first pipeline can surface import issues similar to the regression documented in `.agent/Tasks/fix-dust-overlay.md`.

## Housekeeping & Observations
- Placeholder files (`handles/handles`, `merges/merges`, `heist-hackaton@0.0.1`, `vitest/vitest`) are zero-byte markers; confirm whether they are required or remove to reduce clutter.
- `lib/hooks/useIsClient.ts` and `stores/useAgentStore.ts` are unused; integrate or trim to avoid dead code once Supabase wiring begins.
- Landing copy still references Lorem Ipsum and placeholder links; replace with production messaging alongside Supabase integration.
- Visual QA should confirm the dust pattern and gradients across breakpoints; capture baselines for future regression testing.

## Related Docs
- `.agent/README.md` – Documentation index.
- `README.md` – High-level repository overview and setup steps.
- `.agent/Tasks/dependency-version-update.md` – Notes on the 2025-10-14 dependency uplift.
- `.agent/Tasks/fix-dust-overlay.md` – Tailwind background utility investigation and fix history.
- `.agent/SOP/tailwind-custom-utility-regression.md` – Playbook for repairing Tailwind 4 utility regressions.
- `supabase/README.md` – Supabase directory workflow.
