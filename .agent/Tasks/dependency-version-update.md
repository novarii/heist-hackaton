# Dependency Version Update – 2025-10-14

## Summary
- Upgraded core stack to `next@15.5.4`, `react@19.2.0`, `react-dom@19.2.0`, `tailwindcss@4.1.14`, `tailwind-merge@3.3.1`, and `zustand@5.0.8`.
- Bumped tooling to `typescript@5.9.3`, `eslint@9.36.0` with `eslint-config-next@15.5.3`, `@types/*` v19/24, `vitest@3.0.0`, `@playwright/test@1.55.1`, and added `@eslint/compat`, `@tailwindcss/postcss`, `jsdom`.
- Replaced legacy `.eslintrc` with `eslint.config.mjs` (flat config) using `FlatCompat` + `fixupConfigRules`.
- Migrated PostCSS to `@tailwindcss/postcss` and updated `app/globals.css` to Tailwind 4 CSS-first configuration with `@config` + `@import "tailwindcss"`.
- Adjusted Tailwind utility changes (`shadow-xs`, `backdrop-blur-sm`, `focus:outline-hidden`) to retain existing UI styling.

## Validation
- `pnpm lint` (ESLint 9) – ✅ pass.
- Vitest 3 (`pnpm test -- --run --reporter verbose`) – ⚠️ runner exits early without diagnostics. Per stakeholder request, tests are skipped until the Vitest 3 issue is investigated. Suggested follow-up: re-run with `VITEST_LOG_LEVEL=debug` or upgrade to ≥3.2.x and confirm `tests/unit/utils.test.ts` scope.

## Follow-ups
1. Investigate Vitest 3.0 runner failure and confirm suite passes post-upgrade.
2. Once Vitest is stable, rerun full test suite prior to release.
