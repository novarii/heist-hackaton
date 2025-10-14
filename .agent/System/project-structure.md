# Project Structure Audit

## Summary
- The Next.js App Router entry lives in `app/src/app`, with `page.tsx` rendering the landing page UI and wiring the waitlist form. Supporting assets like the root layout, global styles, and server actions also sit alongside it. 
- Shared UI sits in `app/src/components`, split between form implementations and base Shadcn-style primitives.
- Cross-cutting logic collects under `app/src/lib`, but several submodules (AI provider, GraphQL client scaffolding, Supabase helpers, GenQL artifacts) are currently unused by the UI. They are ready-made scaffolding rather than active dependencies.
- Tests and configuration stay co-located: Vitest setup lives in `app/src/test`, while Tailwind, ESLint, Playwright, and Next.js configs are rooted in `app/`.

## Directory Reference

| Path | Purpose | Status |
| --- | --- | --- |
| `app/` | Node workspace with Next.js, testing, and lint tooling. Contains configs (`next.config.ts`, `tailwind.config.ts`, etc.) plus the application source under `src/`. | Active |
| `app/src/app` | Next.js App Router tree. Includes `page.tsx` landing screen, `layout.tsx`, CSS, and `actions/newsletter.ts` server action. | Active |
| `app/src/components/forms` | Client form components; currently only `newsletter-form.tsx` which calls the safe action. | Active |
| `app/src/components/ui` | Shadcn base primitives (`button`, `badge`) consumed by forms/pages. | Active |
| `app/src/lib/actions` | Wrapper around `next-safe-action` including shared `ActionError`. Used by the newsletter server action. | Active |
| `app/src/lib/validation` | Zod schemas for forms; newsletter schema powers both the form and server action validation. | Active |
| `app/src/lib/utils.ts` | Tailwind-aware `cn` helper plus a Vitest spec. | Active |
| `app/src/lib/ai` | OpenAI provider factory (unused today). Keep if future AI flows are expected; otherwise remove to reduce dead code. | Placeholder |
| `app/src/lib/supabase` | Supabase client/server helpers and placeholder database types. Not yet referenced by the UI. Retain if Supabase integration is imminent; otherwise fold into implementation tickets. | Placeholder |
| `app/src/lib/graphql` | Supabase GraphQL client factories wrapping `genql`. Unused until GraphQL features ship. | Placeholder |
| `app/src/lib/genql` | Generated artifacts (`schema.ts`, runtime) backing the GraphQL client. Only needed when GraphQL queries are added. | Placeholder |
| `app/src/test` | Vitest setup file configuring the test environment. | Active |

## Recommendations
1. **Document scaffolding expectations** – If AI, Supabase, or GraphQL integrations are part of near-term roadmap, keep their helpers but label them as scaffolding in tasks/PRDs. Otherwise, consider moving them into feature branches or pruning until needed.
2. **Track unused directories** – Create follow-up issues to either exercise or delete `lib/ai`, `lib/supabase`, `lib/graphql`, and `lib/genql`. Their presence can confuse contributors because nothing imports them yet.
3. **Surface structure to newcomers** – Link this audit from `.agent/README.md` so future updates keep docs aligned with the actual tree.
