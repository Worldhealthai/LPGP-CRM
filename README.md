# LPGP Connect — Sales CRM

The sales side of **LPGP Connect** (finance, capital markets, private markets).
Companies sit in three books — **LPs** (institutional investors), **GPs** (fund
managers & VCs) and **SPs** (solution providers) — each with a roster of senior
contacts.

It runs alongside the **ops panel** (`TrackerLPGP`), which holds signed deals,
invoices and how each sponsor's money is allocated across events. That panel
stays the single source of truth for money; this CRM reads it, and can
optionally record deals into it.

> Add **Barings** to the pipeline and the form tells you it's already a deal in
> the tracker — £4,000 across Berlin and CFO Miami, invoice paid — and links the
> two records when you accept.

## Features

### Selling

- **Command centre** — calls made today, connect rate, open pipeline, what needs
  you now, plus the queue's next six leads and live event revenue from the tracker.
- **Call workspace** (`/leads/workspace`) — work a queue one lead at a time:
  click to dial, a running timer, eight one-key dispositions, notes, stage change
  and call-back scheduling, then **Save & next**. Overdue call-backs sort first,
  then high priority, then never-called, then the stalest lead — so working
  top-to-bottom is always the right order. `1`–`8` pick an outcome, `c` dials,
  `n`/`p` move, `⌘↵` saves.
- **Pipeline board** — drag leads between stages, filter by market or owner.
- **Accounts** — one record per sponsor won, with tabs for **points of contact**
  (full CRUD, one primary each), **events & money** (allocations straight from
  the tracker), activity and notes. Calling or emailing a contact from the card
  logs it, so the timeline can't overstate how often you've been in touch.
- **Spreadsheet import** — drop in an `.xlsx`/`.csv`, confirm the auto-matched
  columns, and import. Duplicates are filtered against the pipeline *and* within
  the file, and any company already sponsoring an event is flagged and linked.
- **Event performance** — every event in the ops panel against a target you set
  here, with per-portfolio roll-ups across the seven programme series, and an
  expandable list of who is sponsoring each event and who has paid.
- **⌘K palette** — jump to any page or search leads, sponsors, firms and people.

### Intelligence database

- **Company cards** — one profile per firm, filterable by LP / GP / SP.
- **Contact profiles** — inline-editable, with free-text notes on any record.
- **Search** — searches your whole database live, and can look people up in
  **Lusha** on demand; every result is labelled with its source.
- **Lusha import** and **CSV export** for contacts and companies.

## Quick start

```bash
pnpm install
cp .env.local.example .env.local   # fill in Supabase (+ Lusha, + ops panel)
pnpm dev                           # http://localhost:3000
```

### 1. Create the database

In the Supabase dashboard → **SQL Editor**, paste and run
[`supabase/schema.sql`](supabase/schema.sql). That single file creates
everything — the intelligence tables, the leads pipeline, the sales layer
(accounts, points of contact, activities, tasks, ops links) and event targets.
It's idempotent, so it's safe to re-run.

> Prefer step-by-step migrations? Run the files in
> [`supabase/migrations/`](supabase/migrations) **in numeric order**
> (`0001` → … → `0009`). Running a later one first fails with
> `relation "public.companies" does not exist` — that just means `0001`
> hasn't run yet.

### 2. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL (reads) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Anon key (reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Server writes (import/edits) — **secret** |
| `LUSHA_API_KEY` | Lusha dashboard → API | In-app lead import — **secret** |
| `ADMIN_EMAILS` | _optional_ | Comma-separated super admins |
| `OPS_PANEL_URL` | _optional_ | The tracker's origin, no trailing slash |
| `OPS_BRIDGE_KEY` | _optional_ | Read secret, **identical on both apps** — **secret** |
| `OPS_BRIDGE_WRITE_KEY` | _optional_ | Write secret — a **different** value, also on both apps |

Add the same variables in **Vercel → Project → Settings → Environment Variables**.

### 3. Connect the ops panel

Skip this and the CRM simply hides every ops-panel feature.

```bash
openssl rand -hex 32          # generate the shared secret
```

1. On **TrackerLPGP**, set `OPS_BRIDGE_KEY` to that value and redeploy.
2. Here, set `OPS_PANEL_URL` to the tracker's URL and `OPS_BRIDGE_KEY` to the
   same value.
3. Open **Settings** — it performs a live handshake and reports the deal, event
   and allocation counts it can see. A wrong key says so there rather than
   failing quietly later.

The tracker exposes a `/api/bridge/*` surface guarded by that secret. Reads are
all you need for the match notice, account allocations and Event performance.

**Recording deals from the CRM** is optional and off by default. Set a *second*,
different secret as `OPS_BRIDGE_WRITE_KEY` on both apps and a "Record deal"
action appears on accounts and events: it writes the deal, its per-event
allocation and the invoice file straight into the tracker. The tracker stays
the single source of truth for money — the CRM becomes a second front-end onto
it, not a second copy of it. Keeping the keys separate means a leaked read key
can never create a financial record.

### 4. Deploy

```bash
pnpm dlx vercel --prod --yes
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Lusha.
