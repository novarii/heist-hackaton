-- Phase 1 – Foundation (supporting relationships & telemetry)
-- Adds tables for endorsements, comparison sessions, waitlist tracking, and integration event logging.

-- Agent endorsements capture social proof for marketing and detail pages.
create table public.agent_endorsements (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  author text,
  quote text not null,
  happened_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

-- Comparison sessions group a recommendation run for later analytics.
create table public.comparison_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  anonymous_prompt_id uuid references public.anonymous_prompts (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  filter_payload jsonb
);

create table public.comparison_candidates (
  session_id uuid not null references public.comparison_sessions (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  fit_score numeric,
  reasons text[],
  primary key (session_id, agent_id),
  constraint fit_score_range check (fit_score is null or (fit_score >= 0 and fit_score <= 100))
);

-- Waitlist entries record downstream intent to hire.
create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  agent_id uuid references public.agents (id) on delete set null,
  comparison_session_id uuid references public.comparison_sessions (id) on delete set null,
  email_override text,
  message text,
  status waitlist_status not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

-- Integration events persist webhook interactions for observability.
create table public.integration_events (
  id bigserial primary key,
  created_at timestamptz not null default timezone('utc', now()),
  provider text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'success' check (status in ('success', 'error')),
  reference_id uuid
);

create index integration_events_provider_idx on public.integration_events (provider);
create index integration_events_reference_idx on public.integration_events (reference_id);
