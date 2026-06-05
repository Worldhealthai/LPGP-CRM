-- ===========================================================================
-- LPGP Connect CRM — funds table (fund-level / deal data per manager)
-- Run AFTER 0001_init.sql. Safe to re-run.
-- ===========================================================================

create table if not exists public.funds (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid references public.companies (id) on delete cascade,
  name            text not null,
  vintage_year    integer,
  fund_size_usd   numeric,        -- final/current size in USD
  target_size_usd numeric,        -- target if still fundraising
  strategy        text,           -- e.g. "Private Equity", "Infrastructure", "Private Credit"
  geography       text,
  status          text,           -- e.g. "Investing", "Closed", "Fundraising"
  created_at      timestamptz not null default now()
);
create index if not exists funds_company_idx on public.funds (company_id);

alter table public.funds enable row level security;
drop policy if exists "funds_read" on public.funds;
create policy "funds_read" on public.funds for select using (true);
