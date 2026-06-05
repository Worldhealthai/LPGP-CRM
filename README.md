# LPGP Connect — CRM

Internal CRM for **LPGP Connect** covering finance, capital markets and private
markets. Companies are organised into three books — **LPs** (institutional
investors), **GPs** (fund managers & VCs) and **SPs** (solution providers) — and
each firm holds a roster of senior contacts. Leads are pulled in from **Lusha**.

## Features

- **Company cards** — one profile per firm, filterable by LP / GP / SP, with the
  people that work there.
- **Contact profiles** — first/last name, company, job title, LinkedIn, email,
  phone, country. Inline-editable; add free-text notes to any record.
- **Lusha import** — search Lusha by job title / country / firm from inside the
  app, preview the matches, and import the ones you want straight into Supabase.
- Built to scale into a deal-data intelligence platform later.

## Quick start

```bash
pnpm install
cp .env.local.example .env.local   # fill in Supabase + Lusha keys
pnpm dev                           # http://localhost:3000
```

### 1. Create the database

In the Supabase dashboard → **SQL Editor**, paste and run
[`supabase/schema.sql`](supabase/schema.sql). That single file creates
everything: the `companies`, `contacts` and `notes` tables, the `LP/GP/SP`
enum, all profile/visualization fields, and row-level-security policies. It's
idempotent, so it's safe to re-run.

> Prefer step-by-step migrations? Run the files in
> [`supabase/migrations/`](supabase/migrations) **in numeric order**
> (`0001` → `0002` → `0003`). Running a later one first fails with
> `relation "public.companies" does not exist` — that just means `0001`
> hasn't run yet.

### 2. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL (reads) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Anon key (reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Server writes (import/edits) — **secret** |
| `LUSHA_API_KEY` | Lusha dashboard → API | In-app lead import — **secret** |
| `APP_ACCESS_PASSWORD` | _optional_ | Set to require a shared password to enter |

Add the same variables in **Vercel → Project → Settings → Environment Variables**.

### 3. Deploy

```bash
pnpm dlx vercel --prod --yes
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Lusha.
