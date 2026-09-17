-- ===========================================================================
-- LPGP Connect CRM — which event(s) a lead is being pursued for
--
-- A sponsor is sold per event, so a lead needs to say which events it's about:
-- "John has Barings for Miami" is a different pursuit from "Barings for
-- Berlin", and the heads-up that stops two people approaching the same firm
-- has to be per event.
--
-- Stored as a JSON array of { event_id, event_name } where event_id is the
-- tracker's portfolio_events.id (another database, so no FK) and event_name
-- is a snapshot for display when the bridge is unreachable.
--
-- Run AFTER 0009_event_targets.sql. Safe to re-run.
-- ===========================================================================

alter table public.leads
  add column if not exists target_events jsonb not null default '[]'::jsonb;

-- Lets "who else has this event in their pipeline?" use the index rather than
-- scanning every lead's JSON.
create index if not exists leads_target_events_idx
  on public.leads using gin (target_events jsonb_path_ops);
