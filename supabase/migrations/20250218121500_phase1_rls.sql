-- Phase 1 – Foundation (RLS policies)
-- Enforces application access patterns for the newly introduced tables.

-- Helper: evaluate whether current role is the Supabase service key.
create or replace function auth_is_service_role() returns boolean
language sql
as $$
  select auth.role() = 'service_role';
$$;

-- Profiles
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_select_self
  on public.profiles
  for select
  using (auth.uid() = id or auth_is_service_role());

create policy profiles_update_self
  on public.profiles
  for update
  using (auth.uid() = id or auth_is_service_role())
  with check (auth.uid() = id or auth_is_service_role());

create policy profiles_insert_service_role
  on public.profiles
  for insert
  with check (auth_is_service_role());

create policy profiles_delete_service_role
  on public.profiles
  for delete
  using (auth_is_service_role());

-- Anonymous prompts
alter table public.anonymous_prompts enable row level security;
alter table public.anonymous_prompts force row level security;

create policy anonymous_prompts_service_role
  on public.anonymous_prompts
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

create policy anonymous_prompts_link_to_profile
  on public.anonymous_prompts
  for update
  using (
    linked_profile_id is null
    and auth.uid() is not null
  )
  with check (
    linked_profile_id = auth.uid()
  );

-- Agents & taxonomy
alter table public.agents enable row level security;
alter table public.agents force row level security;

create policy agents_public_select
  on public.agents
  for select
  using (
    visibility = 'public'
    or auth_is_service_role()
  );

create policy agents_write_service_role
  on public.agents
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

alter table public.agent_tags enable row level security;
alter table public.agent_tags force row level security;

create policy agent_tags_public_select
  on public.agent_tags
  for select
  using (true);

create policy agent_tags_write_service_role
  on public.agent_tags
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

alter table public.agent_tag_map enable row level security;
alter table public.agent_tag_map force row level security;

create policy agent_tag_map_public_select
  on public.agent_tag_map
  for select
  using (true);

create policy agent_tag_map_write_service_role
  on public.agent_tag_map
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

-- Endorsements
alter table public.agent_endorsements enable row level security;
alter table public.agent_endorsements force row level security;

create policy agent_endorsements_public_select
  on public.agent_endorsements
  for select
  using (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and (a.visibility = 'public' or auth_is_service_role())
    )
  );

create policy agent_endorsements_write_service_role
  on public.agent_endorsements
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

-- Comparison sessions & candidates
alter table public.comparison_sessions enable row level security;
alter table public.comparison_sessions force row level security;

create policy comparison_sessions_select_owner
  on public.comparison_sessions
  for select
  using (
    (profile_id is not null and auth.uid() = profile_id)
    or auth_is_service_role()
  );

create policy comparison_sessions_insert_service_role
  on public.comparison_sessions
  for insert
  with check (auth_is_service_role());

create policy comparison_sessions_update_delete_service_role
  on public.comparison_sessions
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

alter table public.comparison_candidates enable row level security;
alter table public.comparison_candidates force row level security;

create policy comparison_candidates_select_owner
  on public.comparison_candidates
  for select
  using (
    exists (
      select 1
      from public.comparison_sessions cs
      where cs.id = session_id
        and (
          (cs.profile_id is not null and auth.uid() = cs.profile_id)
          or auth_is_service_role()
        )
    )
  );

create policy comparison_candidates_service_role_write
  on public.comparison_candidates
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

-- Waitlist entries
alter table public.waitlist_entries enable row level security;
alter table public.waitlist_entries force row level security;

create policy waitlist_entries_service_role_only
  on public.waitlist_entries
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());

-- Integration events
alter table public.integration_events enable row level security;
alter table public.integration_events force row level security;

create policy integration_events_service_role_only
  on public.integration_events
  for all
  using (auth_is_service_role())
  with check (auth_is_service_role());
