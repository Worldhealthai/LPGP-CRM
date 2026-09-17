# LPGP Connect — Sales CRM

The sales side of LPGP Connect (finance, capital markets, private markets).
Two apps, two databases, one link:

| App | Repo | Role | Store |
| --- | --- | --- | --- |
| **Sales CRM** (this repo) | `LPGP-CRM` | Prospecting, calling, sponsor accounts | Supabase |
| **Ops panel** | `TrackerLPGP` | Signed deals, invoices, event allocations | Neon Postgres |

The ops panel is the **source of truth** for money. The CRM reads it and never
writes to it.

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

`supabase/schema.sql` is the consolidated schema; `supabase/migrations/` has the
same thing split in numeric order. Both are idempotent.

- **Intelligence** (0001–0006) — `companies`, `contacts`, `notes`, `funds`,
  `commitments`, `service_relationships`.
- **Pipeline** (0007) — `profiles`, `leads` with the `lead_stage` enum.
- **Sales layer** (0008) — `accounts` (sponsors won), `account_contacts` (points
  of contact, one primary each via a unique partial index), `activities` (the
  call/email log behind every timeline), `tasks`, `ops_links`, `lead_imports`.

The app degrades gracefully when Supabase env vars are absent (shows a
"connect Supabase" state instead of crashing).

## The ops-panel bridge

`OPS_PANEL_URL` + `OPS_BRIDGE_KEY` connect the two apps. The tracker exposes a
read-only `/api/bridge/*` surface guarded by the same shared secret; Settings
does a live handshake so a wrong key says so immediately.

- `lib/ops.ts` — server-only transport. **Every call returns a tagged result
  instead of throwing**: an ops outage must degrade a page, not break it.
- `lib/ops-types.ts` — payload shapes and formatters, free of `server-only` so
  client components can render a match without pulling transport into the bundle.
- `lib/ops-links.ts` — stored links and their snapshots.

**Fuzzy matching lives on the tracker** (`bridge.js`), so there is one scoring
implementation. The CRM only ever does exact-key comparison (`opsMatchKey`), and
only for bulk import reconciliation — anything less certain goes through the
per-lead notice where a human confirms it.

Each `ops_links` row snapshots the bridge payload, so a sponsor's event
allocations still render when the tracker is unreachable.

## Conventions

- Reads use the Supabase **anon** client (RLS allows select). Writes (import,
  profile edits, notes, activities) go through the **service-role** client in
  server code only.
- Lusha access is server-only (`lib/lusha.ts`); the key never reaches the browser.
- Keep this an internal tool: no public write access via the anon key.
- Money is **per-currency, never cross-summed** — the tracker holds GBP, USD,
  EUR and CHF deals, and adding them into one figure would be a lie.
- Client state is **derived, not reset in effects** (results carry the query or
  id they answer). The React Compiler lint is enforced; don't reach for an
  escape hatch, restructure instead.
- The serif `.display` class is for page titles and hero figures only — dense
  table pages stay in the sans face.
