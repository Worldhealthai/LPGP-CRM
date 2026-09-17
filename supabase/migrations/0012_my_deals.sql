-- ===========================================================================
-- LPGP Connect CRM — "my deals"
--
-- A salesperson's deals are rows in the ops panel, not here. Claiming one is
-- an ops_link owned by a person rather than by a lead or an account, so the
-- existing link table (and its snapshot, which keeps things readable when the
-- tracker is unreachable) does the work.
--
-- Run AFTER 0011_profile_initials.sql. Safe to re-run.
-- ===========================================================================

alter table public.ops_links drop constraint if exists ops_links_entity_type_check;
alter table public.ops_links
  add constraint ops_links_entity_type_check
  check (entity_type in ('lead', 'account', 'company', 'user'));
