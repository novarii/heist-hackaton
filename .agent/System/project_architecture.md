# Project Architecture

## Product & Scope
- Marketing funnel introduces the “Merak” brand while the authenticated console still displays “Heist Console”, highlighting an ongoing rebrand.
- Core journey today: `/` → `redirect("/landing")` → cinematic landing hero → static onboarding checklist (`/onboarding`) → stubbed agents dashboard (`/agents`).
- Supabase now owns the source of truth for profiles, anonymous prompts, agent catalog, recommendation sessions, waitlist intent, and integration telemetry. The Next.js app has not yet wired these APIs, but migrations and RLS rules are in place.

## Tech Stack Snapshot
- **Runtime**: Next.js `15.5.4` (App Router) with React `19.2.0` and strict TypeScript `5.9.3`.
- **Styling**: Tailwind CSS `4.1.14` using the CSS-first pipeline (`@import "tailwindcss"`) plus `tailwind-merge` to dedupe classes. A legacy `tailwindcss-textshadow` dependency remains installed but utility classes are now provided manually in CSS.
- **State**: Client-only Zustand slice (`stores/useAgentStore.ts`) prepared for agent state but currently unused.
- **Utilities**: `date-fns` for relative timestamps; `clsx` + `tailwind-merge` exposed via `lib/utils.ts`; Supabase access handled through `@supabase/ssr` (App Router session client) and `@supabase/supabase-js` (service-role operations).
- **Tooling**: ESLint 9 (flat config), Vitest 3, Playwright 1.55, pnpm 10.18.3, PostCSS with `@tailwindcss/postcss`.
- **Package management**: `pnpm-lock.yaml` is the single source of dependency truth; npm/yarn lockfiles are removed during audits to avoid drift. `pnpm-workspace.yaml` pins `onlyBuiltDependencies` so heavy native packages build only when needed.

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
- **Backend helpers**
  - `lib/supabase/server.ts` – wraps `createServerClient` from `@supabase/ssr`, wiring cookie get/set as recommended in Supabase’s 2025 App Router guide so server components, route handlers, and server actions can reuse authenticated GoTrue sessions.
  - `lib/supabase/service-client.ts` – singleton `createClient` bound to the service-role key (`SUPABASE_SECRET_KEY`), guarded against browser execution and configured with non-persistent auth for privileged writes (e.g. logging).
  - `lib/integrations/n8n.ts` – `triggerN8nWebhook` helper that retries transient errors with exponential backoff, annotates attempts, and persists request/response JSON into `integration_events` via the service client.
  - `lib/cookies/prompt.ts` – Signed cookie utilities (`setPromptCookie`, `readPromptCookie`, `clearPromptCookie`) storing a prompt/session identifier using an HMAC (`PROMPT_COOKIE_SECRET`) with expiry metadata to bridge anonymous → authenticated flows.

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
- Supabase migrations now define Phase 1 of the backend:
  - `20250218120000_phase1_core.sql` enables `pgcrypto`/`vector`, creates enums (`user_role`, `company_size`, `onboarding_status`, `agent_visibility`, `waitlist_status`), registers the shared `set_updated_at` trigger, and provisions `profiles`, `anonymous_prompts`, `agents`, `agent_tags`, and `agent_tag_map`.
  - `20250218120500_phase1_extensions.sql` adds `agent_endorsements`, `comparison_sessions`, `comparison_candidates`, `waitlist_entries`, and `integration_events` with fit-score and status guards plus provider/reference indexes.
  - `20250218121500_phase1_rls.sql` enables RLS everywhere, introduces `auth_is_service_role()` for privileged checks, and codifies policies: public read access for visible agents/tags, self-scoped profile reads/updates, owner-scoped comparison reads, and service-role-only writes for prompts linkage, waitlist, and integration logs.
