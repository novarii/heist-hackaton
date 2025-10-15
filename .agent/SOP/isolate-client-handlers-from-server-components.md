# SOP: Isolate Client Event Handlers from Server Components

## Context
- Error surfaced on `/landing`: `Event handlers cannot be passed to Client Component props. <PromptInput ... onSubmit={function}>`.
- Server Components (default for `app/` routes) can only pass serializable props to Client Components [[Next.js docs](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns#passing-props-from-server-to-client-components-serialization)].
- Functions are not serializable unless defined in a Client Component subtree or marked as a Server Action [[React 'use client'](https://react.dev/reference/rsc/use-client)].

## Diagnosis Checklist
1. Reproduce the runtime error by visiting the affected route (`pnpm dev` → `http://localhost:3000/landing`).
2. Inspect the Server Component (`app/(public)/landing/page.tsx`) for props that pass event handlers (`onSubmit`, `onClick`, etc.) to Client Components.
3. Confirm the target component is a Client Component (look for `"use client"` or hooks usage).

## Remediation Options
### Option A – Move Interaction into a Client Boundary (preferred)
1. Create a client wrapper colocated with the route, e.g. `app/(public)/landing/_components/PromptHero.tsx`:
   ```tsx
   "use client";

   import { useCallback } from "react";
   import PromptInput from "components/PromptInput";

   export default function PromptHero() {
     const handleSubmit = useCallback(async (prompt: string) => {
       console.log("Prompt submitted:", prompt);
     }, []);

     return (
       <PromptInput
         label="Ask the builder"
         placeholder="What can I automate with Heist?"
         submitLabel="Generate workflow"
         onSubmit={handleSubmit}
       />
     );
   }
   ```
2. Replace the inline usage in the Server Component:
   ```tsx
   import PromptHero from "./_components/PromptHero";

   // ...
   <PromptHero />
   ```
3. Keep all non-interactive layout in the Server Component to preserve streaming, caching, and data-fetch benefits.

### Option B – Convert the Entire Page to a Client Component
- Add `"use client";` to the top of `page.tsx`.
- **Trade-off:** larger client bundle, forfeits server-only optimizations. Use only if the page is inherently interactive everywhere.

### Option C – Replace handler with a Server Action
- Refactor the child component to accept a `<form action={submitPrompt}>` style handler marked with `'use server'` if the logic must run on the server.
- Update the client component to call `formAction` instead of `onSubmit`.

## Verification
1. Run `pnpm dev` and reload the route.
2. Confirm the error disappears and interactions work.
3. Check browser DevTools Console for expected behavior (e.g. log output).
4. Run automated tests (`pnpm test -- --run`) to ensure no regressions.

## Prevention
- Keep route-level components as Server Components; encapsulate interactivity within child components marked `"use client"`.
- During code review, flag any Server Component passing inline functions to Client Component props.
- Prefer wrapper components or Server Actions rather than adding `"use client"` at the page level by default.

## Related Docs
- `System/project_architecture.md` – Notes on component placement and testing stack.
- `.agent/SOP/debug-vitest-runner-failure.md` – Build/test troubleshooting if vitest fails after refactor.
