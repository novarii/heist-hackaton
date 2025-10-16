-- Phase 1 – Foundation (core schema)
-- 1. Create enums for profile metadata, agent visibility, and waitlist status.
-- 2. Enable pgvector so we can store agent embeddings.
-- 3. Establish core tables: profiles, anonymous_prompts, agents, agent_tags, agent_tag_map.

-- Ensure required extensions exist.
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Enums used across the schema.
create type user_role as enum ('employer', 'founder', 'recruiter', 'other');
create type company_size as enum ('small', 'medium', 'enterprise');
create type onboarding_status as enum ('pending', 'completed');
create type agent_visibility as enum ('public', 'hidden', 'internal');
create type waitlist_status as enum ('new', 'contacted');

-- Utility trigger to maintain updated_at timestamps.
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Profiles extend Supabase auth.users with application metadata.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  role user_role,
  company text,
  company_size company_size,
  focus_industries text[],
  onboarding_status onboarding_status not null default 'pending'
);

create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function set_updated_at();

-- Anonymous prompts capture pre-auth leads originating from public surfaces.
create table public.anonymous_prompts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  prompt_text text not null,
  source text,
  n8n_run_id text,
  ip_hash text,
  user_agent text,
  linked_profile_id uuid references public.profiles (id)
);

-- Agents catalog table, with embeddings for future similarity scoring.
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  pricing_model text,
  base_rate numeric,
  rating numeric,
  experience_years integer,
  success_rate numeric,
  visibility agent_visibility not null default 'public',
  profile_embedding vector(1536),
  constraint rating_range check (rating is null or (rating >= 0 and rating <= 5)),
  constraint success_rate_range check (success_rate is null or (success_rate >= 0 and success_rate <= 100))
);

create trigger trg_agents_set_updated_at
  before update on public.agents
  for each row
  execute function set_updated_at();

-- Tags provide lightweight faceting for agents.
create table public.agent_tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique
);

-- Join table with weighting for scoring heuristics.
create table public.agent_tag_map (
  agent_id uuid not null references public.agents (id) on delete cascade,
  tag_id uuid not null references public.agent_tags (id) on delete cascade,
  weight integer not null,
  primary key (agent_id, tag_id),
  constraint weight_range check (weight >= 1 and weight <= 5)
);
