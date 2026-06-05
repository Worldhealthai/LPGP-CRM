-- ===========================================================================
-- LPGP Connect CRM — LP commitments to funds (LP -> Fund -> GP relationship)
-- Run AFTER 0004_funds.sql. Safe to re-run.
-- ===========================================================================

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

alter table public.commitments enable row level security;
drop policy if exists "commitments_read" on public.commitments;
create policy "commitments_read" on public.commitments for select using (true);
