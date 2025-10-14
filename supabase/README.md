# Supabase Workspace

This directory hosts database migrations, generated types, and Edge Functions used by the Heist platform.

- `migrations/` stores SQL migration files applied via `supabase db push`.
- `functions/` contains Edge Functions deployed through the Supabase CLI.
- `types/` holds the generated TypeScript definitions created with `pnpm supabase gen types`.

Reference `.agent/SOP` entries for workflows on creating migrations or updating Supabase types.
