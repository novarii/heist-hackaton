# Codebase Cleanup Audit – Oct 2025

## Context
- Requested deep audit of redundancies, legacy artefacts, misconfigurations, and over-engineered surfaces.
- No product work scheduled; focus is on hardening the scaffold before wiring Supabase and agent flows.

## Key Findings
1. **Brand inconsistency between public and protected shells** – Landing nav promotes “Merak” while the authenticated chrome still says “Heist Console”, mirroring the risk called out in the architecture doc (`app/(public)/landing/_components/LandingHeader.tsx:13`, `app/(protected)/layout.tsx:12`, `.agent/System/project_architecture.md:4`). The mismatch will confuse users once auth is live.
2. **Legacy landing backup retained in repo** – `app/(public)/landing/page.tsx.backup:1` duplicates the landing page with stale imports (`PromptHero`) that no longer exist. Keeping both versions invites regressions during future edits.
3. **Dead code that is never imported** – The hydration guard (`lib/hooks/useIsClient.ts:5`) and Zustand store (`stores/useAgentStore.ts:16`) are unused stubs; the store also diverges from the documented Supabase-first plan (`.agent/System/project_architecture.md:11`). These should either be wired into real features or removed until needed.
4. **Tailwind plugin dependency left over from pre-Tailwind-4 setup** – `tailwindcss-textshadow` remains in `package.json:22` even though custom utilities now live in CSS (`.agent/System/project_architecture.md:10`), inflating install surface and keeping an outdated plugin alive.
5. **Package manager alignment issues** – The repo declares pnpm (`package.json:43`) but keeps `package-lock.json:1` while simultaneously git-ignoring `pnpm-lock.yaml` (`.gitignore:5`). This breaks deterministic installs and violates our SOP.
6. **Stray zero-byte artefacts in project root** – Bare files `handles`, `merges`, `vitest`, and `heist-hackaton@0.0.1` clutter the workspace and may confuse tooling when globbing.
7. **Duplicated contributor playbooks** – `AGENTS.md:1` and `CLAUDE.md:1` hold near-identical guidance, with the latter containing a truncated “Retry” footer. Docs should be DRY with `.agent/README.md` as the single entry point.
8. **Aggressive Next image configuration** – `next.config.ts:6-8` enables `dangerouslyAllowSVG` and forces `contentDispositionType: 'attachment'`. The former widens XSS risk if we ever serve remote SVGs, while the latter will prompt browsers to download responsive images instead of rendering them.

## Cleanup Plan
### 1. Resolve brand drift (Priority: High)
- Decide on canonical product name (“Merak” vs “Heist”) and update all UI shells, metadata, and docs to match.
- Review `.agent/System` and `README.md` for aligned terminology once UI strings change.

### 2. Prune legacy marketing artefacts (Priority: High)
- Remove `app/(public)/landing/page.tsx.backup` and confirm no CI/tests reference it.
- Ensure design tokens referenced by the current hero exist; delete unused assets once verified.

### 3. Retire or integrate dormant modules (Priority: Medium)
- Re-evaluate need for `useIsClient` and Zust­and store; either hook them into upcoming features or delete + update docs to avoid drift.
- If keeping, add TODO owners and create Vitest coverage that exercises their behaviour.

### 4. Simplify Tailwind setup (Priority: Medium)
- Drop `tailwindcss-textshadow` from dependencies and lockfiles, then run `pnpm lint` to verify no missing utilities.
- Document the custom utility approach in `.agent/SOP/tailwind-custom-utility-regression.md`.

### 5. Standardise package management (Priority: High) [SOLVED]
- Delete `package-lock.json`, stop ignoring `pnpm-lock.yaml`, regenerate the pnpm lockfile, and commit it per SOP.
- Audit CI scripts to ensure they call `pnpm install` and not npm/yarn.

### 6. Tidy root directory noise (Priority: Low)
- Remove zero-byte artefacts (`handles`, `merges`, `vitest`, `heist-hackaton@0.0.1`) and double-check `.gitignore` prevents them from reappearing.
- Add a housekeeping note in `.agent/System/project_architecture.md` once cleared.

### 7. Consolidate contributor docs (Priority: Low)
- Pick a single contributor guide (`AGENTS.md` or `CLAUDE.md`), delete the duplicate, and link back to `.agent/README.md`.
- Fix spelling issues (“impotant”) during the consolidation pass.

### 8. Harden image delivery defaults (Priority: Medium)
- Set `contentDispositionType` back to `'inline'` (default) unless there’s a documented requirement.
- Remove `dangerouslyAllowSVG` and, if SVGs are needed, sanitise them at build time before reintroducing the flag.
- After changes, smoke-test landing hero assets to confirm they render correctly.

## Validation Checklist
- `pnpm install`, `pnpm lint`, and `pnpm build` succeed on a clean workspace.
- Playwright config (`tests/e2e/playwright.config.ts`) still launches with updated asset handling.
- Docs updated to reflect any removals (especially Supabase onboarding steps if store/hooks change).

