# Dependency Version Audit (2025-10-14)

We inventoried first-party dependencies before installing anything, with a focus on identifying deprecated or outdated versions that could block future work. No packages were installed or upgraded as part of this audit.

## Summary

| Package | Current | Latest Stable | Update Type | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| `next` | 14.2.3 | 15.5.4 | Major | Aligns with React 19 and Turbopack defaults; `next lint` is deprecated in 15.5 so CLI scripts should move to `eslint`. | [Next docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/eslint) |
| `react` | 18.3.1 | 19.2 | Major | Required by Next 15; introduces Actions API and compiler-ready features. | [React versions](https://react.dev/versions) |
| `react-dom` | 18.3.1 | 19.2 | Major | Upgrade in lock-step with `react`. | [React versions](https://react.dev/versions) |
| `tailwindcss` | 3.4.3 | 4.1.14 | Major | Tailwind 4 reorganises config (CSS-first) and improves build performance; audit custom config prior to bump. | [NPM](https://www.npmjs.com/package/tailwindcss) |
| `tailwind-merge` | 2.2.1 | 3.3.1 | Major | v3 targets Tailwind 4 layers; update after Tailwind upgrade. | [NPM](https://www.npmjs.com/package/tailwind-merge) |
| `zustand` | 4.5.2 | 5.0.8 | Major | New API retains backwards compatibility but drops legacy shallow export bug. | [NPM](https://www.npmjs.com/package/zustand) |
| `clsx` | 2.1.0 | 2.1.1 | Patch | Adds bigint support in type defs (matching React 19 nodes). | [GitHub release](https://github.com/lukeed/clsx/releases/tag/v2.1.1) |
| `typescript` | 5.4.5 | 5.9.3 | Major | 5.9 enables `import defer` and refreshed `tsc --init`; ensure Node ≥18.18. | [TypeScript release](https://github.com/microsoft/TypeScript/releases/tag/v5.9.3) |
| `eslint` | 8.57.0 | 9.36.0 | Major | ESLint 9 ships new config system tweaks; verify plugin compatibility. | [NPM](https://www.npmjs.com/package/eslint) |
| `eslint-config-next` | 14.2.3 | 15.5.3 | Major | Must match Next runtime to avoid rule drift. | [NPM](https://www.npmjs.com/package/eslint-config-next?activeTab=versions) |
| `autoprefixer` | 10.4.17 | 10.4.21 | Patch | Picks up latest browser compatibility data. | [NPM](https://www.npmjs.com/package/autoprefixer) |
| `postcss` | 8.4.35 | 8.5.6 | Minor | Required by Tailwind 4 scaffolding. | [NPM](https://www.npmjs.com/package/postcss) |
| `@types/node` | 20.12.7 | 24.5.2 | Major | Track current Node LTS signatures; ensure runtime upgrade plan. | [Snyk](https://security.snyk.io/package/npm/%40types%2Fnode) |
| `@types/react` | 18.2.66 | 19.1.13 | Major | Matches React 19 API surface (Activity, Actions). | [NPM](https://www.npmjs.com/package/@types/react) |
| `@types/react-dom` | 18.2.22 | 19.1.9 | Major | Align with React DOM 19 features. | [NPM](https://www.npmjs.com/package/@types/react-dom) |
| `@playwright/test` | 1.43.1 | 1.55.1 | Major | Newer releases add Chromium 140 and codegen assertions. | [GitHub release](https://github.com/microsoft/playwright/releases/tag/v1.55.1) |
| `vitest` | 1.4.0 | 3.0.0 | Major | Vitest 3 introduces improved browser runner and monorepo support. | [Vitest 3 announcement](https://vitest.dev/blog/vitest-3) |

## Additional Notes

- Major upgrades (`next`, `react`, `tailwindcss`, `typescript`, `eslint`, etc.) will require coordinated code changes and CI validation. Capture each upgrade path as its own task with regression plans.
- `tailwindcss` 4+ introduces a CSS-first configuration model; confirm how this interacts with current `tailwind.config.ts` before cutting over.
- `eslint` 9 drops the legacy flat config fallback; ensure our rule presets (including custom ones) migrate cleanly, or pin temporarily during the Next 15 move.
- `vitest` 3 requires Vite 6 peer compatibility. Our current scaffold lacks a Vitest setup beyond a single unit test; plan the Vite tooling upgrade at the same time.
- No action needed for `date-fns` (3.6.0 remains the latest stable) or other dependencies not listed above.

## Related Docs

- `.agent/System/project_architecture.md`
- `README.md`
