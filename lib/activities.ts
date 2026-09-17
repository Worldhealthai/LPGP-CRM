import { getReadClient } from "./supabase/server";
import type { Activity, ActivityWithRefs, LeadOwner, Task } from "./types";

/** Every touch on a lead, account or company — the timeline behind each record. */

async function hydrateOwners(
  supabase: NonNullable<ReturnType<typeof getReadClient>>,
  rows: Activity[],
): Promise<ActivityWithRefs[]> {
  if (!rows.length) return [];
  const ownerIds = [...new Set(rows.map((r) => r.owner_id).filter(Boolean))] as string[];
  const leadIds = [...new Set(rows.map((r) => r.lead_id).filter(Boolean))] as string[];
  const accountIds = [...new Set(rows.map((r) => r.account_id).filter(Boolean))] as string[];

  const [owners, leads, accounts] = await Promise.all([
    ownerIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", ownerIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    leadIds.length
      ? supabase.from("leads").select("id, company_name").in("id", leadIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    accountIds.length
      ? supabase.from("accounts").select("id, name").in("id", accountIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ]);

  const ownerMap = new Map<string, LeadOwner>();
  for (const o of owners.data ?? []) ownerMap.set(o.id, o as LeadOwner);
  const leadMap = new Map<string, string>();
  for (const l of (leads.data ?? []) as { id: string; company_name: string | null }[]) {
    leadMap.set(l.id, l.company_name ?? "");
  }
  const accountMap = new Map<string, string>();
  for (const a of (accounts.data ?? []) as { id: string; name: string }[]) {
    accountMap.set(a.id, a.name);
  }

  return rows.map((r) => ({
    ...r,
    owner: r.owner_id ? ownerMap.get(r.owner_id) ?? null : null,
    lead_name: r.lead_id ? leadMap.get(r.lead_id) ?? null : null,
    account_name: r.account_id ? accountMap.get(r.account_id) ?? null : null,
  }));
}

export async function listActivitiesFor(
  column: "lead_id" | "account_id" | "company_id" | "contact_id",
  id: string,
  limit = 100,
): Promise<ActivityWithRefs[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq(column, id)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return hydrateOwners(supabase, (data as Activity[]) ?? []);
}

export async function listRecentActivities(limit = 40): Promise<ActivityWithRefs[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("activities")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return hydrateOwners(supabase, (data as Activity[]) ?? []);
}

export type ActivityStats = {
  callsToday: number;
  callsThisWeek: number;
  connectsThisWeek: number;
  talkTimeToday: number;
};

/** Headline activity numbers for one user (or the whole team when null). */
export async function activityStats(ownerId: string | null): Promise<ActivityStats> {
  const empty: ActivityStats = {
    callsToday: 0,
    callsThisWeek: 0,
    connectsThisWeek: 0,
    talkTimeToday: 0,
  };
  const supabase = getReadClient();
  if (!supabase) return empty;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  let q = supabase
    .from("activities")
    .select("occurred_at, outcome, duration_seconds")
    .eq("type", "call")
    .gte("occurred_at", weekAgo);
  if (ownerId) q = q.eq("owner_id", ownerId);
  const { data } = await q;
  if (!data) return empty;

  const rows = data as { occurred_at: string; outcome: string | null; duration_seconds: number | null }[];
  const stats = { ...empty };
  for (const r of rows) {
    stats.callsThisWeek++;
    if (r.outcome === "Connected" || r.outcome === "Meeting booked") stats.connectsThisWeek++;
    if (r.occurred_at >= startOfToday) {
      stats.callsToday++;
      stats.talkTimeToday += r.duration_seconds ?? 0;
    }
  }
  return stats;
}

// --- Tasks ------------------------------------------------------------------

export async function listOpenTasks(ownerId: string | null, limit = 50): Promise<Task[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  let q = supabase
    .from("tasks")
    .select("*")
    .eq("done", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (ownerId) q = q.eq("owner_id", ownerId);
  const { data } = await q;
  return (data as Task[]) ?? [];
}
