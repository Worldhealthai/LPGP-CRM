-- ===========================================================================
-- LPGP Connect CRM — profile & visualization fields for company pages
-- Run in Supabase → SQL Editor after 0001_init.sql. Safe to re-run.
-- ===========================================================================

alter table public.companies
  add column if not exists aum_usd          numeric,                       -- numeric AUM, drives the hero figure
  add column if not exists region           text,                          -- e.g. "Brazil / Latin America & Caribbean"
  add column if not exists status           text,                          -- e.g. "Active Allocator"
  add column if not exists investment_thesis text,
  add column if not exists check_size       text,                          -- e.g. "$5M – $20M"
  add column if not exists preferred_stages text,
  add column if not exists geographic_focus text,                          -- e.g. "Global (NAM, EMEA, APAC)"
  add column if not exists active_funds     integer,                       -- core GP relationships count
  add column if not exists allocations      jsonb not null default '[]'::jsonb, -- [{ "label": "Equities", "value": 34 }, ...]
  add column if not exists in_portfolio     boolean not null default false;

-- Index for a future "My Portfolio" view.
create index if not exists companies_portfolio_idx on public.companies (in_portfolio) where in_portfolio;
