-- ===========================================================================
-- all_in_one — part 1 of 3
--
-- Run the parts IN ORDER, each on its own in the SQL editor. They were cut
-- only at statement boundaries, so every part is valid SQL by itself, and
-- each one is safe to re-run.
-- ===========================================================================

-- ==================================================================
-- LPGP Connect CRM — COMPLETE SETUP (schema + all seed data)
-- Paste into Supabase -> SQL Editor and Run. Idempotent.
-- Includes CRM auth (profiles) + leads pipeline tables.
-- ==================================================================


-- ##################################################################
-- ## schema.sql
-- ##################################################################

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

-- --- Commitments (LP -> Fund allocations) ----------------------------------
create table if not exists public.commitments (
  id              uuid primary key default gen_random_uuid(),
  lp_company_id   uuid references public.companies (id) on delete cascade,
  fund_id         uuid references public.funds (id) on delete cascade,
  amount_usd      numeric,
  commitment_date date,
  created_at      timestamptz not null default now()
);
create index if not exists commitments_lp_idx on public.commitments (lp_company_id);
create index if not exists commitments_fund_idx on public.commitments (fund_id);

-- --- Service relationships (which SPs a GP/LP uses) -------------------------
create table if not exists public.service_relationships (
  id                  uuid primary key default gen_random_uuid(),
  client_company_id   uuid references public.companies (id) on delete cascade,
  provider_company_id uuid references public.companies (id) on delete cascade,
  role                text,
  created_at          timestamptz not null default now()
);
create index if not exists service_rel_client_idx on public.service_relationships (client_company_id);
create index if not exists service_rel_provider_idx on public.service_relationships (provider_company_id);

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
alter table public.commitments enable row level security;
alter table public.service_relationships enable row level security;

drop policy if exists "funds_read" on public.funds;
create policy "funds_read" on public.funds for select using (true);

drop policy if exists "commitments_read" on public.commitments;
create policy "commitments_read" on public.commitments for select using (true);

drop policy if exists "service_rel_read" on public.service_relationships;
create policy "service_rel_read" on public.service_relationships for select using (true);

drop policy if exists "companies_read" on public.companies;
create policy "companies_read" on public.companies for select using (true);

drop policy if exists "contacts_read" on public.contacts;
create policy "contacts_read" on public.contacts for select using (true);

drop policy if exists "notes_read" on public.notes;
create policy "notes_read" on public.notes for select using (true);

-- ###########################################################################
-- ## CRM: auth profiles + leads pipeline
-- ###########################################################################

-- --- Profiles (one row per Supabase Auth user) -----------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'member',   -- 'member' | 'admin'
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);

-- Auto-create a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already exist.
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;

-- --- Lead pipeline stages --------------------------------------------------
do $$ begin
  create type lead_stage as enum ('New', 'Contacted', 'Discussing', 'Proposal Sent', 'Confirmed', 'Blown Out');
exception
  when duplicate_object then null;
end $$;

-- --- Leads -----------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references public.profiles (id) on delete set null,
  company_id      uuid references public.companies (id) on delete set null,
  company_name    text,                      -- denormalised (net-new or display)
  category        company_category,          -- optional LP/GP/SP tag
  contact_name    text,
  contact_title   text,
  contact_email   text,
  contact_phone   text,
  linkedin_url    text,
  market          text,                      -- 'US', 'UK', ...
  stage           lead_stage not null default 'New',
  value_usd       numeric,
  source          text,
  next_step       text,
  next_step_date  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists leads_owner_idx on public.leads (owner_id);
create index if not exists leads_stage_idx on public.leads (stage);
create index if not exists leads_market_idx on public.leads (market);
create index if not exists leads_company_idx on public.leads (company_id);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
drop policy if exists "leads_read" on public.leads;
create policy "leads_read" on public.leads for select using (true);

-- --- Notes can now attach to a lead too ------------------------------------
alter table public.notes drop constraint if exists notes_entity_type_check;
alter table public.notes
  add constraint notes_entity_type_check check (entity_type in ('company', 'contact', 'lead'));


