# Dust Overlay Rendering Issue

## Summary
- Dust texture background (`bg-dust-pattern`) expected in `HeroSection` is not rendered in the browser.
- Tailwind 4 computed styles show `background-image: none`, so the utility class never resolves to `url('/landing/dust.png')`.
- Other custom background utilities like `bg-red-white-gradient` and `text-shadow-hero` also evaluate to `none`, hinting at a broader theming configuration problem rather than a missing asset (PNG exists under `public/landing/dust.png`).

## Current Findings
- ✅ Reproduced in Playwright against the local dev server (`http://127.0.0.1:3000/landing`). Screenshot stored at `/tmp/playwright-mcp-output/.../landing-page.png`.
- ✅ DOM contains the overlay `<div>` elements with `bg-dust-pattern`, so JSX renders correctly.
- ❌ Computed styles confirm `background-image: none` and `text-shadow: none` despite Tailwind classes being present.
- ✅ Asset resolves if requested directly (`public/landing/dust.png`).
- ✅ Console warning surfaced for `favicon.ico` only; no network 404s for `dust.png`.
- 🔍 Tailwind 4.1 project uses the new `@import "tailwindcss";` pipeline, but our overrides live in `tailwind.config.ts` under `theme.extend.backgroundImage`. The Tailwind 4 docs recommend defining custom background images via `@theme { --background-image-* }` in CSS or by using custom property utilities (`bg-(image:--foo)`), which suggests our config extension might be ignored.
- 🔍 `tailwindcss-textshadow` plugin utilities (e.g., `text-shadow-hero`) suffer the same fate, implying plugin incompatibility or missing `@layer` definitions for Tailwind 4.

## Proposed Approach
1. **Audit Tailwind Setup**
   - Confirm Tailwind 4 configuration expectations (read `tailwindcss.com/docs/background-image#customizing` and Tailwind v4 migration notes).
   - Verify whether `theme.extend.backgroundImage` still works or needs migrating to CSS `@theme` declarations.
2. **Define Tokens via `@theme`**
   - Move background and gradient tokens into `app/globals.css` using `@theme` (e.g., `--background-image-dust-pattern: url('/landing/dust.png');`).
   - Expose gradients/text shadows similarly (`--background-image-red-white-gradient`, `--text-shadow-hero`), ensuring naming matches Tailwind’s namespace conventions (`--background-image-dust-pattern` → class `bg-(image:--background-image-dust-pattern)` or alias via `@utility`).
3. **Restore Utility Aliases**
   - If existing class names must stay (`bg-dust-pattern`, `text-shadow-hero`), re-create them under `@layer utilities` using `@apply bg-(image:--background-image-dust)`.
   - Alternatively, update components to use new Tailwind 4 syntax (`bg-[url(/landing/dust.png)]`, `bg-(image:--dust)`, `text-shadow-[...]`) and remove dead config entries.
4. **Validate Plugin Compatibility**
   - Check whether `tailwindcss-textshadow` supports Tailwind 4; if not, replicate needed shadows via `@layer utilities`.
   - Run `pnpm lint` to catch any class name typos after refactor.
5. **Visual Verification**
   - Re-run Playwright or manual browser check to confirm dust overlay appears and gradients/text shadows apply.
   - Capture before/after screenshots to include in PR for visual diff.

## Open Questions
- Do we need to preserve legacy utility names for downstream components, or is updating class usage acceptable?
- Should we consider generating a reusable `DustOverlay` component if multiple sections need the effect?
- Are there other Tailwind utilities relying on `tailwind.config.ts` overrides that now fail silently (worth auditing)?

## Validation Plan
- `pnpm lint` (ensures Tailwind class detection, catches CSS syntax errors).
- `pnpm build` (verifies Tailwind/JIT compilation passes in production mode).
- Playwright smoke (`tests/e2e` if available) or manual screenshot diff to confirm visual fix.

## References
- Tailwind CSS docs: Background image customization (`https://tailwindcss.com/docs/background-image#customizing`).
- Tailwind CSS docs: Theme extensions via `@theme` (`https://tailwindcss.com/docs/theme#customizing-your-theme`).
