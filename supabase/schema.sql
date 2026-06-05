-- ===========================================================================
-- LPGP Connect CRM — FULL SCHEMA (run this once in Supabase → SQL Editor)
-- ---------------------------------------------------------------------------
-- This is the consolidated equivalent of every file in migrations/. If you hit
-- "relation public.companies does not exist", it means an ALTER ran before the
-- table existed — just run THIS file top to bottom and you're set. Idempotent.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- Firm category: LP (institutional investors), GP (fund managers / VC),
-- SP (solution providers / vendors).
do $$ begin
  create type company_category as enum ('LP', 'GP', 'SP');
exception
  when duplicate_object then null;
end $$;

-- --- Companies -------------------------------------------------------------
create table if not exists public.companies (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  category          company_category not null,
  sub_type          text,
  domain            text,
  website           text,
  linkedin_url      text,
  logo_url          text,
  description       text,
  country           text,
  city              text,
  hq_location       text,
  employee_range    text,
  aum               text,
  lusha_company_id  text unique,
  -- profile / visualization fields
  aum_usd           numeric,
  region            text,
  status            text,
  investment_thesis text,
  check_size        text,
  preferred_stages  text,
  geographic_focus  text,
  active_funds      integer,
  allocations       jsonb not null default '[]'::jsonb,
  in_portfolio      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists companies_category_idx on public.companies (category);
create index if not exists companies_name_idx on public.companies (lower(name));
create index if not exists companies_portfolio_idx on public.companies (in_portfolio) where in_portfolio;

-- --- Contacts --------------------------------------------------------------
create table if not exists public.contacts (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references public.companies (id) on delete set null,
  first_name       text,
  last_name        text,
  full_name        text generated always as (
                     nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
                   ) stored,
  job_title        text,
  seniority        text,
  department       text,
  email            text,
  phone            text,
  linkedin_url     text,
  country          text,
  city             text,
  lusha_contact_id text unique,
  -- relationship fields
  relationship_strength integer,
  priority         text,
  status           text,
  last_contacted   date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists contacts_company_idx on public.contacts (company_id);
create index if not exists contacts_name_idx on public.contacts (lower(full_name));

-- --- Notes -----------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('company', 'contact')),
  entity_id   uuid not null,
  body        text not null,
  author      text,
  created_at  timestamptz not null default now()
);
create index if not exists notes_entity_idx on public.notes (entity_type, entity_id);

-- --- Funds (fund-level / deal data per manager) ----------------------------
create table if not exists public.funds (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid references public.companies (id) on delete cascade,
  name            text not null,
  vintage_year    integer,
  fund_size_usd   numeric,
  target_size_usd numeric,
  strategy        text,
  geography       text,
  status          text,
  created_at      timestamptz not null default now()
);
create index if not exists funds_company_idx on public.funds (company_id);

-- --- updated_at trigger ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- --- Row level security ----------------------------------------------------
-- Internal tool: anon may READ. Writes go through the service-role key
-- (bypasses RLS). No public write policies on purpose.
alter table public.companies enable row level security;
alter table public.contacts  enable row level security;
alter table public.notes     enable row level security;
alter table public.funds     enable row level security;

drop policy if exists "funds_read" on public.funds;
create policy "funds_read" on public.funds for select using (true);

drop policy if exists "companies_read" on public.companies;
create policy "companies_read" on public.companies for select using (true);

drop policy if exists "contacts_read" on public.contacts;
create policy "contacts_read" on public.contacts for select using (true);

drop policy if exists "notes_read" on public.notes;
create policy "notes_read" on public.notes for select using (true);
