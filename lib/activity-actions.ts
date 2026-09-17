"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import { isLeadStage } from "./pipeline";
import type { ActivityType } from "./types";

export type ActivityResult = { ok: boolean; id?: string; error?: string };

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export type LogCallInput = {
  leadId?: string | null;
  accountId?: string | null;
  companyId?: string | null;
  contactId?: string | null;
  accountContactId?: string | null;
  type?: ActivityType;
  outcome?: string | null;
  subject?: string | null;
  body?: string | null;
  durationSeconds?: number | null;
  /** Move the lead to this stage as part of the same save. */
  stage?: string | null;
  /** ISO timestamp for a promised call-back, or null to clear one. */
  callbackAt?: string | null;
  /** Mark the lead do-not-call (wrong number, opted out). */
  doNotCall?: boolean;
};

/**
 * Log one touch and roll the parent lead forward in a single call.
 *
 * The call console leans on this: it writes the activity, stamps the
 * disposition, recounts calls, schedules the call-back and optionally moves
 * the stage — so "Save & next" is one round-trip.
 */
export async function logActivity(input: LogCallInput): Promise<ActivityResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const leadId = clean(input.leadId);
  const accountId = clean(input.accountId);
  const type: ActivityType = input.type ?? "call";
  const outcome = clean(input.outcome);
  const body = clean(input.body);

  if (!leadId && !accountId && !input.companyId && !input.contactId) {
    return { ok: false, error: "An activity needs something to attach to." };
  }
  // A call with neither an outcome nor a note records nothing useful.
  if (type === "call" && !outcome && !body) {
    return { ok: false, error: "Pick an outcome or write a note before saving." };
  }

  const occurredAt = new Date().toISOString();
  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      type,
      outcome,
      subject: clean(input.subject),
      body,
      duration_seconds:
        typeof input.durationSeconds === "number" && input.durationSeconds > 0
          ? Math.round(input.durationSeconds)
          : null,
      occurred_at: occurredAt,
      owner_id: user.id,
      lead_id: leadId,
      account_id: accountId,
      company_id: clean(input.companyId),
      contact_id: clean(input.contactId),
      account_contact_id: clean(input.accountContactId),
    })
    .select("id")
    .single();
  if (error || !activity) return { ok: false, error: error?.message ?? "Could not log activity" };

  if (leadId) {
    const patch: Record<string, unknown> = { last_activity_at: occurredAt };
    if (outcome) patch.disposition = outcome;

    // Recount rather than increment: a count is self-healing if a write was
    // ever lost, and two reps on one lead can't clobber each other's tally.
    if (type === "call") {
      const { count } = await supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("lead_id", leadId)
        .eq("type", "call");
      patch.call_count = count ?? 0;
    }

    if (input.stage && isLeadStage(input.stage)) patch.stage = input.stage;
    if (input.callbackAt !== undefined) patch.callback_at = clean(input.callbackAt);
    if (input.doNotCall) patch.do_not_call = true;

    await supabase.from("leads").update(patch).eq("id", leadId);
  }

  if (accountId) {
    revalidatePath(`/accounts/${accountId}`);
  }
  if (leadId) {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/leads/workspace");
  }
  revalidatePath("/");
  return { ok: true, id: activity.id };
}

export async function deleteActivity(id: string): Promise<ActivityResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { data: row } = await supabase
    .from("activities")
    .select("owner_id, lead_id, account_id")
    .eq("id", id)
    .single();
  if (!row) return { ok: false, error: "Activity not found" };
  if (user.role !== "admin" && row.owner_id !== user.id) {
    return { ok: false, error: "That activity belongs to someone else." };
  }

  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (row.lead_id) revalidatePath(`/leads/${row.lead_id}`);
  if (row.account_id) revalidatePath(`/accounts/${row.account_id}`);
  return { ok: true };
}

// --- Tasks ------------------------------------------------------------------

export async function createTask(input: {
  title: string;
  notes?: string | null;
  dueDate?: string | null;
  priority?: string;
  leadId?: string | null;
  accountId?: string | null;
}): Promise<ActivityResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const title = clean(input.title);
  if (!title) return { ok: false, error: "A task needs a title." };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      notes: clean(input.notes),
      due_date: clean(input.dueDate),
      priority: clean(input.priority) ?? "Normal",
      owner_id: user.id,
      lead_id: clean(input.leadId),
      account_id: clean(input.accountId),
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create task" };

  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function toggleTask(id: string, done: boolean): Promise<ActivityResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { error } = await supabase
    .from("tasks")
    .update({ done, done_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteTask(id: string): Promise<ActivityResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true };
}
