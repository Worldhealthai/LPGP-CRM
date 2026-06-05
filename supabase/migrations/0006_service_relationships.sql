-- ===========================================================================
-- LPGP Connect CRM — service relationships (which SPs a GP/LP uses)
-- Run AFTER 0001_init.sql. Safe to re-run.
-- client = the GP/LP being served; provider = the SP doing the work.
-- ===========================================================================

create table if not exists public.service_relationships (
  id                  uuid primary key default gen_random_uuid(),
  client_company_id   uuid references public.companies (id) on delete cascade,
  provider_company_id uuid references public.companies (id) on delete cascade,
  role                text,   -- e.g. "Legal counsel", "Auditor", "Fund administrator", "Fund finance"
  created_at          timestamptz not null default now()
);
create index if not exists service_rel_client_idx on public.service_relationships (client_company_id);
create index if not exists service_rel_provider_idx on public.service_relationships (provider_company_id);

alter table public.service_relationships enable row level security;
drop policy if exists "service_rel_read" on public.service_relationships;
create policy "service_rel_read" on public.service_relationships for select using (true);
