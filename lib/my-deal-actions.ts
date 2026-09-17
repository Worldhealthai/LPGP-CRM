"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import { findSimilarDeals, type DuplicateQuery, type DuplicateReport } from "./deal-duplicates";
import { clearOpsMatchCache, getOpsDeal } from "./ops";

export type ClaimResult = { ok: boolean; error?: string };

/**
 * Ask the tracker whether this deal already exists there.
 *
 * Returns candidates for a person to accept or reject — it never decides.
 */
export async function checkForExistingDeal(query: DuplicateQuery): Promise<DuplicateReport | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return findSimilarDeals(query);
}

/**
 * Claim an existing tracker deal as one of mine.
 *
 * Adds a link owned by this person and snapshots the deal, so "My deals" reads
 * correctly even when the bridge is down. Nothing about the deal itself is
 * changed — claiming is a CRM-side statement, not a tracker edit, so it can't
 * take a deal off the colleague whose initials are on it.
 */
export async function claimOpsDeal(dealId: number): Promise<ClaimResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const res = await getOpsDeal(Number(dealId));
  if (!res.ok) return { ok: false, error: res.error };

  const { error } = await supabase.from("ops_links").upsert(
    {
      entity_type: "user",
      entity_id: user.id,
      ops_deal_id: res.data.id,
      ops_company: res.data.company,
      confidence: 1,
      snapshot: { deal: res.data },
      linked_by: user.id,
    },
    { onConflict: "entity_type,entity_id,ops_deal_id" },
  );
  if (error) return { ok: false, error: error.message };

  clearOpsMatchCache();
  revalidatePath("/deals");
  return { ok: true };
}

/** Drop a claimed deal from My deals. The deal itself is untouched. */
export async function releaseOpsDeal(dealId: number): Promise<ClaimResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { error } = await supabase
    .from("ops_links")
    .delete()
    .eq("entity_type", "user")
    .eq("entity_id", user.id)
    .eq("ops_deal_id", Number(dealId));
  if (error) return { ok: false, error: error.message };

  revalidatePath("/deals");
  return { ok: true };
}

/** Pull a claimed deal's snapshot fresh from the tracker. */
export async function refreshMyDeal(dealId: number): Promise<ClaimResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const res = await getOpsDeal(Number(dealId));
  if (!res.ok) return { ok: false, error: res.error };

  await supabase
    .from("ops_links")
    .update({ snapshot: { deal: res.data }, synced_at: new Date().toISOString() })
    .eq("ops_deal_id", Number(dealId));

  clearOpsMatchCache();
  revalidatePath("/deals");
  return { ok: true };
}