-- ##################################################################
-- ## seed.sql
-- ##################################################################

-- ===========================================================================
-- LPGP Connect CRM — starter seed (real firms + Lusha-sourced contacts)
-- Run in Supabase → SQL Editor AFTER schema.sql. Safe to re-run (idempotent:
-- companies de-dupe on name, contacts on Lusha id).
--
-- Notes:
--  * AUM / allocation figures are approximate, public-domain (annual reports,
--    Form ADV, public disclosures). Treat as starting points and refine.
--  * Contact work emails were sourced via the Lusha connector (emails only).
--  * Solution Providers (SPs) are service firms, so they carry no AUM/allocation.
-- ===========================================================================

-- ----------------------------------------------------------------------------
-- LPs — institutional investors
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CalPERS', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'United States', 'Sacramento', 'Sacramento, CA', 'https://www.calpers.ca.gov', 'calpers.ca.gov', 502400000000, 300, '$50M - $500M', 'Buyout, Growth, Core', 'Global', 'Largest US public pension. Builds a diversified total-fund portfolio with a growing private markets program across private equity, private debt and real assets.', '[{"label":"Public Equity","value":42},{"label":"Fixed Income","value":28},{"label":"Private Equity","value":17},{"label":"Real Assets","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('CalPERS'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CPP Investments', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.cppinvestments.com', 'cppinvestments.com', 480000000000, 150, '$100M - $1B', 'Buyout, Growth, Core', 'Global', 'Manages the Canada Pension Plan fund with a global, active strategy spanning private equity, credit, real assets and external managers.', '[{"label":"Public Equities","value":24},{"label":"Private Equity","value":24},{"label":"Real Assets","value":21},{"label":"Government Bonds","value":18},{"label":"Credit","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('CPP Investments'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Harvard Management Company', 'LP', 'Endowment', 'North America', 'Active Allocator', 'United States', 'Boston', 'Boston, MA', 'https://www.hmc.harvard.edu', 'hmc.harvard.edu', 53200000000, 120, '$25M - $200M', 'Venture, Growth, Buyout', 'Global', 'Manages Harvard University endowment with a heavy alternatives tilt toward private equity and hedge funds.', '[{"label":"Private Equity","value":39},{"label":"Hedge Funds","value":31},{"label":"Public Equity","value":14},{"label":"Bonds / TIPS","value":11},{"label":"Real Estate","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Harvard Management Company'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Yale Investments Office', 'LP', 'Endowment', 'North America', 'Active Allocator', 'United States', 'New Haven', 'New Haven, CT', 'https://investments.yale.edu', 'investments.yale.edu', 40700000000, 100, '$20M - $150M', 'Venture, Buyout, Absolute Return', 'Global', 'Pioneer of the endowment model; allocates heavily to venture capital, leveraged buyouts and absolute return via long-term manager relationships.', '[{"label":"Venture Capital","value":25},{"label":"Absolute Return","value":20},{"label":"Leveraged Buyouts","value":17},{"label":"Foreign Equity","value":12},{"label":"Real Estate","value":9},{"label":"Bonds / Cash","value":8},{"label":"Other","value":9}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Yale Investments Office'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Wellcome Trust', 'LP', 'Foundation', 'Europe', 'Active Allocator', 'United Kingdom', 'London', 'London, UK', 'https://wellcome.org', 'wellcome.org', 47000000000, 90, '£25M - £200M', 'Growth, Buyout, Venture', 'Global', 'Charitable foundation funding health research; runs a long-horizon endowment with a strong public and private equity allocation.', '[{"label":"Public Equity","value":50},{"label":"Private Equity","value":30},{"label":"Property","value":8},{"label":"Cash / Other","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Wellcome Trust'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ford Foundation', 'LP', 'Foundation', 'North America', 'Active Allocator', 'United States', 'New York', 'New York, NY', 'https://www.fordfoundation.org', 'fordfoundation.org', 16000000000, 70, '$10M - $75M', 'Growth, Buyout', 'Global', 'Social-justice philanthropy investing its endowment across public and private markets with a mission-aligned lens.', '[{"label":"Public Equity","value":40},{"label":"Private Equity","value":25},{"label":"Hedge Funds","value":20},{"label":"Fixed Income","value":10},{"label":"Real Assets","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Ford Foundation'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'AustralianSuper', 'LP', 'Superannuation scheme', 'Asia Pacific', 'Active Allocator', 'Australia', 'Melbourne', 'Melbourne, Australia', 'https://www.australiansuper.com', 'australiansuper.com', 230000000000, 110, 'A$50M - A$1B', 'Core, Growth, Buyout', 'Global', 'Australia largest superannuation fund; scaling international private markets and infrastructure as assets grow.', '[{"label":"Equities","value":55},{"label":"Fixed Income","value":15},{"label":"Infrastructure","value":13},{"label":"Property","value":7},{"label":"Private Equity","value":6},{"label":"Cash","value":4}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('AustralianSuper'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'GIC', 'LP', 'Sovereign wealth fund', 'Asia Pacific', 'Active Allocator', 'Singapore', 'Singapore', 'Singapore', 'https://www.gic.com.sg', 'gic.com.sg', 770000000000, 200, '$100M - $1B', 'Core, Growth, Buyout', 'Global', 'Manages Singapore foreign reserves with a long-term, all-weather portfolio across public and private asset classes.', '[{"label":"Developed Equities","value":30},{"label":"Nominal Bonds","value":30},{"label":"Emerging Equities","value":16},{"label":"Real Estate","value":13},{"label":"Inflation-linked Bonds","value":6},{"label":"Private Equity","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('GIC'));

