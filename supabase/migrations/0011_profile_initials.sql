-- ===========================================================================
-- LPGP Connect CRM — link CRM users to the ops panel's deal initials
--
-- Every deal in the tracker carries the initials of the salesperson who
-- signed it. Storing each user's initials here lets the CRM say "signed by
-- John Smith" instead of "signed by JS", and stamps the right initials on
-- deals recorded from this side.
--
-- Run AFTER 0010_lead_target_events.sql. Safe to re-run.
-- ===========================================================================

alter table public.profiles
  add column if not exists initials text;

-- Two people can't share initials, or "who signed this?" has two answers.
-- Case-insensitive, and NULLs are allowed (not everyone signs deals).
create unique index if not exists profiles_initials_unique
  on public.profiles (upper(initials)) where initials is not null;
