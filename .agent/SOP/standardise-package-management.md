# SOP: Standardise Package Management

## Objective
Keep dependency resolution consistent by making pnpm the single package manager of record and eliminating conflicting lockfiles or install workflows.

## When to Run
- Auditing the repo for stray `package-lock.json`/`yarn.lock` files.
- After dependency upgrades performed with npm or yarn.
- Before handing off the project to new contributors or CI pipelines.

## Prerequisites
- pnpm `>=10.18.3` installed locally (`corepack use pnpm@10.18.3` or `npm install -g pnpm@10.18.3`).
- Ability to delete and regenerate lockfiles.

## Procedure
1. **Clean conflicting artefacts**
   ```bash
   rm -rf node_modules package-lock.json yarn.lock
   ```
2. **Ensure `.gitignore` permits the pnpm lockfile**
   ```bash
   rg "pnpm-lock.yaml" .gitignore || echo "pnpm-lock.yaml is already tracked"
   ```
   Remove any ignore entries for `pnpm-lock.yaml`.
3. **Regenerate the canonical lockfile without reinstalling modules**
   ```bash
   pnpm install --lockfile-only
   ```
   This preserves `node_modules/` cleanliness during audits.
4. **Verify metadata**
   - `package.json` contains `"packageManager": "pnpm@10.18.3"`.
   - `pnpm-lock.yaml` is present and staged.
5. **Optional: refresh local dependencies**
   ```bash
   pnpm install
   ```
   Run once network access is available to ensure reproducible installs.
6. **Update documentation**
   - Note the change in `.agent/System/project_architecture.md` if tooling versions shift.
   - Capture any unusual findings (e.g., extraneous npm-only packages) in the relevant Task postmortem.

## Validation Checklist
- [ ] `pnpm-lock.yaml` tracked in git; no `package-lock.json` or `yarn.lock`.
- [ ] `pnpm install --frozen-lockfile` succeeds locally or in CI.
- [ ] `pnpm list --depth=0` matches expected dependency versions.
- [ ] Project scripts (`package.json > scripts`) use `pnpm` in shared documentation.

## Troubleshooting
- **pnpm prompts to wipe `node_modules`** – Pass `--lockfile-only` as above, or agree to reinstall when you want a fresh dependency tree.
- **CI still uses npm** – Update workflow files to call `corepack pnpm install --frozen-lockfile`.
- **Extraneous npm artefacts keep reappearing** – Ensure editors and scaffolding tools (e.g., `npx create-next-app`) run outside the repo, or uninstall their post-run hooks.

## Related Docs
- `System/project_architecture.md` – Tooling overview including package manager expectations.
- `Tasks/codebase-cleanup-audit.md` – Source audit that flagged package manager drift.
- `System/npm-list.md` – Historical npm dependency snapshot used for version comparison.