-- ----------------------------------------------------------------------------
-- GPs — fund managers & VCs
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'BlackRock', 'GP', 'Asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.blackrock.com', 'blackrock.com', '5743592', 11500000000000, '$50M - $5B', 'All stages', 'Global', 'World largest asset manager spanning index, active, multi-asset and alternatives via iShares and institutional mandates.', '[{"label":"Equities","value":52},{"label":"Fixed Income","value":27},{"label":"Multi-Asset","value":8},{"label":"Cash","value":10},{"label":"Alternatives","value":3}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('BlackRock'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Blackstone', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.blackstone.com', 'blackstone.com', '16189032', 1100000000000, '$100M - $5B', 'Buyout, Core+, Credit', 'Global', 'Largest alternatives manager with leading real estate, credit, private equity and hedge fund solutions franchises.', '[{"label":"Credit & Insurance","value":33},{"label":"Real Estate","value":30},{"label":"Private Equity","value":22},{"label":"Multi-Asset","value":15}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Blackstone'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'KKR', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.kkr.com', 'kkr.com', '40628456', 624000000000, '$100M - $3B', 'Buyout, Growth, Infrastructure', 'Global', 'Global investment firm across private equity, credit, infrastructure and real assets with a strong balance-sheet model.', '[{"label":"Credit","value":36},{"label":"Private Equity","value":30},{"label":"Real Assets","value":24},{"label":"Other","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('KKR'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Apollo Global Management', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.apollo.com', 'apollo.com', 751000000000, '$100M - $5B', 'Credit, Buyout, Hybrid', 'Global', 'Credit-led alternatives manager pairing investment-grade and opportunistic credit with private equity and real assets.', '[{"label":"Credit","value":76},{"label":"Private Equity","value":14},{"label":"Real Assets","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Apollo Global Management'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ares Management', 'GP', 'Private credit', 'North America', 'Core GP', 'United States', 'Los Angeles', 'Los Angeles, CA', 'https://www.aresmgmt.com', 'aresmgmt.com', '53826888', 464000000000, '$50M - $2B', 'Credit, Buyout, Secondaries', 'Global', 'Leading private credit manager with adjacent private equity, real assets and secondaries platforms.', '[{"label":"Credit","value":70},{"label":"Real Assets","value":13},{"label":"Private Equity","value":9},{"label":"Secondaries","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Ares Management'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'The Carlyle Group', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Washington', 'Washington, DC', 'https://www.carlyle.com', 'carlyle.com', 447000000000, '$50M - $2B', 'Buyout, Growth, Credit', 'Global', 'Global private equity, credit and investment-solutions manager across corporate, real assets and fund-of-funds strategies.', '[{"label":"Global Credit","value":42},{"label":"Global Private Equity","value":36},{"label":"Investment Solutions","value":22}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('The Carlyle Group'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'EQT', 'GP', 'Private equity', 'Europe', 'Core GP', 'Sweden', 'Stockholm', 'Stockholm, Sweden', 'https://www.eqtgroup.com', 'eqtgroup.com', 140000000000, '€100M - €2B', 'Buyout, Infrastructure', 'Europe, North America, APAC', 'European-rooted global manager focused on private equity and infrastructure with a thematic, value-creation approach.', '[{"label":"Private Equity","value":60},{"label":"Infrastructure","value":30},{"label":"Real Estate","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('EQT'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Sequoia Capital', 'GP', 'Venture capital', 'North America', 'Core GP', 'United States', 'Menlo Park', 'Menlo Park, CA', 'https://www.sequoiacap.com', 'sequoiacap.com', 85000000000, '$1M - $250M', 'Seed, Venture, Growth', 'US, Europe, India', 'Storied venture firm backing founders from seed through growth across technology and healthcare.', '[{"label":"Venture","value":55},{"label":"Growth","value":30},{"label":"Public / Other","value":15}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Sequoia Capital'));

-- ----------------------------------------------------------------------------
-- SPs — solution providers (no AUM/allocation; service firms)
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'KPMG', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'Netherlands', 'Amstelveen', 'Amstelveen, Netherlands', 'https://www.kpmg.com', 'kpmg.com', '270,000+', 'Big Four audit, tax and advisory network serving asset managers and institutional investors worldwide.'
where not exists (select 1 from public.companies where lower(name) = lower('KPMG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'PwC', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.pwc.com', 'pwc.com', '364,000+', 'Big Four professional services firm covering audit, deals, tax and consulting for the private markets industry.'
where not exists (select 1 from public.companies where lower(name) = lower('PwC'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Deloitte', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.deloitte.com', 'deloitte.com', '457,000+', 'Largest professional services network; audit, consulting, financial advisory and tax for GPs and LPs.'
where not exists (select 1 from public.companies where lower(name) = lower('Deloitte'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'MUFG', 'SP', 'Bank', 'Asia Pacific', 'Vendor', 'Japan', 'Tokyo', 'Tokyo, Japan', 'https://www.mufg.jp', 'mufg.jp', '120,000+', 'Global banking group providing financing, fund finance and transaction banking to alternative asset managers.'
where not exists (select 1 from public.companies where lower(name) = lower('MUFG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Apex Group', 'SP', 'Fund administrator', 'Global', 'Vendor', 'Bermuda', 'Hamilton', 'Hamilton, Bermuda', 'https://www.apexgroup.com', 'apexgroup.com', '13,000+', 'Single-source fund administration, depositary and middle-office services for funds across strategies.'
where not exists (select 1 from public.companies where lower(name) = lower('Apex Group'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Citco', 'SP', 'Fund administrator', 'Global', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.citco.com', 'citco.com', '8,000+', 'Leading hedge fund and private markets administrator providing NAV, treasury and investor services.'
where not exists (select 1 from public.companies where lower(name) = lower('Citco'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Kirkland & Ellis', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'Chicago', 'Chicago, IL', 'https://www.kirkland.com', 'kirkland.com', '7,000+', 'Top private equity law firm advising on fund formation, M&A and financing for sponsors globally.'
where not exists (select 1 from public.companies where lower(name) = lower('Kirkland & Ellis'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Simpson Thacher & Bartlett', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.stblaw.com', 'stblaw.com', '2,000+', 'Premier fund formation and private equity legal practice advising leading global GPs and LPs.'
where not exists (select 1 from public.companies where lower(name) = lower('Simpson Thacher & Bartlett'));

-- ----------------------------------------------------------------------------
-- Contacts (work emails via Lusha; de-dupe on Lusha contact id)
-- ----------------------------------------------------------------------------
-- BlackRock
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Gavin','Lewis','Managing Director, Head of Institutional','Director','General Management','gavin.lewis@blackrock.com','https://www.linkedin.com/in/gavin-lewis-19b0664','United Kingdom','London','494938814'
where not exists (select 1 from public.contacts where lusha_contact_id='494938814');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Claire','Lane','Managing Director & Chief Marketing Officer, EMEA','C-Suite','Marketing','claire.lane@blackrock.com','https://www.linkedin.com/in/claire-lane-b1ab864a','United Kingdom',null,'92629316'
where not exists (select 1 from public.contacts where lusha_contact_id='92629316');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Stephen','Scharf','Managing Director & Global CISO','C-Suite','Information Technology','stephen.scharf@blackrock.com','https://www.linkedin.com/in/stephen-scharf-75373113','United States','Boston','1314712489'
where not exists (select 1 from public.contacts where lusha_contact_id='1314712489');

-- Blackstone
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'Kenneth','Caplan','Global Co-Chief Investment Officer','C-Suite','Finance','kenneth.caplan@blackstone.com','https://www.linkedin.com/in/ken-caplan','United States','New York','355761437'
where not exists (select 1 from public.contacts where lusha_contact_id='355761437');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'Mukesh','Mehta','Chief Investment Officer & Senior MD, Private Equity','C-Suite','Finance','mukesh.mehta@blackstone.com','https://www.linkedin.com/in/mukesh-mehta-1920012','India','Mumbai','426796744'
where not exists (select 1 from public.contacts where lusha_contact_id='426796744');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'James','Seppala','Senior Managing Director & Head of Real Estate','Director','General Management','james.seppala@blackstone.com','https://www.linkedin.com/in/james-seppala','United Kingdom','London','826352526'
where not exists (select 1 from public.contacts where lusha_contact_id='826352526');

-- KKR
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Tara','Davies','Partner, Head of European Infrastructure','Partner','General Management','tara.davies@kkr.com','https://www.linkedin.com/in/tara-courtney-davies','United Kingdom','London','665840378'
where not exists (select 1 from public.contacts where lusha_contact_id='665840378');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Vincent','Policard','Partner','Partner','General Management','vincent.policard@kkr.com','https://www.linkedin.com/in/vincent-policard-790b999b','United Kingdom','London','743914871'
where not exists (select 1 from public.contacts where lusha_contact_id='743914871');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Shreya','Malik','Managing Director','Director','General Management','shreya.malik@kkr.com','https://www.linkedin.com/in/shreyamalik','United Kingdom',null,'19029368'
where not exists (select 1 from public.contacts where lusha_contact_id='19029368');

-- Ares Management
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Michael','Arougheti','Co-Founder & Chief Executive Officer','Founder','General Management','marougheti@aresmgmt.com','https://www.linkedin.com/in/michael-arougheti','United States','New York','465136760'
where not exists (select 1 from public.contacts where lusha_contact_id='465136760');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Daniel','Taylor','Partner, Co-Head of Global Product & Investor Relations','Partner','Investor Relations','dtaylor@aresmgmt.com','https://www.linkedin.com/in/daniel-j-taylor-4067382','United Kingdom','London','462129709'
where not exists (select 1 from public.contacts where lusha_contact_id='462129709');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Eli','Appelbaum','Partner, Co-Head of Europe, Alternative Credit','Partner','Finance','eappelbaum@aresmgmt.com','https://www.linkedin.com/in/eli-appelbaum','United Kingdom','London','75431114'
where not exists (select 1 from public.contacts where lusha_contact_id='75431114');

-- CPP Investments
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'John','Graham','President & Chief Executive Officer','C-Suite','General Management','jgraham@cppib.ca','https://www.linkedin.com/in/johngrahamcppib','Canada','Toronto','108838240'
where not exists (select 1 from public.contacts where lusha_contact_id='108838240');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'Amy','Flikerski','Managing Director, Head of External Portfolio Management','Director','Finance','amy.flikerski@cppinvestments.com','https://www.linkedin.com/in/amy-flikerski-1730b023','United Kingdom',null,'834110304'
where not exists (select 1 from public.contacts where lusha_contact_id='834110304');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'Maximilian','Biagosch','Senior Managing Director','Director','General Management','maximilian.biagosch@cppinvestments.com','https://www.linkedin.com/in/maximilian-biagosch-79aa369','United Kingdom','London','711450727'
where not exists (select 1 from public.contacts where lusha_contact_id='711450727');


-- ##################################################################
-- ## seed_companies_2.sql
-- ##################################################################

-- ===========================================================================
-- LPGP Connect CRM — company expansion (12 more major firms)
-- Run AFTER schema.sql. Idempotent (de-dupes on name). Approximate public-domain
-- AUM / allocation figures (annual reports, Form ADV style) — refine as needed.
-- ===========================================================================

-- ---- LPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CalSTRS', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'United States', 'West Sacramento', 'West Sacramento, CA', 'https://www.calstrs.com', 'calstrs.com', 350000000000, 200, '$50M - $400M', 'Buyout, Growth, Core', 'Global', 'Second-largest US public pension; diversified total fund with a sizeable private equity and real estate program and a collaborative co-investment model.', '[{"label":"Public Equity","value":42},{"label":"Private Equity","value":17},{"label":"Real Estate","value":15},{"label":"Risk Mitigating","value":14},{"label":"Fixed Income","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('CalSTRS'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ontario Teachers'' Pension Plan', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.otpp.com', 'otpp.com', 190000000000, 150, '$100M - $1B', 'Buyout, Growth, Infrastructure', 'Global', 'Direct-investing Canadian pension plan with strong infrastructure, private equity and natural-resources teams alongside external managers.', '[{"label":"Equities","value":33},{"label":"Fixed Income","value":27},{"label":"Real Assets","value":22},{"label":"Credit","value":12},{"label":"Inflation Hedge","value":6}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Ontario Teachers'' Pension Plan'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Abu Dhabi Investment Authority', 'LP', 'Sovereign wealth fund', 'Middle East & Africa', 'Active Allocator', 'United Arab Emirates', 'Abu Dhabi', 'Abu Dhabi, UAE', 'https://www.adia.ae', 'adia.ae', 1000000000000, 250, '$100M - $2B', 'Core, Buyout, Growth', 'Global', 'One of the world largest sovereign investors, deploying across a broad reference portfolio with deep external manager and direct programs.', '[{"label":"Developed Equities","value":42},{"label":"Alternatives","value":31},{"label":"Government Bonds","value":15},{"label":"Emerging Equities","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Abu Dhabi Investment Authority'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Norges Bank Investment Management', 'LP', 'Sovereign wealth fund', 'Europe', 'Active Allocator', 'Norway', 'Oslo', 'Oslo, Norway', 'https://www.nbim.no', 'nbim.no', 1800000000000, 100, '$100M - $2B', 'Core, Index, Real Assets', 'Global', 'Manages Norway Government Pension Fund Global — a predominantly listed-equity portfolio with growing unlisted real estate and renewable infrastructure.', '[{"label":"Equities","value":71},{"label":"Fixed Income","value":26},{"label":"Real Assets","value":3}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Norges Bank Investment Management'));

-- ---- GPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Brookfield Asset Management', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.brookfield.com', 'brookfield.com', 1000000000000, '$100M - $5B', 'Buyout, Infrastructure, Real Assets', 'Global', 'Leading real-assets and alternatives manager across infrastructure, renewable power, real estate, private equity and credit.', '[{"label":"Infrastructure","value":32},{"label":"Real Estate","value":23},{"label":"Renewable Power & Transition","value":18},{"label":"Credit","value":14},{"label":"Private Equity","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Brookfield Asset Management'));
