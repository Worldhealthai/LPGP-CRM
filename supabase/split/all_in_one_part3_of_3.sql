-- ===========================================================================
-- all_in_one — part 3 of 3
--
-- Run the parts IN ORDER, each on its own in the SQL editor. They were cut
-- only at statement boundaries, so every part is valid SQL by itself, and
-- each one is safe to re-run.
-- ===========================================================================

-- ##################################################################
-- ## seed_funds.sql
-- ##################################################################

-- ===========================================================================
-- LPGP Connect CRM — flagship funds (fund-level data per GP)
-- Run AFTER schema.sql (or 0004_funds.sql) and the company seeds.
-- Idempotent (de-dupes on fund name). Figures are approximate, public-domain
-- (press releases, manager disclosures) — NOT pulled from Form ADV Schedule D,
-- which is blocked from this environment. Refine with the live filing.
-- ===========================================================================

insert into public.funds (company_id, name, vintage_year, fund_size_usd, target_size_usd, strategy, geography, status)
select c.id, v.name, v.vintage, v.size, v.target, v.strategy, v.geography, v.status
from (values
  -- Blackstone
  ('Blackstone', 'Blackstone Real Estate Partners X', 2023, 30400000000::numeric, null::numeric, 'Real Estate', 'Global', 'Investing'),
  ('Blackstone', 'Blackstone Capital Partners VIII', 2019, 26000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Blackstone', 'BREP Europe VII', 2023, 11400000000, null, 'Real Estate', 'Europe', 'Investing'),
  -- KKR
  ('KKR', 'KKR North America Fund XIII', 2021, 19000000000, null, 'Private Equity', 'North America', 'Investing'),
  ('KKR', 'KKR Global Infrastructure Investors IV', 2021, 17000000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('KKR', 'KKR Asian Fund IV', 2021, 15000000000, null, 'Private Equity', 'Asia', 'Investing'),
  -- Apollo
  ('Apollo Global Management', 'Apollo Investment Fund X', 2023, 20000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Apollo Global Management', 'Apollo Hybrid Value Fund III', 2023, 5000000000, null, 'Hybrid Value', 'Global', 'Investing'),
  -- Ares
  ('Ares Management', 'Ares Corporate Opportunities Fund VI', 2021, 8000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Ares Management', 'Ares Capital Europe VI', 2023, 12000000000, null, 'Private Credit', 'Europe', 'Investing'),
  -- Carlyle
  ('The Carlyle Group', 'Carlyle Partners VIII', 2023, 14800000000, null, 'Private Equity', 'Global', 'Investing'),
  ('The Carlyle Group', 'Carlyle Realty Partners IX', 2021, 8000000000, null, 'Real Estate', 'North America', 'Investing'),
  -- EQT
  ('EQT', 'EQT X', 2023, 23800000000, null, 'Private Equity', 'Europe / North America', 'Investing'),
  ('EQT', 'EQT Infrastructure VI', 2023, 23500000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('EQT', 'EQT IX', 2021, 16900000000, null, 'Private Equity', 'Europe', 'Closed'),
  -- TPG
  ('TPG', 'TPG Partners VIII', 2022, 13400000000, null, 'Private Equity', 'Global', 'Investing'),
  ('TPG', 'TPG Rise Climate', 2021, 7300000000, null, 'Impact / Climate', 'Global', 'Investing'),
  -- Vista
  ('Vista Equity Partners', 'Vista Equity Partners Fund VIII', 2022, 20000000000, null, 'Software Buyout', 'North America', 'Investing'),
  ('Vista Equity Partners', 'Vista Foundation Fund IV', 2020, 4000000000, null, 'Software (Mid-Market)', 'North America', 'Closed'),
  -- Thoma Bravo
  ('Thoma Bravo', 'Thoma Bravo Fund XV', 2022, 24300000000, null, 'Software Buyout', 'North America', 'Investing'),
  ('Thoma Bravo', 'Thoma Bravo Fund XIV', 2020, 17800000000, null, 'Software Buyout', 'North America', 'Closed'),
  ('Thoma Bravo', 'Thoma Bravo Discover Fund IV', 2022, 6200000000, null, 'Software (Mid-Market)', 'North America', 'Investing'),
  -- CVC
  ('CVC Capital Partners', 'CVC Capital Partners Fund IX', 2023, 28100000000, null, 'Private Equity', 'Europe / Americas', 'Investing'),
  ('CVC Capital Partners', 'CVC Capital Partners Fund VIII', 2020, 23000000000, null, 'Private Equity', 'Europe / Americas', 'Closed'),
  -- Bain Capital
  ('Bain Capital', 'Bain Capital Fund XII', 2017, 9400000000, null, 'Private Equity', 'Global', 'Closed'),
  ('Bain Capital', 'Bain Capital Asia Fund V', 2022, 7100000000, null, 'Private Equity', 'Asia', 'Investing'),
  -- Warburg Pincus
  ('Warburg Pincus', 'Warburg Pincus Global Growth 14', 2021, 16000000000, null, 'Growth Equity', 'Global', 'Investing'),
  -- General Atlantic
  ('General Atlantic', 'General Atlantic Investment Partners 2021', 2021, 7800000000, null, 'Growth Equity', 'Global', 'Investing'),
  -- Brookfield
  ('Brookfield Asset Management', 'Brookfield Infrastructure Fund V', 2023, 30000000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('Brookfield Asset Management', 'Brookfield Global Transition Fund II', 2024, 10000000000, null, 'Energy Transition', 'Global', 'Investing'),
  ('Brookfield Asset Management', 'Brookfield Capital Partners VI', 2024, null, 12000000000, 'Private Equity', 'Global', 'Fundraising')
) as v(company, name, vintage, size, target, strategy, geography, status)
join public.companies c on lower(c.name) = lower(v.company)
where not exists (select 1 from public.funds f where f.name = v.name);


-- ##################################################################
-- ## seed_commitments.sql
-- ##################################################################

-- ===========================================================================
-- LPGP Connect CRM — sample LP commitments to funds (LP -> Fund -> GP)
-- Run AFTER 0005_commitments.sql, the company seeds and seed_funds.sql.
-- Idempotent (one row per LP+fund pair).
--
-- NOTE: amounts here are ILLUSTRATIVE / approximate. The relationships are
-- directionally real (these LPs are known investors in these managers), but
-- exact commitment sizes should be replaced with figures from each LP's public
-- private-markets disclosure (e.g. CalPERS/CalSTRS/TRS PE program reports).
-- ===========================================================================

insert into public.commitments (lp_company_id, fund_id, amount_usd, commitment_date)
select lp.id, fn.id, v.amount, v.cdate
from (values
  ('CalPERS', 'Blackstone Real Estate Partners X', 500000000::numeric, date '2023-06-01'),
  ('CalPERS', 'KKR North America Fund XIII', 400000000, date '2021-09-01'),
  ('CalSTRS', 'Blackstone Capital Partners VIII', 300000000, date '2020-03-01'),
  ('CalSTRS', 'Thoma Bravo Fund XV', 250000000, date '2022-10-01'),
  ('Teacher Retirement System of Texas', 'KKR Asian Fund IV', 200000000, date '2021-05-01'),
  ('Teacher Retirement System of Texas', 'EQT X', 300000000, date '2023-04-01'),
  ('CPP Investments', 'Carlyle Partners VIII', 350000000, date '2023-02-01'),
  ('Ontario Teachers'' Pension Plan', 'CVC Capital Partners Fund IX', 270000000, date '2023-07-01'),
  ('AustralianSuper', 'Brookfield Infrastructure Fund V', 250000000, date '2023-08-01'),
  ('GIC', 'Vista Equity Partners Fund VIII', 300000000, date '2022-06-01'),
  ('Future Fund', 'Apollo Investment Fund X', 200000000, date '2023-09-01'),
  ('OMERS', 'Ares Corporate Opportunities Fund VI', 150000000, date '2021-11-01')
) as v(lp_name, fund_name, amount, cdate)
join public.companies lp on lower(lp.name) = lower(v.lp_name)
join public.funds fn on fn.name = v.fund_name
where not exists (
  select 1 from public.commitments c where c.lp_company_id = lp.id and c.fund_id = fn.id
);


-- ##################################################################
-- ## seed_service_relationships.sql
-- ##################################################################

-- ===========================================================================
-- LPGP Connect CRM — sample service relationships (which SPs a GP uses)
-- Run AFTER 0006_service_relationships.sql and the company seeds. Idempotent.
--
-- NOTE: these mappings are ILLUSTRATIVE / directional. Service-provider
-- engagements (counsel, auditor, fund admin, fund finance) are disclosed
-- piecemeal in fund launches, LPAs and press; replace with verified
-- relationships as you confirm them.
-- ===========================================================================

insert into public.service_relationships (client_company_id, provider_company_id, role)
select cl.id, pr.id, v.role
from (values
  ('Blackstone', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('Blackstone', 'Deloitte', 'Auditor'),
  ('Blackstone', 'State Street', 'Fund administrator'),
  ('KKR', 'Kirkland & Ellis', 'Legal counsel'),
  ('KKR', 'KPMG', 'Auditor'),
  ('KKR', 'Citco', 'Fund administrator'),
  ('Apollo Global Management', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('Apollo Global Management', 'Deloitte', 'Auditor'),
  ('Apollo Global Management', 'SS&C Technologies', 'Fund administrator'),
  ('Ares Management', 'Kirkland & Ellis', 'Legal counsel'),
  ('Ares Management', 'EY', 'Auditor'),
  ('Ares Management', 'MUFG', 'Fund finance'),
  ('The Carlyle Group', 'Latham & Watkins', 'Legal counsel'),
  ('The Carlyle Group', 'EY', 'Auditor'),
  ('EQT', 'Clifford Chance', 'Legal counsel'),
  ('EQT', 'KPMG', 'Auditor'),
  ('EQT', 'Aztec Group', 'Fund administrator'),
  ('TPG', 'Kirkland & Ellis', 'Legal counsel'),
  ('TPG', 'Goldman Sachs', 'Placement agent'),
  ('Vista Equity Partners', 'Kirkland & Ellis', 'Legal counsel'),
  ('Vista Equity Partners', 'Apex Group', 'Fund administrator'),
  ('Thoma Bravo', 'Kirkland & Ellis', 'Legal counsel'),
  ('Thoma Bravo', 'PwC', 'Auditor'),
  ('Brookfield Asset Management', 'Latham & Watkins', 'Legal counsel'),
  ('Brookfield Asset Management', 'Morgan Stanley', 'Banking'),
  ('CVC Capital Partners', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('CVC Capital Partners', 'Aztec Group', 'Fund administrator'),
  ('Bain Capital', 'Kirkland & Ellis', 'Legal counsel'),
  ('Bain Capital', 'PwC', 'Auditor'),
  ('Warburg Pincus', 'Kirkland & Ellis', 'Legal counsel'),
  ('Warburg Pincus', 'EY', 'Auditor'),
  ('General Atlantic', 'Clifford Chance', 'Legal counsel'),
  ('BlackRock', 'PwC', 'Auditor')
) as v(client_name, provider_name, role)
join public.companies cl on lower(cl.name) = lower(v.client_name)
join public.companies pr on lower(pr.name) = lower(v.provider_name)
where not exists (
  select 1 from public.service_relationships s
  where s.client_company_id = cl.id
    and s.provider_company_id = pr.id
    and coalesce(s.role, '') = coalesce(v.role, '')
);


-- ##################################################################
-- ## Sales layer: accounts, points of contact, activities, tasks,
-- ## ops-panel links and spreadsheet imports (migration 0008)
-- ##################################################################

-- --- Accounts (sponsors) ---------------------------------------------------
create table if not exists public.accounts (
  id                   uuid primary key default gen_random_uuid(),
  company_id           uuid references public.companies (id) on delete set null,
  name                 text not null,
  category             company_category,
  owner_id             uuid references public.profiles (id) on delete set null,
  status               text not null default 'Active',   -- Active | Renewal due | Churned | Prospect
  tier                 text,                             -- Platinum | Gold | Silver | Bronze
  health               text,                             -- Healthy | At risk | Critical
  domain               text,
  website              text,
  linkedin_url         text,
  hq_location          text,
  country              text,
  -- Company name as it is spelled in the ops panel. Set when a link is
  -- confirmed so later reconciles skip the fuzzy match entirely.
  ops_company          text,
  first_sponsored_year integer,
  renewal_date         date,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists accounts_owner_idx    on public.accounts (owner_id);
create index if not exists accounts_company_idx  on public.accounts (company_id);
create index if not exists accounts_name_idx     on public.accounts (lower(name));
create index if not exists accounts_status_idx   on public.accounts (status);

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- --- Points of contact -----------------------------------------------------
-- Standalone by design: a sponsor's billing contact often isn't in the
-- intelligence database at all. contact_id links one up when it is.
create table if not exists public.account_contacts (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references public.accounts (id) on delete cascade,
  contact_id     uuid references public.contacts (id) on delete set null,
  full_name      text not null,
  job_title      text,
  email          text,
  phone          text,
  mobile         text,
  linkedin_url   text,
  role           text,                       -- Primary | Billing | Marketing | Speaker liaison | Legal
  is_primary     boolean not null default false,
  last_contacted date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists account_contacts_account_idx on public.account_contacts (account_id);
-- At most one primary contact per account.
create unique index if not exists account_contacts_one_primary
  on public.account_contacts (account_id) where is_primary;

drop trigger if exists account_contacts_set_updated_at on public.account_contacts;
create trigger account_contacts_set_updated_at
  before update on public.account_contacts
  for each row execute function public.set_updated_at();

-- --- Activity log ----------------------------------------------------------
do $$ begin
  create type activity_type as enum ('call', 'email', 'meeting', 'linkedin', 'note', 'task');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.activities (
  id                 uuid primary key default gen_random_uuid(),
  type               activity_type not null default 'call',
  outcome            text,                   -- Connected | Voicemail | No answer | Gatekeeper | ...
  subject            text,
  body               text,
  duration_seconds   integer,
  occurred_at        timestamptz not null default now(),
  owner_id           uuid references public.profiles (id) on delete set null,
  lead_id            uuid references public.leads (id) on delete cascade,
  account_id         uuid references public.accounts (id) on delete cascade,
  company_id         uuid references public.companies (id) on delete cascade,
  contact_id         uuid references public.contacts (id) on delete set null,
  account_contact_id uuid references public.account_contacts (id) on delete set null,
  created_at         timestamptz not null default now()
);
create index if not exists activities_lead_idx    on public.activities (lead_id, occurred_at desc);
create index if not exists activities_account_idx on public.activities (account_id, occurred_at desc);
create index if not exists activities_company_idx on public.activities (company_id, occurred_at desc);
create index if not exists activities_owner_idx   on public.activities (owner_id, occurred_at desc);
create index if not exists activities_recent_idx  on public.activities (occurred_at desc);

-- --- Tasks / follow-ups ----------------------------------------------------
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  notes      text,
  due_date   date,
  priority   text not null default 'Normal',  -- High | Normal | Low
  done       boolean not null default false,
  done_at    timestamptz,
  owner_id   uuid references public.profiles (id) on delete set null,
  lead_id    uuid references public.leads (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_owner_due_idx on public.tasks (owner_id, done, due_date);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- --- Ops panel links -------------------------------------------------------
-- ops_deal_id is TrackerLPGP's deals.id (a bigint in another database), so it
-- is stored as a plain integer with no FK. `snapshot` holds the last payload
-- the bridge returned: amounts, paid status and the event allocations.
create table if not exists public.ops_links (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('lead', 'account', 'company')),
  entity_id   uuid not null,
  ops_deal_id integer not null,
  ops_company text,
  confidence  numeric,
  snapshot    jsonb not null default '{}'::jsonb,
  synced_at   timestamptz not null default now(),
  linked_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create unique index if not exists ops_links_unique
  on public.ops_links (entity_type, entity_id, ops_deal_id);
create index if not exists ops_links_entity_idx on public.ops_links (entity_type, entity_id);
create index if not exists ops_links_deal_idx   on public.ops_links (ops_deal_id);

-- --- Spreadsheet import batches -------------------------------------------
create table if not exists public.lead_imports (
  id            uuid primary key default gen_random_uuid(),
  filename      text,
  row_count     integer not null default 0,
  created_count integer not null default 0,
  skipped_count integer not null default 0,
  mapping       jsonb not null default '{}'::jsonb,
  owner_id      uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- --- Lead columns the sales workflow needs ---------------------------------
alter table public.leads
  add column if not exists disposition      text,          -- last call outcome
  add column if not exists callback_at      timestamptz,   -- scheduled call-back
  add column if not exists last_activity_at timestamptz,
  add column if not exists call_count       integer not null default 0,
  add column if not exists do_not_call      boolean not null default false,
  add column if not exists priority         text not null default 'Normal',
  add column if not exists website          text,
  add column if not exists country          text,
  add column if not exists title            text,          -- free-text deal title
  add column if not exists import_id        uuid references public.lead_imports (id) on delete set null,
  add column if not exists account_id       uuid references public.accounts (id) on delete set null,
  add column if not exists ops_deal_id      integer,       -- confirmed tracker deal
  add column if not exists ops_checked_at   timestamptz;   -- last time we asked the bridge

create index if not exists leads_callback_idx on public.leads (callback_at) where callback_at is not null;
create index if not exists leads_activity_idx on public.leads (last_activity_at desc nulls last);
create index if not exists leads_name_idx     on public.leads (lower(company_name));

-- --- Notes can attach to an account too ------------------------------------
alter table public.notes drop constraint if exists notes_entity_type_check;
alter table public.notes
  add constraint notes_entity_type_check
  check (entity_type in ('company', 'contact', 'lead', 'account'));

-- --- Row level security ----------------------------------------------------
-- Same posture as the rest of the app: anon may READ, every write goes through
-- the service-role key in server code.
alter table public.accounts         enable row level security;
alter table public.account_contacts enable row level security;
alter table public.activities       enable row level security;
alter table public.tasks            enable row level security;
alter table public.ops_links        enable row level security;
alter table public.lead_imports     enable row level security;

drop policy if exists "accounts_read" on public.accounts;
create policy "accounts_read" on public.accounts for select using (true);

drop policy if exists "account_contacts_read" on public.account_contacts;
create policy "account_contacts_read" on public.account_contacts for select using (true);

drop policy if exists "activities_read" on public.activities;
create policy "activities_read" on public.activities for select using (true);

drop policy if exists "tasks_read" on public.tasks;
create policy "tasks_read" on public.tasks for select using (true);

drop policy if exists "ops_links_read" on public.ops_links;
create policy "ops_links_read" on public.ops_links for select using (true);

drop policy if exists "lead_imports_read" on public.lead_imports;
create policy "lead_imports_read" on public.lead_imports for select using (true);


-- ##################################################################
-- ## Event revenue targets, keyed to the ops panel's events (0009)
-- ##################################################################

create table if not exists public.event_targets (
  id               uuid primary key default gen_random_uuid(),
  -- TrackerLPGP portfolio_events.id — an integer in another database, so no FK.
  ops_event_id     integer not null unique,
  -- Snapshot of the tracker's name, so the page still reads sensibly when the
  -- bridge is unreachable.
  event_name       text,
  -- Programme series ("portfolio"): private-debt, cfo-private-markets, …
  series           text,
  target_amount    numeric,
  target_currency  text not null default 'GBP',
  target_sponsors  integer,
  notes            text,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists event_targets_series_idx on public.event_targets (series);

drop trigger if exists event_targets_set_updated_at on public.event_targets;
create trigger event_targets_set_updated_at
  before update on public.event_targets
  for each row execute function public.set_updated_at();

alter table public.event_targets enable row level security;
drop policy if exists "event_targets_read" on public.event_targets;
create policy "event_targets_read" on public.event_targets for select using (true);


-- ##################################################################
-- ## Which event(s) a lead is being pursued for (0010)
-- ##################################################################

alter table public.leads
  add column if not exists target_events jsonb not null default '[]'::jsonb;

-- Lets "who else has this event in their pipeline?" use the index rather than
-- scanning every lead's JSON.
create index if not exists leads_target_events_idx
  on public.leads using gin (target_events jsonb_path_ops);


-- ##################################################################
-- ## Link CRM users to the ops panel's deal initials (0011)
-- ##################################################################

alter table public.profiles
  add column if not exists initials text;

-- Two people can't share initials, or "who signed this?" has two answers.
-- Case-insensitive, and NULLs are allowed (not everyone signs deals).
create unique index if not exists profiles_initials_unique
  on public.profiles (upper(initials)) where initials is not null;


-- ##################################################################
-- ## A person can claim an ops-panel deal as their own (0012)
-- ##################################################################

alter table public.ops_links drop constraint if exists ops_links_entity_type_check;
alter table public.ops_links
  add constraint ops_links_entity_type_check
  check (entity_type in ('lead', 'account', 'company', 'user'));
