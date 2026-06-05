-- ===========================================================================
-- LPGP Connect CRM — relationship fields for contact profiles
-- Run AFTER 0001_init.sql (and 0002). Safe to re-run.
-- ===========================================================================

alter table public.contacts
  add column if not exists relationship_strength integer,   -- 0–5, shown as a dot meter
  add column if not exists priority             text,       -- e.g. "High" / "Medium" / "Low"
  add column if not exists status               text,       -- e.g. "Champion" / "Warm" / "Cold"
  add column if not exists last_contacted       date;
