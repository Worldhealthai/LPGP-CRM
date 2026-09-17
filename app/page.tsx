import Link from "next/link";
import { CalendarClock, Flame, PhoneCall, PhoneOutgoing, Target, Timer } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { listLeads } from "@/lib/crm";
import { listAccounts } from "@/lib/accounts";
import { activityStats, listRecentActivities } from "@/lib/activities";
import { listOpsEvents, isOpsConfigured } from "@/lib/ops";
import { opsSummaries } from "@/lib/ops-links";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { buildQueue, formatDuration, isClosed } from "@/lib/sales";
import { STAGE_META } from "@/lib/pipeline";
import {
  ActivityFeed,
  ConnectRate,
  Kpi,
  OpsEventsPanel,
  SponsorStrip,
  StageFunnel,
} from "@/components/dashboard/panels";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Command centre — LPGP Connect" };

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function CommandCentre() {
  const user = await getSessionUser();

  const [leads, accounts, stats, activities, opsEvents, opsByAccount] = await Promise.all([
    listLeads(),
    listAccounts(),
    activityStats(user?.id ?? null),
    listRecentActivities(10),
    isOpsConfigured() ? listOpsEvents() : Promise.resolve(null),
    opsSummaries("account"),
  ]);

  const now = new Date();
  const mine = leads.filter((l) => !user || l.owner_id === user.id);
  const open = mine.filter((l) => !isClosed(l) && !l.do_not_call);
  const callbacksDue = open.filter(
    (l) => l.callback_at && new Date(l.callback_at).getTime() <= now.getTime(),
  );
  const neverCalled = open.filter((l) => (l.call_count ?? 0) === 0);
  const queue = buildQueue(leads, "my-open", user?.id ?? null, now.getTime());

  const openValue = mine
    .filter((l) => STAGE_META[l.stage]?.kind === "open")
    .reduce((n, l) => n + (l.value_usd ?? 0), 0);
  const wonValue = mine
    .filter((l) => STAGE_META[l.stage]?.kind === "won")
    .reduce((n, l) => n + (l.value_usd ?? 0), 0);

  const sponsorRows = accounts
    .map((a) => ({
      id: a.id,
      name: a.name,
      status: a.status,
      contacts: a.contact_count,
      events: (opsByAccount[a.id]?.events ?? []).map((e) => e.event_name),
    }))
    // Accounts with live allocations first — that's what the strip is for.
    .sort((a, b) => b.events.length - a.events.length || a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-[95rem] space-y-6 px-4 py-8 md:px-6">
      {/* Hero */}
      <header className="sheen relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.12] blur-3xl brand-gradient"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="eyebrow">Command centre</p>
            <h1 className="display mt-1.5 text-[1.85rem] leading-tight md:text-[2.4rem]">
              {greeting(now)}
              {user?.name ? (
                <>
                  , {user.name.split(" ")[0]}
                </>
              ) : null}
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
              {queue.length
                ? `${queue.length} lead${queue.length === 1 ? "" : "s"} queued${
                    callbacksDue.length
                      ? ` — ${callbacksDue.length} call-back${callbacksDue.length === 1 ? "" : "s"} already due.`
                      : ". Start at the top and work down."
                  }`
                : "Nothing queued. Import a list or pull a lead into the pipeline to get going."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/leads/workspace">
                <PhoneCall className="h-4 w-4" /> Start calling
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/import/leads">Import leads</Link>
            </Button>
          </div>
        </div>
      </header>

      {!isSupabaseConfigured() ? <SetupNotice /> : null}

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Calls today"
          value={String(stats.callsToday)}
          sub={
            stats.talkTimeToday
              ? `${formatDuration(stats.talkTimeToday)} on the phone`
              : "No talk time logged yet"
          }
          tone="brand"
          icon={<PhoneOutgoing className="h-4 w-4" />}
          href="/leads/workspace"
        />
        <ConnectRate calls={stats.callsThisWeek} connects={stats.connectsThisWeek} />
        <Kpi
          label="Open pipeline"
          value={formatUsd(openValue)}
          sub={`${open.length} open lead${open.length === 1 ? "" : "s"} · ${formatUsd(wonValue)} confirmed`}
          tone="neutral"
          icon={<Target className="h-4 w-4" />}
          href="/pipeline"
        />
        <Kpi
          label="Needs you now"
          value={String(callbacksDue.length + neverCalled.length)}
          sub={`${callbacksDue.length} call-back${callbacksDue.length === 1 ? "" : "s"} due · ${neverCalled.length} never called`}
          tone="ops"
          icon={<CalendarClock className="h-4 w-4" />}
          href="/leads/workspace"
        />
      </div>

      {/* Up next */}
      {queue.length ? (
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Up next</h2>
              <p className="text-xs text-muted-foreground">
                In queue order — overdue call-backs, then priority, then stalest.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/leads/workspace">Open workspace</Link>
            </Button>
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {queue.slice(0, 6).map((l) => {
              const due =
                l.callback_at && new Date(l.callback_at).getTime() <= now.getTime();
              return (
                <li key={l.id}>
                  <Link
                    href={`/leads/${l.id}`}
                    className="lift flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      {due ? (
                        <CalendarClock className="h-4 w-4 text-[var(--ops)]" />
                      ) : l.priority === "High" ? (
                        <Flame className="h-4 w-4 text-[var(--ops)]" />
                      ) : (
                        <Timer className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {l.company_name ?? "Unnamed"}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {l.contact_name ?? "No contact"} · {l.stage}
                        {due ? " · call-back due" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StageFunnel leads={leads} />
        <OpsEventsPanel
          events={opsEvents?.ok ? opsEvents.data : null}
          error={
            !isOpsConfigured()
              ? "Connect the ops panel in Settings to see event revenue here."
              : opsEvents && !opsEvents.ok
                ? opsEvents.error
                : null
          }
        />
        <ActivityFeed activities={activities} />
      </div>

      <SponsorStrip accounts={sponsorRows} />
    </div>
  );
}
