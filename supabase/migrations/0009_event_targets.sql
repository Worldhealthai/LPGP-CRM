-- ===========================================================================
-- LPGP Connect CRM — event revenue targets
--
-- The ops panel (TrackerLPGP) owns what an event has actually earned. What it
-- has no concept of is what we were AIMING for, or which programme series an
-- event belongs to. Both live here, keyed by the tracker's portfolio_events.id.
--
-- Run AFTER 0008_sales_crm.sql. Safe to re-run.
-- ===========================================================================

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
