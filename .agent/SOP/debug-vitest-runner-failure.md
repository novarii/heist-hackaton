# Vitest Runner Failure Debug SOP

## Context
- Vitest 3 runner can fail early when Vite cannot resolve imports from tests, commonly due to missing tsconfig path alias wiring.
- Our tests use Next.js-style absolute imports (`lib/utils`, `components/...`, etc.), so Vitest must mirror the alias mapping defined in `tsconfig.json`.

## Quick Diagnosis
1. Reproduce locally with verbose logging to surface the underlying error:
   ```bash
   VITEST_LOG_LEVEL=debug pnpm test -- --run
   ```
2. Inspect the first stack trace. Import resolution errors will cite the unresolved module (e.g., `Failed to resolve import "lib/utils"`).
3. If the runner crashes without clear logs, rerun with `pnpm test -- --run --reporter=verbose` or fall back to `pnpm vitest --run --inspect` for direct Vite debugging.

## Remediation Steps
1. Cross-check `tsconfig.json` `compilerOptions.paths` with `vitest.config.ts`.
2. Mirror any path aliases inside `defineConfig({ resolve: { alias: { … }}})` using `node:path` and `node:url` helpers to stay relative to the repo root.
   ```ts
   import { resolve } from "node:path";
   import { fileURLToPath } from "node:url";

   const rootDir = fileURLToPath(new URL(".", import.meta.url));

   export default defineConfig({
     resolve: {
       alias: {
         "@": rootDir,
         lib: resolve(rootDir, "lib"),
         components: resolve(rootDir, "components"),
         stores: resolve(rootDir, "stores"),
       },
     },
   });
   ```
3. If aliases are already present, ensure the path exists and matches the TypeScript configuration. A stale alias usually indicates a misspelled directory or a missing build artifact.
4. When the failure stems from a Vitest regression, try pinning to the latest patch (`pnpm up vitest`) or test against the previous minor version to confirm.

## Verification
1. Run `pnpm test -- --run` to confirm suites execute.
2. If the tests keep failing, compare expectations with the actual output logged in the debug run. Update assertions when framework behavior (e.g., Tailwind merge ordering) changes but functionality remains correct.

## Maintenance Notes
- Add new path aliases in both `tsconfig.json` and `vitest.config.ts` during feature work.
- Consider introducing `vite-tsconfig-paths` in the future to auto-sync aliases if we expand the alias surface area.
- Document any additional recurring runner issues here (e.g., jsdom upgrades, environment flags) to keep the SOP living and actionable.
