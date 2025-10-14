# Heist Hackathon Workspace

Next.js 15.5 (App Router) workspace scaffold aligned with the stack in `AGENTS.md`.

## Stack Highlights
- Next.js 15.5 + TypeScript + React 18.3 (App Router, RSC-first)
- Tailwind CSS 3.x with shadcn/ui primitives, Radix UI, CVA, and shared `cn` helper
- Supabase helpers for client/server usage, Genql GraphQL client scaffold, Next Safe Action setup
- Vercel AI SDK placeholder provider for LLM orchestration
- Vitest unit tests + Testing Library, Playwright smoke test harness

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables and fill them in:
   ```bash
   cp .env.example .env.local
   ```
3. Run generators (optional, keeps GraphQL types current):
   ```bash
   npm run genql:generate
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to view the landing experience. The hero page demonstrates Tailwind styling, a shadcn button, and a `react-hook-form` + next-safe-action flow wired to the sample newsletter action.

## Scripts
- `npm run dev` – start Next.js with Turbopack
- `npm run build` / `npm run start` – production build & serve
- `npm run lint` – ESLint with Tailwind & import ordering rules
- `npm run test` / `test:watch` / `test:coverage` – Vitest unit tests
- `npm run test:e2e` – Playwright smoke tests (`webServer` boots the dev server)
- `npm run genql:generate` – regenerate Genql client from `src/lib/graphql/schema.graphql`

## Project Structure
```
app/
├── components.json         # shadcn/ui configuration
├── next.config.ts
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── vitest.config.ts
├── src/
│   ├── app/                # App Router routes
│   ├── components/         # UI + form primitives
│   ├── lib/                # supabase, graphql, ai, validation helpers
│   ├── test/               # shared Vitest setup
│   └── lib/genql/          # generated GraphQL client (git-tracked)
└── .env.example            # required runtime secrets
```

## Next Steps
- Provision Supabase, generate typed database definitions, and replace the placeholder `Database` type
- Flesh out agent domain schema + Genql operations under `src/lib/graphql`
- Add Playwright auth fixtures + Supabase seeding for end-to-end flows
