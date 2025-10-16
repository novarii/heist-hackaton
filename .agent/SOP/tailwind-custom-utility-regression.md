# Tailwind 4 Custom Utility Regression SOP

## Context
- Tailwind CSS 4 replaces `theme.extend` with CSS-first primitives. Extending utilities such as `backgroundImage` or `textShadow` via `tailwind.config.ts` can silently fail, leaving classes like `bg-dust-pattern` or `text-shadow-hero` unresolved at runtime.
- This SOP documents how to diagnose and remedy missing custom tokens—e.g., the dust overlay regression on the landing hero—by aligning with the Tailwind 4 theming model.
- Always cross-check the official docs while working: [Tailwind Background Image](https://tailwindcss.com/docs/background-image#customizing) and [Tailwind Theme](https://tailwindcss.com/docs/theme#customizing-your-theme).

## Quick Detection
1. **Reproduce visually**: Run `pnpm dev`, open the affected page, and confirm the expected effect (gradient, texture, text shadow) is absent.
2. **Inspect the element**: Use browser devtools to review computed styles. If `background-image` or `text-shadow` resolves to `none`, proceed.
3. **Check generated CSS**: Search `.next/static/css/*.css` or the devtools Styles pane for the utility selector. Missing CSS rules indicate Tailwind skipped the class.
4. **Lint + build sanity**: Run `pnpm lint` or `pnpm build`. Tailwind config misalignments usually do not fail builds, so a successful run does not guarantee correctness—visual inspection is mandatory.

## Remediation Steps
1. **Inventory the failing utilities**:
   - Copy the existing class names (e.g., `bg-dust-pattern`, `bg-red-white-gradient`, `text-shadow-hero`).
   - Locate their definitions in `tailwind.config.ts`. If they live under `theme.extend`, plan to migrate them.
2. **Move tokens into CSS using `@theme`**:
   - Open `app/globals.css` (or the root Tailwind entry).
   - Add a `@theme` block defining semantic custom properties:
     ```css
     @theme {
       --background-image-dust-pattern: url("/landing/dust.png");
       --background-image-red-white-gradient: linear-gradient(to right, #ff7676, #ffffff);
       --text-shadow-hero: 7px 7px 5px rgba(0, 0, 0, 0.25);
     }
     ```
   - Prefer descriptive names (`--background-image-*`, `--text-shadow-*`) so the generated utilities match Tailwind’s naming scheme.
3. **Restore legacy class names with `@utility`**:
   - Still in `app/globals.css`, alias each token to the class expected by JSX:
     ```css
     @utility bg-dust-pattern {
       background-image: var(--background-image-dust-pattern);
     }
     @utility text-shadow-hero {
       text-shadow: var(--text-shadow-hero);
     }
     ```
   - Use `background-image` instead of shorthand `background` to avoid overriding other utilities.
4. **Update `tailwind.config.ts`**:
   - Remove obsolete `theme.extend.backgroundImage` / `textShadow` entries, along with plugins that duplicate the new utilities (e.g., `tailwindcss-textshadow`).
   - Leave palette, typography, or other supported `theme.extend` keys intact.
5. **Audit plugins and imports**:
   - Confirm custom plugins are Tailwind 4-compatible. If a plugin solely provided a utility now handled via `@utility`, uninstall or disable it to reduce drift.
6. **Propagate across modules**:
   - Search the codebase for any other custom utilities defined in `tailwind.config.ts` (e.g., `rg "bg-" tailwind.config.ts`). Migrate them to the CSS pipeline to prevent future regressions.

## Verification
1. Run `pnpm lint` to ensure no syntax errors in CSS or config.
2. Launch `pnpm dev` and re-check the affected view. Verify the computed style now points to the expected value.
3. If the change impacts multiple pages, smoke test each route group (`/landing`, `/onboarding`, `/agents`) to confirm no unintended overrides.
4. Capture before/after screenshots for regression tracking and, if relevant, update Playwright baselines.

## Related Docs
- `.agent/System/project_architecture.md` – Styling system overview and current Tailwind token layout.
- `.agent/Tasks/fix-dust-overlay.md` – Original investigation with debugging notes and context around the dust overlay failure.
