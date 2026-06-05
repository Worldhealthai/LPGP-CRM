# LPGP Connect CRM

Internal relationship & intelligence CRM for **LPGP Connect** — finance, capital
markets and private markets. Tracks firms and the senior people inside them, with
a Lusha-powered lead import pipeline.

## Firm taxonomy

Every company belongs to exactly one of three categories:

- **LP** — Limited Partners / institutional investors: insurers, foundations,
  endowments, pension funds, superannuation schemes, multi-family offices.
- **GP** — General Partners / fund managers: PE & asset managers (BlackRock, Ares,
  Oaktree) and venture capital firms.
- **SP** — Solution Providers / vendors: audit & advisory (KPMG), banks (MUFG),
  fund administrators (Apex), law firms (Kirkland & Ellis).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
shadcn/ui (new-york) · Lucide · Supabase (Postgres) · Lusha REST API.

## Data model

Postgres tables in `supabase/migrations/0001_init.sql`: `companies`, `contacts`,
`notes`. The app degrades gracefully when Supabase env vars are absent (shows a
"connect Supabase" state instead of crashing).

## Conventions

- Reads use the Supabase **anon** client (RLS allows select). Writes (import,
  profile edits, notes) go through the **service-role** client in server code only.
- Lusha access is server-only (`lib/lusha.ts`); the key never reaches the browser.
- Keep this an internal tool: no public write access via the anon key.