- `supabase/types/database.types.ts` is generated and mirrors the new schema, exposing typed helpers (`Tables`, `TablesInsert`, `Enums`, etc.) plus the `_InternalSupabase` metadata. Vector columns currently emit as `string` (Supabase CLI default); update consumer typings if you prefer a custom vector type wrapper.
- Edge Functions remain undeployed; expand `supabase/functions/` when admin tooling or webhook handlers are required.
- Application code now centralises service credentials:
  - `.env.example` enumerates `PROMPT_COOKIE_SECRET`, `N8N_WEBHOOK_URL`, and optional `N8N_WEBHOOK_AUTH_TOKEN` alongside the Supabase URL/publishable key pair and service-role secret.
  - Backend helpers expect these values at runtime; missing env variables throw explicit errors to fail fast in CI or serverless deployments.

## Database Schema (Supabase)
- **profiles** — `id uuid` FK to `auth.users`, `role user_role`, `company`, `company_size company_size`, `focus_industries text[]`, `onboarding_status onboarding_status`, timestamp trigger. RLS: self-select/update; service role handles inserts/deletes.
- **anonymous_prompts** — captures pre-auth prompts (`prompt_text`, `source`, n8n run metadata, optional `linked_profile_id`). RLS: service role for lifecycle; authenticated users can link prompts while `linked_profile_id` is null.
- **agents** — catalog with `slug` (unique), marketing copy, pricing, optional `rating` (0–5), `success_rate` (0–100), `visibility agent_visibility`, and `profile_embedding vector(1536)`. Public read for `visibility = 'public'`; service role controls writes. `agent_tags`/`agent_tag_map` provide labelled weights (1–5) for scoring.
- **agent_endorsements** — testimonial quotes keyed to agents. Public reads permitted when the parent agent is public; writes via service role.
- **comparison_sessions** — recommendation runs tied to `profiles` or `anonymous_prompts` with optional `filter_payload jsonb`. **comparison_candidates** stores per-agent fit scores (0–100) and `reasons text[]`. Owners (by `profile_id`) can view their sessions/candidates; service role mutates data.
- **waitlist_entries** — captures hire intent with optional `email_override` for anonymous flows and `status waitlist_status` defaulting to `new`. Service role only.
- **integration_events** — append-only telemetry (`provider`, `event_type`, `payload`, `status in ('success','error')`, optional `reference_id`) with supporting indexes. Service role only.
- Shared helper `auth_is_service_role()` wraps `auth.role() = 'service_role'` to simplify policy checks across migrations.

## Testing & Quality Gates
- `vitest.config.ts` targets `tests/**/*.{test,spec}.{ts,tsx}` inside a JSDOM environment with global APIs enabled. Only `tests/unit/utils.test.ts` exists, covering the `cn` helper’s merging behaviour.
- `tests/e2e/playwright.config.ts` configures a Chromium project with first-retry tracing; no Playwright specs have landed.
- Linting (`pnpm lint`) is the primary guardrail. Tailwind’s CSS-first pipeline can surface import issues similar to the regression documented in `.agent/Tasks/fix-dust-overlay.md`.

## Housekeeping & Observations
- Placeholder files (`handles/handles`, `merges/merges`, `heist-hackaton@0.0.1`, `vitest/vitest`) are zero-byte markers; confirm whether they are required or remove to reduce clutter.
- `lib/hooks/useIsClient.ts` and `stores/useAgentStore.ts` are unused; integrate or trim to avoid dead code once Supabase wiring begins.
- Landing copy still references Lorem Ipsum and placeholder links; replace with production messaging alongside Supabase integration.
- Visual QA should confirm the dust pattern and gradients across breakpoints; capture baselines for future regression testing.
- Rotate `PROMPT_COOKIE_SECRET` and n8n auth tokens periodically; both values protect user linking flows and integration audit logs. Service-role key must remain server-only—consider storing in Vercel environment secrets or Supabase Vault before production.

## Related Docs
- `.agent/README.md` – Documentation index.
- `README.md` – High-level repository overview and setup steps.
- `.agent/Tasks/dependency-version-update.md` – Notes on the 2025-10-14 dependency uplift.
- `.agent/Tasks/fix-dust-overlay.md` – Tailwind background utility investigation and fix history.
- `.agent/SOP/tailwind-custom-utility-regression.md` – Playbook for repairing Tailwind 4 utility regressions.
- `supabase/README.md` – Supabase directory workflow.
